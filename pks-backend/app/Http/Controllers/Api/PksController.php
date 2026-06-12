<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePKSRequest;
use App\Http\Requests\UpdatePKSRequest;
use App\Http\Resources\PksResource;
use App\Models\DataPKS;
use App\Models\Perusahaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class PksController extends Controller
{
    /**
     * Display a listing of PKS records with search and filters.
     */
    public function index(Request $request)
    {
        $query = DataPKS::with('perusahaan');

        // Search by nomor_pks or perusahaan name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nomor_pks', 'like', '%' . $search . '%')
                  ->orWhereHas('perusahaan', function($qp) use ($search) {
                      $qp->where('nama_perusahaan', 'like', '%' . $search . '%');
                  });
            });
        }

        // Filter by bidang
        if ($request->filled('bidang')) {
            $query->where('bidang', $request->bidang);
        }

        // Filter by status_pks (Aktif, Segera Berakhir, Berakhir)
        // Since status is dynamically calculated from tanggal_berakhir, we query using date thresholds:
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

        $pksRecords = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar seluruh PKS berhasil diambil.',
            'data' => PksResource::collection($pksRecords)
        ], 200);
    }

    /**
     * Store a newly created PKS record in storage.
     */
    public function store(StorePKSRequest $request)
    {
        $id_perusahaan = $request->id_perusahaan;

        // If id_perusahaan is not provided, create a new company profile on the fly
        if (!$id_perusahaan) {
            $perusahaan = Perusahaan::create([
                'nama_perusahaan' => $request->nama_perusahaan,
                'nama_pengelola' => $request->nama_pengelola,
                'alamat' => $request->alamat,
                'email' => $request->email,
                'nomor_telepon' => $request->nomor_telepon,
            ]);
            $id_perusahaan = $perusahaan->id_perusahaan;
        }

        // Upload PKS Document (PDF)
        $filename = null;
        if ($request->hasFile('dokumen_pks')) {
            $file = $request->file('dokumen_pks');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->storeAs('public/pks', $filename);
        }

        $pks = DataPKS::create([
            'nomor_pks' => $request->nomor_pks,
            'judul_pks' => $request->judul_pks,
            'bidang' => $request->bidang,
            'tanggal_mulai' => $request->tanggal_mulai,
            'tanggal_berakhir' => $request->tanggal_berakhir,
            'tanggal_addendum' => $request->tanggal_addendum,
            'dokumen_pks' => $filename,
            'id_perusahaan' => $id_perusahaan,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data PKS berhasil ditambahkan.',
            'data' => new PksResource($pks->load('perusahaan'))
        ], 201);
    }

    /**
     * Display the specified PKS details.
     */
    public function show($id)
    {
        $pks = DataPKS::with('perusahaan')->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail PKS berhasil diambil.',
            'data' => new PksResource($pks)
        ], 200);
    }

    /**
     * Update the specified PKS record in storage.
     */
    public function update(UpdatePKSRequest $request, $id)
    {
        $pks = DataPKS::findOrFail($id);

        $filename = $pks->dokumen_pks;

        // If a new PDF is uploaded, replace the old one
        if ($request->hasFile('dokumen_pks')) {
            // Delete old file
            if ($pks->dokumen_pks) {
                Storage::delete('public/pks/' . $pks->dokumen_pks);
            }

            $file = $request->file('dokumen_pks');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->storeAs('public/pks', $filename);
        }

        $pks->update([
            'nomor_pks' => $request->nomor_pks,
            'judul_pks' => $request->judul_pks,
            'bidang' => $request->bidang,
            'tanggal_mulai' => $request->tanggal_mulai,
            'tanggal_berakhir' => $request->tanggal_berakhir,
            'tanggal_addendum' => $request->tanggal_addendum,
            'dokumen_pks' => $filename,
            'id_perusahaan' => $request->id_perusahaan,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data PKS berhasil diperbarui.',
            'data' => new PksResource($pks->load('perusahaan'))
        ], 200);
    }

    public function destroy($id)
    {
        $pks = DataPKS::findOrFail($id);
        $id_perusahaan = $pks->id_perusahaan;

        // Hapus file fisik PDF jika ada di server disk
        if ($pks->dokumen_pks) {
            Storage::delete('public/pks/' . $pks->dokumen_pks);
        }

        $pks->delete();

        // Pengecekan cascade delete perusahaan rekanan jika tidak ada kontrak PKS lain
        if ($id_perusahaan) {
            $otherPksCount = DataPKS::where('id_perusahaan', $id_perusahaan)->count();
            if ($otherPksCount === 0) {
                $perusahaan = Perusahaan::find($id_perusahaan);
                if ($perusahaan) {
                    $perusahaan->delete();
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Data PKS berhasil dihapus.'
        ], 200);
    }

    /**
     * Download or view the PKS PDF document securely.
     */
    public function downloadDokumen($id)
    {
        $pks = DataPKS::findOrFail($id);

        if (!$pks->dokumen_pks) {
            return response()->json([
                'success' => false,
                'message' => 'Dokumen PKS tidak ditemukan.'
            ], 404);
        }

        $filePath = 'public/pks/' . $pks->dokumen_pks;

        if (!Storage::exists($filePath)) {
            return response()->json([
                'success' => false,
                'message' => 'Berkas PKS tidak ditemukan di server.'
            ], 404);
        }

        return Storage::response($filePath);
    }
}
