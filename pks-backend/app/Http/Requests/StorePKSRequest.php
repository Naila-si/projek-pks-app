<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePKSRequest extends FormRequest
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
        return [
            // PKS Attributes
            'nomor_pks' => 'nullable|string|max:100|unique:data_pks,nomor_pks',
            'judul_pks' => 'required|string|max:255',
            'bidang' => 'required|in:IW,SW,pelayanan,umum,HC,keuangan,tjsl',
            'tanggal_mulai' => 'required|date',
            'tanggal_berakhir' => 'required|date|after_or_equal:tanggal_mulai',
            'dokumen_pks' => 'required|file|mimes:pdf|max:10240', // max 10MB
            
            // Existing company check
            'id_perusahaan' => 'nullable|integer|exists:perusahaan,id_perusahaan',

            // New company attributes (required if id_perusahaan is not provided)
            'nama_perusahaan' => 'required_without:id_perusahaan|nullable|string|max:255',
            'nama_pengelola' => 'required_without:id_perusahaan|nullable|string|max:100',
            'alamat' => 'required_without:id_perusahaan|nullable|string',
            'email' => 'nullable|email|max:100',
            'nomor_telepon' => 'required_without:id_perusahaan|nullable|string|max:20',
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
