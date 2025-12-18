<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    /**
     * Update Profile Info (Nama, HP, Avatar)
     * Endpoint: POST /api/profile (dengan _method: PUT)
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'required|string|max:255',
            'phone_number' => 'nullable|string|max:20',
            // Validasi gambar: wajib image, max 2MB, format jpeg/png/jpg/gif/svg
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        // 1. Update Nama & HP
        $user->name = $request->name;
        $user->phone_number = $request->phone_number;

        // 2. Handle Upload Avatar
        if ($request->hasFile('avatar')) {
            // Hapus gambar lama jika ada (dan bukan default/url eksternal)
            if ($user->avatar_url && Storage::disk('public')->exists($user->avatar_url)) {
                Storage::disk('public')->delete($user->avatar_url);
            }

            // Simpan gambar baru ke folder 'avatars' di storage public
            $path = $request->file('avatar')->store('avatars', 'public');
            
            // Simpan path ke database (Pastikan nama kolom di DB adalah 'avatar_url')
            $user->avatar_url = $path;
        }

        $user->save();

        // 3. Return data user terbaru agar frontend bisa langsung update UI
        return response()->json([
            'status' => 'success',
            'message' => 'Profil berhasil diperbarui',
            'data' => $user, // <-- Frontend butuh data ini
        ]);
    }

    /**
     * Update Password
     * Endpoint: PUT /api/password
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|string|min:8|confirmed', // butuh field new_password_confirmation
        ]);

        $user = $request->user();

        // Cek apakah password lama sesuai
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Password saat ini salah',
            ], 422);
        }

        // Update Password
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Password berhasil diubah',
        ]);
    }
}