<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAddendumRequest extends FormRequest
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
            'id_pks' => 'required|integer|exists:data_pks,id_pks',
            'nomor_addendum' => 'required|string|max:100|unique:addendum_pks,nomor_addendum,' . $id . ',id_addendum',
            'judul_addendum' => 'required|string|max:255',
            'tanggal_mulai' => 'required|date',
            'tanggal_berakhir' => 'required|date|after_or_equal:tanggal_mulai',
            'dokumen_addendum' => 'nullable|file|mimes:pdf|max:10240', // optional on update
        ];
    }

    /**
     * Custom validation messages.
     */
    public function messages(): array
    {
        return [
            'nomor_addendum.unique' => 'Nomor Addendum sudah digunakan.',
            'dokumen_addendum.mimes' => 'Dokumen Addendum harus berupa file PDF.',
            'dokumen_addendum.max' => 'Ukuran dokumen Addendum maksimal adalah 10 MB.',
            'tanggal_berakhir.after_or_equal' => 'Tanggal berakhir harus sama dengan atau setelah tanggal mulai.',
        ];
    }
}
