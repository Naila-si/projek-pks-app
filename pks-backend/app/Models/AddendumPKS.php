<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AddendumPKS extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'addendum_pks';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'id_addendum';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id_pks',
        'nomor_addendum',
        'judul_addendum',
        'tanggal_mulai',
        'tanggal_berakhir',
        'dokumen_addendum',
    ];

    /**
     * Get the parent PKS that owns the addendum.
     */
    public function pks(): BelongsTo
    {
        return $this->belongsTo(DataPKS::class, 'id_pks', 'id_pks');
    }
}
