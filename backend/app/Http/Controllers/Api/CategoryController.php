<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::all();
        return response()->json(['data' => $categories]);
    }

    // [BARU] Tambah Kategori
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
        ]);

        $category = Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
        ]);

        return response()->json([
            'message' => 'Kategori berhasil ditambahkan',
            'data' => $category
        ], 201);
    }

    // [BARU] Hapus Kategori
    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        
        // Opsional: Cek apakah kategori dipakai di wisata (biar aman)
        if($category->destinations()->exists()) {
             return response()->json(['message' => 'Gagal: Kategori ini sedang digunakan oleh wisata.'], 400);
        }

        $category->delete();

        return response()->json(['message' => 'Kategori berhasil dihapus']);
    }
}
