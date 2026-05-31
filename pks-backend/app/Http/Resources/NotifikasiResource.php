<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotifikasiResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $pks = $this->dataPks;
        $companyName = null;
        $statusPks = null;
        $tanggalBerakhir = null;
        $actionType = null;
        $actionId = null;
        $actionUrl = null;

        if ($pks) {
            $statusPks = $pks->status_pks;
            $tanggalBerakhir = $pks->tanggal_berakhir;
            
            if ($pks->perusahaan) {
                $companyName = $pks->perusahaan->nama_perusahaan;
            }

            // Action definitions based on status
            if ($statusPks === 'Segera Berakhir') {
                $actionType = 'perusahaan';
                $actionId = $pks->id_perusahaan;
                $actionUrl = '/perusahaan/' . $pks->id_perusahaan;
            } else {
                $actionType = 'pks';
                $actionId = $pks->id_pks;
                $actionUrl = '/pks/' . $pks->id_pks;
            }
        }

        return [
            'id_notifikasi' => $this->id_notifikasi,
            'id_pks' => $this->id_pks,
            'pesan' => $this->pesan,
            'tanggal_notifikasi' => $this->tanggal_notifikasi ? $this->tanggal_notifikasi->format('Y-m-d') : null,
            'status_baca' => $this->status_baca,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Helpful action and PKS fields for React frontend
            'status_pks' => $statusPks,
            'nama_perusahaan' => $companyName,
            'tanggal_berakhir_pks' => $tanggalBerakhir,
            'aksi_tipe' => $actionType, // 'perusahaan' or 'pks'
            'aksi_id' => $actionId,
            'aksi_url' => $actionUrl,
            'data_pks' => new PksResource($this->whenLoaded('dataPks')),
        ];
    }
}
