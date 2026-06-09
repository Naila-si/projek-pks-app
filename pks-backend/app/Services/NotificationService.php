<?php

namespace App\Services;

use App\Models\DataPKS;
use App\Models\Notifikasi;
use Carbon\Carbon;

class NotificationService
{
    /**
     * Scan PKS data and generate notifications automatically if PKS is ending soon or already ended.
     * Avoids duplicate notifications for the same state of a PKS.
     */
    public static function generateNotifications(): void
    {
        // Fetch PKS with their company details
        $pksRecords = DataPKS::with('perusahaan')->get();

        foreach ($pksRecords as $pks) {
            $status = $pks->status_pks; // dynamically computed
            $companyName = $pks->perusahaan ? $pks->perusahaan->nama_perusahaan : 'Perusahaan Tidak Ditemukan';

            if ($status === 'Segera Berakhir') {
                // Delete "Berakhir" notification if it exists (reverted status)
                Notifikasi::where('id_pks', $pks->id_pks)
                    ->where('pesan', 'like', '%telah berakhir%')
                    ->delete();

                $pesan = "Perjanjian Kerja Sama {$pks->judul_pks} dengan {$companyName} akan segera berakhir pada {$pks->tanggal_berakhir}.";
                
                // Check if a "Segera Berakhir" notification already exists for this PKS
                $exists = Notifikasi::where('id_pks', $pks->id_pks)
                    ->where('pesan', 'like', '%akan segera berakhir%')
                    ->exists();

                if (!$exists) {
                    Notifikasi::create([
                        'id_pks' => $pks->id_pks,
                        'pesan' => $pesan,
                        'tanggal_notifikasi' => Carbon::today(),
                        'status_baca' => false,
                    ]);
                }
            } elseif ($status === 'Berakhir') {
                // Delete "Segera Berakhir" notification if it exists (moved to expired)
                Notifikasi::where('id_pks', $pks->id_pks)
                    ->where('pesan', 'like', '%akan segera berakhir%')
                    ->delete();

                $pesan = "Perjanjian Kerja Sama {$pks->judul_pks} dengan {$companyName} telah berakhir pada {$pks->tanggal_berakhir}.";

                // Check if a "Berakhir" notification already exists for this PKS
                $exists = Notifikasi::where('id_pks', $pks->id_pks)
                    ->where('pesan', 'like', '%telah berakhir%')
                    ->exists();

                if (!$exists) {
                    Notifikasi::create([
                        'id_pks' => $pks->id_pks,
                        'pesan' => $pesan,
                        'tanggal_notifikasi' => Carbon::today(),
                        'status_baca' => false,
                    ]);
                }
            } else {
                // Status is "Aktif", delete any warning notifications since PKS is renewed or active
                Notifikasi::where('id_pks', $pks->id_pks)->delete();
            }
        }
    }
}
