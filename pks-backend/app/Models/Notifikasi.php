<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notifikasi extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'notifikasi';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'id_notifikasi';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id_pks',
        'pesan',
        'tanggal_notifikasi',
        'status_baca',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'status_baca' => 'boolean',
        'tanggal_notifikasi' => 'date',
    ];

    /**
     * Get the PKS associated with the notification.
     */
    public function dataPks(): BelongsTo
    {
        return $this->belongsTo(DataPKS::class, 'id_pks', 'id_pks');
    }
}
