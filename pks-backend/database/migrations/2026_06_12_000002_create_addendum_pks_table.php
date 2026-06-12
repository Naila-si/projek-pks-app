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
        // 1. Create addendum_pks table
        Schema::create('addendum_pks', function (Blueprint $table) {
            $table->id('id_addendum');
            $table->foreignId('id_pks')
                  ->constrained('data_pks', 'id_pks')
                  ->onUpdate('cascade')
                  ->onDelete('cascade');
            $table->string('nomor_addendum', 100)->unique();
            $table->string('judul_addendum', 255);
            $table->date('tanggal_mulai');
            $table->date('tanggal_berakhir');
            $table->string('dokumen_addendum', 255);
            $table->timestamps();
        });

        // 2. Drop tanggal_addendum column from data_pks table
        Schema::table('data_pks', function (Blueprint $table) {
            if (Schema::hasColumn('data_pks', 'tanggal_addendum')) {
                $table->dropColumn('tanggal_addendum');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Re-add tanggal_addendum column to data_pks table
        Schema::table('data_pks', function (Blueprint $table) {
            $table->date('tanggal_addendum')->nullable()->after('tanggal_berakhir');
        });

        // 2. Drop addendum_pks table
        Schema::dropIfExists('addendum_pks');
    }
};
