<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PksController;
use App\Http\Controllers\Api\PerusahaanController;
use App\Http\Controllers\Api\NotifikasiController;
use App\Http\Controllers\Api\ExportController;

// Public route for login
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (Admin authentication required)
Route::middleware('auth:sanctum')->group(function () {
    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // Dashboard Analytics
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // PKS Management
    Route::get('/pks', [PksController::class, 'index']);
    Route::post('/pks', [PksController::class, 'store']);
    Route::get('/pks/{id}', [PksController::class, 'show']);
    Route::put('/pks/{id}', [PksController::class, 'update']);
    Route::post('/pks/{id}', [PksController::class, 'update']); // Fallback POST route for multipart/form-data file uploads with PUT method spoofing

    // Company Directory
    Route::get('/perusahaan', [PerusahaanController::class, 'index']);
    Route::get('/perusahaan/{id}', [PerusahaanController::class, 'show']);
    Route::put('/perusahaan/{id}', [PerusahaanController::class, 'update']);

    // Notifications History
    Route::get('/notifikasi', [NotifikasiController::class, 'index']);

    // Data Exports (Excel / CSV)
    Route::get('/export/pks', [ExportController::class, 'exportPks']);
    Route::get('/export/perusahaan', [ExportController::class, 'exportPerusahaan']);
});
