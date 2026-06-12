<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AddendumResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id_addendum' => $this->id_addendum,
            'id_pks' => $this->id_pks,
            'nomor_addendum' => $this->nomor_addendum,
            'judul_addendum' => $this->judul_addendum,
            'tanggal_mulai' => $this->tanggal_mulai,
            'tanggal_berakhir' => $this->tanggal_berakhir,
            'dokumen_addendum' => $this->dokumen_addendum,
            'dokumen_addendum_url' => $this->dokumen_addendum ? asset('storage/pks/' . $this->dokumen_addendum) : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
