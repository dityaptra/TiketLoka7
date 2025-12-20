<?php

use App\Http\Controllers\SocialAuthController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan; // <--- PENTING: Baris ini wajib ada!

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return view('welcome');
});

// --- Rute Social Auth (Bawaan Anda) ---
Route::get('auth/{provider}', [SocialAuthController::class, 'redirect'])->name('social.redirect');
Route::get('auth/{provider}/callback', [SocialAuthController::class, 'callback'])->name('social.callback');


// =========================================================================
// RUTE KHUSUS DEPLOYMENT (Hanya untuk Shared Hosting Tanpa SSH)
// Gunakan rute ini nanti setelah web di-upload ke hosting
// =========================================================================

// 1. Setup Storage Link (Agar gambar yang di-upload bisa muncul)
// Akses nanti: https://api.tiketloka.web.id/setup-storage
Route::get('/setup-storage', function () {
    try {
        Artisan::call('storage:link');
        return 'Sukses! Storage Link berhasil dibuat. Cek folder public/storage.';
    } catch (\Exception $e) {
        return 'Gagal atau Link sudah ada: ' . $e->getMessage();
    }
});

// 2. Bersihkan Cache (PENTING: Jalankan ini setiap kali Anda update file .env atau config)
// Akses nanti: https://api.tiketloka.web.id/clear-cache
Route::get('/clear-cache', function () {
    try {
        Artisan::call('optimize:clear');
        return 'Sukses! Cache aplikasi, route, dan config telah dibersihkan.';
    } catch (\Exception $e) {
        return 'Gagal membersihkan cache: ' . $e->getMessage();
    }
});

// 3. Cek Koneksi Database (Untuk memastikan password di .env hosting sudah benar)
// Akses nanti: https://api.tiketloka.web.id/cek-db
Route::get('/cek-db', function () {
    try {
        \Illuminate\Support\Facades\DB::connection()->getPdo();
        return 'Koneksi Database BERHASIL! Nama Database: ' . \Illuminate\Support\Facades\DB::connection()->getDatabaseName();
    } catch (\Exception $e) {
        return 'Koneksi Database GAGAL. Cek file .env Anda. Error: ' . $e->getMessage();
    }
});