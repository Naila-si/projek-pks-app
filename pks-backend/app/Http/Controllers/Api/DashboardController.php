<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DataPKS;
use App\Models\Perusahaan;
use App\Services\NotificationService;
use App\Http\Resources\PksResource;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get Dashboard Data & Analytics
     */
    public function index(Request $request)
    {
        // Automatically scan and generate notifications
        NotificationService::generateNotifications();

        $today = Carbon::today();
        $soonThreshold = Carbon::today()->addDays(30);

        // Core Counts
        $totalPks = DataPKS::count();
        $totalPerusahaan = Perusahaan::count();

        // Expiring Soon (0 <= remaining days <= 30)
        $totalPksSegeraBerakhir = DataPKS::whereBetween('tanggal_berakhir', [$today, $soonThreshold])->count();

        // Expired (remaining days < 0)
        $totalPksBerakhir = DataPKS::where('tanggal_berakhir', '<', $today)->count();

        // Active (remaining days > 30)
        $totalPksAktif = DataPKS::where('tanggal_berakhir', '>', $soonThreshold)->count();

        // Bidang PKS Distribution
        $daftarBidang = ['IW', 'SW', 'pelayanan', 'umum', 'HC', 'keuangan', 'tjsl'];
        $dataGrafikBidang = [];
        foreach ($daftarBidang as $b) {
            $dataGrafikBidang[] = [
                'bidang' => $b,
                'jumlah' => DataPKS::where('bidang', $b)->count()
            ];
        }

        // List of PKS that are ending soon (eager load perusahaan for the dashboard table)
        $pksSegeraBerakhirList = DataPKS::with('perusahaan')
            ->whereBetween('tanggal_berakhir', [$today, $soonThreshold])
            ->orderBy('tanggal_berakhir', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Data dashboard berhasil diambil.',
            'data' => [
                'total_pks' => $totalPks,
                'total_perusahaan' => $totalPerusahaan,
                'total_pks_segera_berakhir' => $totalPksSegeraBerakhir,
                'total_pks_berakhir' => $totalPksBerakhir,
                'total_pks_aktif' => $totalPksAktif,
                
                // Chart datasets for easy rendering on frontend
                'data_grafik_bidang_pks' => $dataGrafikBidang,
                'data_grafik_status_pks' => [
                    ['status' => 'Aktif', 'jumlah' => $totalPksAktif],
                    ['status' => 'Segera Berakhir', 'jumlah' => $totalPksSegeraBerakhir],
                    ['status' => 'Berakhir', 'jumlah' => $totalPksBerakhir]
                ],
                
                // Table of expiring PKS formatted using PksResource
                'daftar_pks_segera_berakhir' => PksResource::collection($pksSegeraBerakhirList)
            ]
        ], 200);
    }
}
