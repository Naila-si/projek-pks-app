<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DataPKS;
use App\Models\Perusahaan;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ExportController extends Controller
{
    /**
     * Export PKS Data (Excel/CSV) with applied filters.
     */
    public function exportPks(Request $request)
    {
        $query = DataPKS::with('perusahaan');

        // Apply identical search/filter logic as PksController@index
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nomor_pks', 'like', '%' . $search . '%')
                  ->orWhereHas('perusahaan', function($qp) use ($search) {
                      $qp->where('nama_perusahaan', 'like', '%' . $search . '%');
                  });
            });
        }

        if ($request->filled('bidang')) {
            $query->where('bidang', $request->bidang);
        }

        if ($request->filled('status')) {
            $status = $request->status;
            $today = Carbon::today();
            $soonThreshold = Carbon::today()->addDays(30);

            if ($status === 'Aktif') {
                $query->where('tanggal_berakhir', '>', $soonThreshold);
            } elseif ($status === 'Segera Berakhir') {
                $query->whereBetween('tanggal_berakhir', [$today, $soonThreshold]);
            } elseif ($status === 'Berakhir') {
                $query->where('tanggal_berakhir', '<', $today);
            }
        }

        $records = $query->orderBy('created_at', 'desc')->get();
        $format = strtolower($request->query('format', 'csv'));

        $headers = [
            'Nama Perusahaan Mitra', 'Alamat Perusahaan', 'Nomor Kontrak PKS', 
            'Bidang', 'Tanggal Mulai', 
            'Masa Berakhir', 'Status PKS'
        ];

        $dataRows = [];
        foreach ($records as $record) {
            $dataRows[] = [
                $record->perusahaan ? $record->perusahaan->nama_perusahaan : '-',
                $record->perusahaan ? ($record->perusahaan->alamat ?? '-') : '-',
                $record->nomor_pks,
                $record->bidang,
                $record->tanggal_mulai,
                $record->tanggal_berakhir,
                $record->status_pks
            ];
        }

        $filename = 'pks_export_' . Carbon::now()->format('Ymd_His');

        if ($format === 'xlsx') {
            return $this->respondExcel($filename . '.xlsx', 'Data PKS Jasa Raharja', $headers, $dataRows);
        }

        return $this->respondCsv($filename . '.csv', $headers, $dataRows);
    }

    /**
     * Export Perusahaan Data (Excel/CSV) with applied filters/sorting.
     */
    public function exportPerusahaan(Request $request)
    {
        $query = Perusahaan::with('dataPks');

        // Apply identical search/sort logic as PerusahaanController@index
        if ($request->filled('search')) {
            $query->where('nama_perusahaan', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('sort') && $request->sort === 'oldest') {
            $query->orderBy('created_at', 'asc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $records = $query->get();
        $format = strtolower($request->query('format', 'csv'));

        $headers = [
            'Nama Perusahaan', 'Nama Pengelola', 'Alamat', 
            'Email', 'Nomor Telepon', 'Status PKS', 'Tanggal Terdaftar'
        ];

        $dataRows = [];
        foreach ($records as $record) {
            $companyPks = $record->dataPks;
            $overallStatus = 'Tidak Aktif';
            
            if ($companyPks->count() > 0) {
                $statuses = $companyPks->map(function($p) {
                    return $p->status_pks;
                })->toArray();
                
                if (in_array('Berakhir', $statuses)) {
                    $overallStatus = 'Berakhir';
                } elseif (in_array('Segera Berakhir', $statuses)) {
                    $overallStatus = 'Segera Berakhir';
                } elseif (in_array('Aktif', $statuses)) {
                    $overallStatus = 'Aktif';
                }
            }

            $dataRows[] = [
                $record->nama_perusahaan,
                $record->nama_pengelola,
                $record->alamat,
                $record->email ?? '-',
                $record->nomor_telepon,
                $overallStatus,
                $record->created_at->format('Y-m-d H:i:s')
            ];
        }

        $filename = 'perusahaan_export_' . Carbon::now()->format('Ymd_His');

        if ($format === 'xlsx') {
            return $this->respondExcel($filename . '.xlsx', 'Data Perusahaan Rekanan', $headers, $dataRows);
        }

        return $this->respondCsv($filename . '.csv', $headers, $dataRows);
    }

    /**
     * Helper to generate a clean streamed CSV download
     */
    private function respondCsv($filename, $headers, $dataRows)
    {
        return response()->streamDownload(function() use ($headers, $dataRows) {
            $file = fopen('php://output', 'w');
            
            // Output UTF-8 BOM for MS Excel compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            // Add column headers
            fputcsv($file, $headers);
            
            // Add data rows
            foreach ($dataRows as $row) {
                fputcsv($file, $row);
            }
            
            fclose($file);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Helper to generate a styled Office XML/HTML-based Excel spreadsheet download
     */
    private function respondExcel($filename, $title, $headers, $dataRows)
    {
        $html = '
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta http-equiv="Content-type" content="text/html;charset=utf-8" />
            <!--[if gte mso 9]>
            <xml>
                <x:ExcelWorkbook>
                    <x:ExcelWorksheets>
                        <x:ExcelWorksheet>
                            <x:Name>' . substr($title, 0, 31) . '</x:Name>
                            <x:WorksheetOptions>
                                <x:DisplayGridlines/>
                            </x:WorksheetOptions>
                        </x:ExcelWorksheet>
                    </x:ExcelWorksheets>
                </x:ExcelWorkbook>
            </xml>
            <![endif]-->
            <style>
                table { border-collapse: collapse; }
                th { background-color: #2F4F4F; color: #FFFFFF; font-weight: bold; border: 1px solid #000000; padding: 6px; }
                td { border: 1px solid #000000; padding: 6px; }
                .title-row { font-size: 16px; font-weight: bold; height: 35px; text-align: center; }
            </style>
        </head>
        <body>
            <table>
                <tr>
                    <td colspan="' . count($headers) . '" class="title-row">' . strtoupper($title) . '</td>
                </tr>
                <tr>
                    <td colspan="' . count($headers) . '" style="height: 10px; border: none;"></td>
                </tr>
                <tr>';
        
        foreach ($headers as $header) {
            $html .= '<th>' . htmlspecialchars($header) . '</th>';
        }
        
        $html .= '</tr>';
        
        foreach ($dataRows as $row) {
            $html .= '<tr>';
            foreach ($row as $val) {
                // Ensure text is printed correctly
                $html .= '<td>' . htmlspecialchars($val) . '</td>';
            }
            $html .= '</tr>';
        }
        
        $html .= '
            </table>
        </body>
        </html>';

        return response($html, 200, [
            'Content-Type' => 'application/vnd.ms-excel',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control' => 'max-age=0',
        ]);
    }
}
