<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAddendumRequest;
use App\Http\Requests\UpdateAddendumRequest;
use App\Http\Resources\AddendumResource;
use App\Models\AddendumPKS;
use App\Models\DataPKS;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class AddendumController extends Controller
{
    /**
     * Store a newly created Addendum record in storage.
     */
    public function store(StoreAddendumRequest $request)
    {
        $filename = null;
        if ($request->hasFile('dokumen_addendum')) {
            $file = $request->file('dokumen_addendum');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->storeAs('public/pks', $filename);
        }

        // Generate number atomically using DB transaction
        $addendum = \DB::transaction(function() use ($request, $filename) {
            $nomorAddendum = $request->nomor_addendum;

            if (empty($nomorAddendum)) {
                $year = Carbon::parse($request->tanggal_mulai)->year;

                // 1. Get max sequence from data_pks
                $latestPks = DataPKS::where('nomor_pks', 'like', "P/%/SP/{$year}")
                    ->lockForUpdate()
                    ->orderByRaw("CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(nomor_pks, '/', 2), '/', -1) AS UNSIGNED) DESC")
                    ->first();

                $pksSeq = 0;
                if ($latestPks) {
                    $parts = explode('/', $latestPks->nomor_pks);
                    if (count($parts) >= 2) {
                        $pksSeq = (int)$parts[1];
                    }
                }

                // 2. Get max sequence from addendum_pks
                $latestAddendum = AddendumPKS::where('nomor_addendum', 'like', "P/%/SP/{$year}")
                    ->lockForUpdate()
                    ->orderByRaw("CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(nomor_addendum, '/', 2), '/', -1) AS UNSIGNED) DESC")
                    ->first();

                $addendumSeq = 0;
                if ($latestAddendum) {
                    $parts = explode('/', $latestAddendum->nomor_addendum);
                    if (count($parts) >= 2) {
                        $addendumSeq = (int)$parts[1];
                    }
                }

                // 3. Get absolute max and increment
                $maxSeq = max($pksSeq, $addendumSeq);
                $nextSeq = $maxSeq + 1;

                $formattedSequence = str_pad($nextSeq, 3, '0', STR_PAD_LEFT);
                $nomorAddendum = "P/{$formattedSequence}/SP/{$year}";
            }

            return AddendumPKS::create([
                'id_pks' => $request->id_pks,
                'nomor_addendum' => $nomorAddendum,
                'judul_addendum' => $request->judul_addendum,
                'tanggal_mulai' => $request->tanggal_mulai,
                'tanggal_berakhir' => $request->tanggal_berakhir,
                'dokumen_addendum' => $filename,
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Dokumen Addendum berhasil ditambahkan.',
            'data' => new AddendumResource($addendum)
        ], 201);
    }

    /**
     * Display the specified Addendum details.
     */
    public function show($id)
    {
        $addendum = AddendumPKS::findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail Addendum berhasil diambil.',
            'data' => new AddendumResource($addendum)
        ], 200);
    }

    /**
     * Update the specified Addendum record in storage.
     */
    public function update(UpdateAddendumRequest $request, $id)
    {
        $addendum = AddendumPKS::findOrFail($id);

        $filename = $addendum->dokumen_addendum;

        if ($request->hasFile('dokumen_addendum')) {
            if ($addendum->dokumen_addendum) {
                Storage::delete('public/pks/' . $addendum->dokumen_addendum);
            }

            $file = $request->file('dokumen_addendum');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->storeAs('public/pks', $filename);
        }

        $addendum->update([
            'nomor_addendum' => $request->nomor_addendum,
            'judul_addendum' => $request->judul_addendum,
            'tanggal_mulai' => $request->tanggal_mulai,
            'tanggal_berakhir' => $request->tanggal_berakhir,
            'dokumen_addendum' => $filename,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Dokumen Addendum berhasil diperbarui.',
            'data' => new AddendumResource($addendum)
        ], 200);
    }

    /**
     * Remove the specified Addendum record from storage.
     */
    public function destroy($id)
    {
        $addendum = AddendumPKS::findOrFail($id);

        if ($addendum->dokumen_addendum) {
            Storage::delete('public/pks/' . $addendum->dokumen_addendum);
        }

        $addendum->delete();

        return response()->json([
            'success' => true,
            'message' => 'Dokumen Addendum berhasil dihapus.'
        ], 200);
    }

    /**
     * Download or view the Addendum PDF document.
     */
    public function downloadDokumen($id)
    {
        $addendum = AddendumPKS::findOrFail($id);

        if (!$addendum->dokumen_addendum) {
            return response()->json([
                'success' => false,
                'message' => 'Dokumen Addendum tidak ditemukan.'
            ], 404);
        }

        $filePath = 'public/pks/' . $addendum->dokumen_addendum;

        if (!Storage::exists($filePath)) {
            return response()->json([
                'success' => false,
                'message' => 'Berkas Addendum tidak ditemukan di server.'
            ], 404);
        }

        return Storage::response($filePath);
    }
}
