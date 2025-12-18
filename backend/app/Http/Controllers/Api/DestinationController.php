<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use App\Models\DestinationImage; // Model Galeri
use App\Models\Inclusion;        // Model Fasilitas
use App\Models\Addon;            // Model Add-on
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class DestinationController extends Controller
{
    /**
     * Helper Private: Format Image URL
     * Mengubah path relatif storage menjadi URL lengkap
     */
    private function formatImageUrl($url)
    {
        if (!$url) return null;
        if (filter_var($url, FILTER_VALIDATE_URL)) {
            return $url; // Jika sudah URL lengkap (http...), biarkan
        }
        // Jika path storage, tambahkan base URL dan 'storage/'
        return asset('storage/' . $url);
    }

    /**
     * PUBLIC: Menampilkan daftar wisata (List & Search)
     */
    public function index(Request $request)
    {
        $query = Destination::query();
        
        // Load Relasi dasar
        $query->with(['category']); 
        $query->withAvg('reviews', 'rating'); // Hitung rata-rata rating

        // Filter User vs Admin (Admin bisa lihat semua jika ?all=true)
        if (!$request->has('all') || $request->all !== 'true') {
            $query->where('is_active', true);
        }

        // Search Nama
        if ($request->has('search') && $request->search != '') {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Filter Kategori (berdasarkan slug)
        if ($request->has('category') && $request->category != '') {
            $slug = $request->category;
            $query->whereHas('category', function ($q) use ($slug) {
                $q->where('slug', $slug);
            });
        }

        $query->latest(); 

        // Gunakan paginate() jika ingin pagination, atau get() untuk semua
        // Di sini saya pakai get() sesuai kode awal Anda, tapi saya sarankan paginate() untuk performa
        $destinations = $query->get();

        // TRANSFORM DATA: Format URL Gambar sebelum dikirim
        $data = $destinations->map(function ($item) {
            $item->image_url = $this->formatImageUrl($item->image_url);
            $item->rating = $item->reviews_avg_rating ?? 0;
            return $item;
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * PUBLIC: Detail Wisata Single Page
     */
    public function show($slug)
    {
        // Load semua relasi yang dibutuhkan Frontend
        $destination = Destination::with([
            'category', 
            'images', 
            'inclusions', 
            'addons', 
            'reviews.user' // Load review beserta data user-nya
        ])
            ->where('slug', $slug)
            ->firstOrFail();

        // Format URL gambar utama
        $imageUrl = $this->formatImageUrl($destination->image_url);

        // Format URL Galeri Foto
        foreach($destination->images as $img) {
            $img->image_path = $this->formatImageUrl($img->image_path);
        }

        // Format URL Foto di Review User (jika ada fitur foto review)
        foreach($destination->reviews as $review) {
            if ($review->image) {
                $review->image = $this->formatImageUrl($review->image);
            }
        }

        return response()->json([
            'data' => [
                'id' => $destination->id,
                'name' => $destination->name,
                'slug' => $destination->slug,
                'category' => $destination->category->name ?? 'Uncategorized',
                'description' => $destination->description,
                'price' => $destination->price,
                'location' => $destination->location,
                'image_url' => $imageUrl, // URL sudah diformat
                'is_active' => $destination->is_active,
                
                // Relasi yang sudah dimuat & diformat
                'images' => $destination->images,
                'inclusions' => $destination->inclusions,
                'addons' => $destination->addons,
                'reviews' => $destination->reviews,
            ],
            'seo' => [
                'title' => $destination->meta_title ?? $destination->name,
                'description' => $destination->meta_description ?? Str::limit(strip_tags($destination->description), 150),
                'keywords' => $destination->meta_keywords,
                'og_image' => $imageUrl,
            ]
        ]);
    }

    /**
     * ADMIN: Ambil Detail by ID (Untuk Halaman Edit Admin)
     */
    public function showById($id)
    {
        $destination = Destination::with(['category', 'images', 'inclusions', 'addons'])->find($id);

        if (!$destination) {
            return response()->json(['status' => 'error', 'message' => 'Not Found'], 404);
        }

        // Format URL gambar utama
        $destination->image_url = $this->formatImageUrl($destination->image_url);
        
        // Format URL galeri
        foreach($destination->images as $img) {
            $img->image_path = $this->formatImageUrl($img->image_path);
        }

        return response()->json(['status' => 'success', 'data' => $destination]);
    }

    /**
     * ADMIN: Simpan Wisata Baru
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'location' => 'required|string',
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
            'meta_title' => 'nullable|string|max:100',
            'meta_description' => 'nullable|string|max:255',
            'meta_keywords' => 'nullable|string',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('destinations', 'public');
            $validated['image_url'] = $path;
            unset($validated['image']);
        }

        $destination = Destination::create($validated);

        return response()->json([
            'message' => 'Destinasi wisata berhasil ditambahkan',
            'data' => $destination
        ], 201);
    }

    /**
     * ADMIN: Update Wisata
     */
    public function update(Request $request, $id)
    {
        $destination = Destination::findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric',
            'location' => 'sometimes|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'meta_title' => 'nullable|string',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
        ]);

        if ($request->has('name')) {
            $validated['slug'] = Str::slug($request->name);
        }

        // Handle is_active manually (FormData string "true"/"false")
        if ($request->has('is_active')) {
             $validated['is_active'] = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
        }

        if ($request->hasFile('image')) {
            // Hapus gambar lama jika ada dan bukan URL eksternal
            if ($destination->image_url && 
                !filter_var($destination->image_url, FILTER_VALIDATE_URL) && 
                Storage::disk('public')->exists($destination->image_url)) {
                Storage::disk('public')->delete($destination->image_url);
            }

            $path = $request->file('image')->store('destinations', 'public');
            $validated['image_url'] = $path;
            unset($validated['image']);
        }

        $destination->update($validated);

        return response()->json([
            'message' => 'Data wisata berhasil diperbarui',
            'data' => $destination
        ]);
    }

    /**
     * ADMIN: Hapus Wisata
     */
    public function destroy($id)
    {
        $destination = Destination::findOrFail($id);

        if ($destination->image_url && 
            !filter_var($destination->image_url, FILTER_VALIDATE_URL) && 
            Storage::disk('public')->exists($destination->image_url)) {
            Storage::disk('public')->delete($destination->image_url);
        }

        // Hapus relasi jika diperlukan (opsional, biasanya diatur via onDelete cascade di migration)
        // $destination->images()->delete(); 

        $destination->delete();

        return response()->json(['message' => 'Destinasi wisata berhasil dihapus']);
    }

    // ==========================================
    // FITUR TAMBAHAN (GALERI & ADDONS)
    // ==========================================

    /**
     * Upload Galeri Foto (Multiple)
     */
    public function uploadGallery(Request $request, $id) {
        $destination = Destination::findOrFail($id);
        
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                DestinationImage::create([
                    'destination_id' => $destination->id,
                    'image_path' => $image->store('destinations', 'public')
                ]);
            }
        }

        // Return data fresh dengan URL yang sudah diformat
        $freshData = $destination->load('images');
        foreach($freshData->images as $img) {
            $img->image_path = $this->formatImageUrl($img->image_path);
        }
        
        return response()->json(['status' => 'success', 'data' => $freshData]);
    }

    public function deleteGalleryImage($image_id) {
        $image = DestinationImage::findOrFail($image_id);
        
        if (Storage::disk('public')->exists($image->image_path)) {
            Storage::disk('public')->delete($image->image_path);
        }
        
        $image->delete();
        return response()->json(['status' => 'success']);
    }

    /**
     * Manajemen Inclusions (Fasilitas Paket)
     */
    public function storeInclusion(Request $request, $id)
    {
        $request->validate(['name' => 'required|string|max:255']);
        
        $inclusion = Inclusion::create([
            'destination_id' => $id,
            'name' => $request->name
        ]);
        
        return response()->json(['status' => 'success', 'data' => $inclusion]);
    }

    public function destroyInclusion($id)
    {
        Inclusion::destroy($id);
        return response()->json(['status' => 'success']);
    }

    /**
     * Manajemen Addons (Upgrade Paket)
     */
    public function storeAddon(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0'
        ]);
        
        $addon = Addon::create([
            'destination_id' => $id,
            'name' => $request->name,
            'price' => $request->price
        ]);
        
        return response()->json(['status' => 'success', 'data' => $addon]);
    }

    public function destroyAddon($id)
    {
        Addon::destroy($id);
        return response()->json(['status' => 'success']);
    }
}