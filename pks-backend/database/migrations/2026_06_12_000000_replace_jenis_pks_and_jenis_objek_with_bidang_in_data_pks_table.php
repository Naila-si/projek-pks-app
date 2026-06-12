<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add the 'bidang' column as nullable first
        Schema::table('data_pks', function (Blueprint $table) {
            $table->enum('bidang', ['IW', 'SW', 'pelayanan', 'umum', 'HC', 'keuangan', 'tjsl'])->nullable()->after('judul_pks');
        });

        // 2. Map existing data
        DB::table('data_pks')->where('jenis_pks', 'IWKBU')->update(['bidang' => 'IW']);
        DB::table('data_pks')->where('jenis_pks', 'IWKL')->update(['bidang' => 'SW']);
        
        // Handle any case where bidang is still null (e.g. fallback default)
        DB::table('data_pks')->whereNull('bidang')->update(['bidang' => 'IW']);

        // 3. Make the column NOT NULL and drop old columns
        Schema::table('data_pks', function (Blueprint $table) {
            $table->enum('bidang', ['IW', 'SW', 'pelayanan', 'umum', 'HC', 'keuangan', 'tjsl'])->nullable(false)->change();
            $table->dropColumn(['jenis_pks', 'jenis_objek']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Re-add the columns as nullable
        Schema::table('data_pks', function (Blueprint $table) {
            $table->enum('jenis_pks', ['IWKBU', 'IWKL'])->nullable()->after('judul_pks');
            $table->enum('jenis_objek', ['Kendaraan', 'Kapal'])->nullable()->after('jenis_pks');
        });

        // 2. Map data back
        DB::table('data_pks')->where('bidang', 'IW')->update(['jenis_pks' => 'IWKBU', 'jenis_objek' => 'Kendaraan']);
        DB::table('data_pks')->where('bidang', 'SW')->update(['jenis_pks' => 'IWKL', 'jenis_objek' => 'Kapal']);
        // fallback mapping for other bidang values
        DB::table('data_pks')->whereNotIn('bidang', ['IW', 'SW'])->update(['jenis_pks' => 'IWKBU', 'jenis_objek' => 'Kendaraan']);

        // 3. Make the columns NOT NULL and drop the 'bidang' column
        Schema::table('data_pks', function (Blueprint $table) {
            $table->enum('jenis_pks', ['IWKBU', 'IWKL'])->nullable(false)->change();
            $table->enum('jenis_objek', ['Kendaraan', 'Kapal'])->nullable(false)->change();
            $table->dropColumn('bidang');
        });
    }
};
