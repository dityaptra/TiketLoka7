<?php

use Illuminate\Http\Request;
use App\Http\Middleware\IsAdmin;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\DestinationController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\Admin\DestinationImageController;


// --- PUBLIC ROUTES (Bisa diakses tanpa login) ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Wisata & Kategori
Route::get('/destinations', [DestinationController::class, 'index']);
Route::get('/destinations/{slug}', [DestinationController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);

// Review
Route::get('/reviews/{destinationId}', [ReviewController::class, 'index']);

// --- PROTECTED ROUTES (Harus Login) ---
Route::middleware('auth:sanctum')->group(function () {

    // Auth User
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // --- MANAJEMEN PROFILE USER ---
    // 1. Update Biodata & Foto (Pakai POST karena FormData upload file)
    Route::post('/profile', [ProfileController::class, 'update']);
    // 2. Update Password
    Route::put('/password', [ProfileController::class, 'updatePassword']);

    // Cart (Keranjang)
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::delete('/cart/{id}', [CartController::class, 'destroy']);

    // Checkout & Transaksi
    Route::post('/checkout', [BookingController::class, 'checkout']);
    Route::post('/buy-now', [BookingController::class, 'buyNow']);
    Route::get('/my-bookings', [BookingController::class, 'myBookings']);
    Route::get('/bookings/{booking_code}', [BookingController::class, 'show']);
    Route::post('/bookings/{booking_code}/cancel', [BookingController::class, 'cancel']);
    Route::post('/bookings/{booking_code}/pay', [BookingController::class, 'markAsPaid']);
    // Kirim Review
    Route::post('/reviews', [ReviewController::class, 'store']);

    // --- ADMIN ONLY ROUTES ---
    Route::middleware(['auth:sanctum', IsAdmin::class])->prefix('admin')->group(function () {

        // Dashboard Stats
        Route::get('/dashboard', [DashboardController::class, 'stats']);

        // Manajemen Booking
        Route::get('/bookings', [BookingController::class, 'adminIndex']);

        // Manajemen Kategori
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        // --- MANAJEMEN DESTINASI ---

        // 1. Ambil Detail by ID (PENTING: Untuk halaman Edit Admin)
        Route::get('/destinations/{id}', [DestinationController::class, 'showById']);

        // 2. CRUD Utama
        Route::post('/destinations', [DestinationController::class, 'store']);
        Route::post('/destinations/{id}', [DestinationController::class, 'update']); // Update Data + Gambar
        Route::delete('/destinations/{id}', [DestinationController::class, 'destroy']);

        // 3. Upload & Hapus Galeri (Tambahan)
        Route::post('/destinations/{id}/gallery', [DestinationController::class, 'uploadGallery']);
        Route::delete('/destinations/gallery/{image_id}', [DestinationController::class, 'deleteGalleryImage']);

        // 4. INCLUSIONS & ADDONS
        // Tambah Fasilitas
        Route::post('/destinations/{id}/inclusions', [DestinationController::class, 'storeInclusion']);
        // Hapus Fasilitas
        Route::delete('/inclusions/{id}', [DestinationController::class, 'destroyInclusion']);

        // Tambah Addon
        Route::post('/destinations/{id}/addons', [DestinationController::class, 'storeAddon']);
        // Hapus Addon
        Route::delete('/addons/{id}', [DestinationController::class, 'destroyAddon']);
    });
});
