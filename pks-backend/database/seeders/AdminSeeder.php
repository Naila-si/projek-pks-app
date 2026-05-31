<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Avoid duplicates by using updateOrCreate
        Admin::updateOrCreate(
            ['email' => 'adminpks@jasaraharja.co.id'],
            [
                'nama' => 'Admin PKS',
                'password' => Hash::make('admin01'),
            ]
        );
    }
}
