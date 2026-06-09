<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notifikasi;
use App\Services\NotificationService;
use App\Http\Resources\NotifikasiResource;
use Illuminate\Http\Request;

class NotifikasiController extends Controller
{
    /**
     * Display a listing of all notifications.
     */
    public function index(Request $request)
    {
        // Run notification scan before fetching
        NotificationService::generateNotifications();

        // Eager load dataPks and companies for performance and resource formatting
        $notifications = Notifikasi::with(['dataPks.perusahaan'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar notifikasi berhasil diambil.',
            'data' => NotifikasiResource::collection($notifications)
        ], 200);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead($id)
    {
        $notification = Notifikasi::findOrFail($id);
        $notification->status_baca = true;
        $notification->save();

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi berhasil ditandai sebagai dibaca.',
            'data' => new NotifikasiResource($notification)
        ], 200);
    }
}
