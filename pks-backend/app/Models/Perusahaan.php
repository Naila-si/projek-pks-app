<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Perusahaan extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'perusahaan';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'id_perusahaan';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nama_perusahaan',
        'nama_pengelola',
        'alamat',
        'email',
        'nomor_telepon',
    ];

    /**
     * Get the PKS records associated with the company.
     */
    public function dataPks(): HasMany
    {
        return $this->hasMany(DataPKS::class, 'id_perusahaan', 'id_perusahaan');
    }
}
