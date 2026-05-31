<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PerusahaanResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id_perusahaan' => $this->id_perusahaan,
            'nama_perusahaan' => $this->nama_perusahaan,
            'nama_pengelola' => $this->nama_pengelola,
            'alamat' => $this->alamat,
            'email' => $this->email,
            'nomor_telepon' => $this->nomor_telepon,
            'data_pks' => PksResource::collection($this->whenLoaded('dataPks')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
