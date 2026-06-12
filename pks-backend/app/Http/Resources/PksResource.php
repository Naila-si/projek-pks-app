<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PksResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id_pks' => $this->id_pks,
            'nomor_pks' => $this->nomor_pks,
            'judul_pks' => $this->judul_pks,
            'bidang' => $this->bidang,
            'tanggal_mulai' => $this->tanggal_mulai,
            'tanggal_berakhir' => $this->tanggal_berakhir,
            'status_pks' => $this->status_pks, // dynamic accessor
            'dokumen_pks' => $this->dokumen_pks,
            'dokumen_pks_url' => $this->dokumen_pks ? asset('storage/pks/' . $this->dokumen_pks) : null,
            'id_perusahaan' => $this->id_perusahaan,
            'perusahaan' => new PerusahaanResource($this->whenLoaded('perusahaan')),
            'addenda' => AddendumResource::collection($this->whenLoaded('addenda')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
