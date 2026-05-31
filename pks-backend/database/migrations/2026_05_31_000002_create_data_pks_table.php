<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('data_pks', function (Blueprint $table) {
            $table->id('id_pks');
            $table->string('nomor_pks', 100)->unique();
            $table->string('judul_pks', 255);
            $table->enum('jenis_pks', ['IWKBU', 'IWKL']);
            $table->enum('jenis_objek', ['Kendaraan', 'Kapal']);
            $table->date('tanggal_mulai');
            $table->date('tanggal_berakhir');
            $table->date('tanggal_addendum')->nullable();
            $table->string('status_pks', 50)->nullable();
            $table->string('dokumen_pks', 255);
            $table->foreignId('id_perusahaan')
                  ->constrained('perusahaan', 'id_perusahaan')
                  ->onUpdate('cascade')
                  ->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_pks');
    }
};
