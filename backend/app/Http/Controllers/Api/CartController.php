<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Http\Resources\CartResource;
use App\Models\Destination;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    /**
     * Lihat isi keranjang
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        // PENTING: Tambahkan .addons pada eager loading destination
        // Agar frontend bisa menghitung total harga berdasarkan data master addon
        $carts = Cart::with(['destination.addons'])
            ->where('user_id', $userId)
            ->get();

        return CartResource::collection($carts);
    }

    /**
     * Tambah ke keranjang
     */
    public function store(Request $request)
    {
        $request->validate([
            'destination_id' => 'required|exists:destinations,id',
            'quantity' => 'required|integer|min:1',
            'visit_date' => 'required|date|after_or_equal:today',
            'addons' => 'nullable|array', // Menerima array ID [1, 2, 3]
        ]);

        $userId = $request->user()->id;
        // Ubah array addons menjadi string JSON untuk pengecekan di database
        $addonsJson = json_encode($request->addons ?? []);

        /**
         * Cek apakah item yang sama di tanggal yang sama DAN addons yang sama sudah ada?
         * Jika addons berbeda (misal satu pakai tenda, satu tidak), 
         * maka akan menjadi baris baru di keranjang.
         */
        $existingCart = Cart::where('user_id', $userId)
            ->where('destination_id', $request->destination_id)
            ->where('visit_date', $request->visit_date)
            ->where('addons', $addonsJson) // Cek kesamaan pilihan addon
            ->first();

        if ($existingCart) {
            $existingCart->increment('quantity', $request->quantity);
            return response()->json([
                'message' => 'Jumlah tiket diperbarui', 
                'data' => $existingCart
            ]);
        }

        // Jika belum ada atau addons berbeda, buat data baru
        $cart = Cart::create([
            'user_id' => $userId,
            'destination_id' => $request->destination_id,
            'quantity' => $request->quantity,
            'visit_date' => $request->visit_date,
            'addons' => $addonsJson, // Simpan dalam format JSON string
        ]);

        return response()->json([
            'message' => 'Berhasil masuk keranjang', 
            'data' => $cart
        ], 201);
    }

    /**
     * Hapus item keranjang
     */
    public function destroy($id)
    {
        $cart = Cart::where('user_id', Auth::id())
            ->where('id', $id)
            ->firstOrFail();
            
        $cart->delete();

        return response()->json(['message' => 'Item dihapus dari keranjang']);
    }
}