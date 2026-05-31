<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdatePerusahaanRequest;
use App\Http\Resources\PerusahaanResource;
use App\Models\Perusahaan;
use Illuminate\Http\Request;

class PerusahaanController extends Controller
{
    /**
     * Display a listing of companies with search and sort.
     */
    public function index(Request $request)
    {
        $query = Perusahaan::query();

        // Search by company name
        if ($request->filled('search')) {
            $query->where('nama_perusahaan', 'like', '%' . $request->search . '%');
        }

        // Filter/Sort: latest (default) or oldest
        if ($request->filled('sort') && $request->sort === 'oldest') {
            $query->orderBy('created_at', 'asc');
        } else {
            $query->orderBy('created_at', 'desc'); // default to latest
        }

        $companies = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar perusahaan berhasil diambil.',
            'data' => PerusahaanResource::collection($companies)
        ], 200);
    }

    /**
     * Display the specified company with its historical PKS agreements.
     */
    public function show($id)
    {
        // Load company and eagerly load its PKS records
        $perusahaan = Perusahaan::with(['dataPks' => function($q) {
            $q->orderBy('tanggal_mulai', 'desc');
        }])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail perusahaan berhasil diambil.',
            'data' => new PerusahaanResource($perusahaan)
        ], 200);
    }

    /**
     * Update the specified company details in storage.
     */
    public function update(UpdatePerusahaanRequest $request, $id)
    {
        $perusahaan = Perusahaan::findOrFail($id);

        $perusahaan->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Data perusahaan berhasil diperbarui.',
            'data' => new PerusahaanResource($perusahaan)
        ], 200);
    }
}
