<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class DataPKS extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'data_pks';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'id_pks';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nomor_pks',
        'judul_pks',
        'bidang',
        'tanggal_mulai',
        'tanggal_berakhir',
        'status_pks',
        'dokumen_pks',
        'id_perusahaan',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['status_pks'];

    /**
     * Get the company that owns the PKS.
     */
    public function perusahaan(): BelongsTo
    {
        return $this->belongsTo(Perusahaan::class, 'id_perusahaan', 'id_perusahaan');
    }

    /**
     * Get the notifications for the PKS.
     */
    public function notifikasi(): HasMany
    {
        return $this->hasMany(Notifikasi::class, 'id_pks', 'id_pks');
    }

    /**
     * Get the addenda for the PKS.
     */
    public function addenda(): HasMany
    {
        return $this->hasMany(AddendumPKS::class, 'id_pks', 'id_pks');
    }

    /**
     * Accessor to dynamically calculate the status of the PKS based on tanggal_berakhir.
     *
     * Aturan:
     * - Aktif: tanggal berakhir masih lebih dari 30 hari dari tanggal saat ini.
     * - Segera Berakhir: tanggal berakhir kurang dari atau sama dengan 30 hari dan belum lewat.
     * - Berakhir: tanggal berakhir sudah terlewati.
     *
     * @return string
     */
    public function getStatusPksAttribute(): string
    {
        $today = Carbon::today();
        $expiry = Carbon::parse($this->tanggal_berakhir);

        if ($expiry->isBefore($today)) {
            return 'Berakhir';
        }

        // diffInDays returns a positive integer if $expiry is in the future
        $daysRemaining = $today->diffInDays($expiry, false);

        if ($daysRemaining <= 30) {
            return 'Segera Berakhir';
        }

        return 'Aktif';
    }
}
