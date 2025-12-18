<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\DestinationImage; // Pastikan import Model ini benar
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class DestinationImageController extends Controller
{
    // Upload Gambar Baru
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'destination_id' => 'required|exists:destinations,id',
            'images' => 'required|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048' // Validasi file gambar
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $uploadedImages = [];

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                // 1. Simpan file fisik ke folder 'public/destination_images'
                $path = $file->store('destination_images', 'public');

                // 2. Simpan ke Database (Sesuai nama kolom Anda: 'image')
                $destinationImage = DestinationImage::create([
                    'destination_id' => $request->destination_id,
                    'image' => $path, // <--- INI DISESUAIKAN DENGAN MODEL ANDA
                ]);

                $uploadedImages[] = $destinationImage;
            }
        }

        return response()->json([
            'message' => 'Foto berhasil diunggah',
            'data' => $uploadedImages
        ], 201);
    }

    // Hapus Gambar
    public function destroy($id)
    {
        $destinationImage = DestinationImage::find($id);

        if (!$destinationImage) {
            return response()->json(['message' => 'Foto tidak ditemukan'], 404);
        }

        // 1. Hapus file fisik jika ada
        if ($destinationImage->image && Storage::disk('public')->exists($destinationImage->image)) {
            Storage::disk('public')->delete($destinationImage->image);
        }

        // 2. Hapus data dari database
        $destinationImage->delete();

        return response()->json(['message' => 'Foto berhasil dihapus']);
    }
}