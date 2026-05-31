<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePKSRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $id = $this->route('id');

        return [
            'nomor_pks' => 'required|string|max:100|unique:data_pks,nomor_pks,' . $id . ',id_pks',
            'judul_pks' => 'required|string|max:255',
            'jenis_pks' => 'required|in:IWKBU,IWKL',
            'jenis_objek' => 'required|in:Kendaraan,Kapal',
            'tanggal_mulai' => 'required|date',
            'tanggal_berakhir' => 'required|date|after_or_equal:tanggal_mulai',
            'tanggal_addendum' => 'nullable|date',
            'dokumen_pks' => 'nullable|file|mimes:pdf|max:10240', // max 10MB, optional on update
            'id_perusahaan' => 'required|integer|exists:perusahaan,id_perusahaan',
        ];
    }

    /**
     * Custom validation messages.
     */
    public function messages(): array
    {
        return [
            'nomor_pks.unique' => 'Nomor PKS sudah digunakan.',
            'dokumen_pks.mimes' => 'Dokumen PKS harus berupa file PDF.',
            'dokumen_pks.max' => 'Ukuran dokumen PKS maksimal adalah 10 MB.',
            'tanggal_berakhir.after_or_equal' => 'Tanggal berakhir harus sama dengan atau setelah tanggal mulai.',
        ];
    }
}
