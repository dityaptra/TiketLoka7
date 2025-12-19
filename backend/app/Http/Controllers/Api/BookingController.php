<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Booking;
use App\Models\BookingDetail;
use App\Models\Destination;
use App\Models\Addon; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class BookingController extends Controller
{
    /**
     * FITUR KERANJANG: Checkout beberapa item sekaligus
     */
    public function checkout(Request $request)
    {
        $request->validate([
            'payment_method' => 'required|string',
            'cart_ids' => 'required|array|min:1',
            'cart_ids.*' => 'integer|exists:carts,id',
        ]);

        $userId = $request->user()->id;

        $carts = Cart::with('destination')
            ->where('user_id', $userId)
            ->whereIn('id', $request->cart_ids)
            ->get();

        if ($carts->isEmpty()) {
            return response()->json(['message' => 'Tidak ada item valid yang dipilih'], 400);
        }

        return DB::transaction(function () use ($request, $carts, $userId) {
            $grandTotal = 0;
            $bookingDetailsData = [];

            foreach ($carts as $cart) {
                $addonPriceTotal = 0;
                $selectedAddonIds = is_array($cart->addons) ? $cart->addons : json_decode($cart->addons ?? '[]', true);
                
                if (!empty($selectedAddonIds)) {
                    $addonPriceTotal = Addon::whereIn('id', $selectedAddonIds)->sum('price');
                }

                // Kalkulasi: (Harga Tiket + Total Addon) * Quantity
                $itemSubtotal = ($cart->destination->price + $addonPriceTotal) * $cart->quantity;
                $grandTotal += $itemSubtotal;

                $bookingDetailsData[] = [
                    'destination_id' => $cart->destination_id,
                    'quantity' => $cart->quantity,
                    'price_per_unit' => $cart->destination->price, 
                    'addons' => json_encode($selectedAddonIds), 
                    'subtotal' => $itemSubtotal,
                    'visit_date' => $cart->visit_date,
                ];
            }

            do {
                $bookingCode = Str::upper(Str::random(8));
            } while (Booking::where('booking_code', $bookingCode)->exists());

            $booking = Booking::create([
                'user_id' => $userId,
                'booking_code' => $bookingCode,
                'grand_total' => $grandTotal,
                'status' => 'pending',
                'payment_method' => $request->payment_method,
                'qr_string' => 'TIKETLOKA-PAY-' . $bookingCode,
            ]);

            foreach ($bookingDetailsData as $detail) {
                $uniqueTicketCode = 'TKT-' . $detail['destination_id'] . '-' . Str::upper(Str::random(6));
                
                BookingDetail::create(array_merge($detail, [
                    'booking_id' => $booking->id,
                    'ticket_code' => $uniqueTicketCode
                ]));
            }

            Cart::whereIn('id', $carts->pluck('id'))->delete();

            return response()->json([
                'message' => 'Pesanan dibuat, silakan lakukan pembayaran',
                'booking_code' => $booking->booking_code,
                'data' => $booking
            ], 201);
        });
    }

    public function adminIndex(Request $request)
    {

        $perPage = $request->input('per_page', 10); // Default 10 jika tidak ada parameter

        // Ambil semua booking dengan relasi user dan detail destinasi
        $bookings = Booking::with(['user', 'details.destination'])
            ->latest() // Urutkan dari yang terbaru
            ->paginate($perPage);

        return response()->json($bookings);
    }

    /**
     * FITUR BELI LANGSUNG
     */
    public function buyNow(Request $request)
    {
        $request->validate([
            'destination_id' => 'required|exists:destinations,id',
            'quantity' => 'required|integer|min:1',
            'visit_date' => 'required|date',
            'payment_method' => 'required|string',
            'addons' => 'nullable|array',
            'addons.*' => 'integer|exists:addons,id'
        ]);

        $userId = $request->user()->id;
        $destination = Destination::findOrFail($request->destination_id);
        
        return DB::transaction(function () use ($request, $userId, $destination) {
            $addonPriceSum = 0;
            if ($request->has('addons') && !empty($request->addons)) {
                $addonPriceSum = Addon::whereIn('id', $request->addons)->sum('price');
            }

            $totalAmount = ($destination->price + $addonPriceSum) * $request->quantity;
            
            do {
                $bookingCode = Str::upper(Str::random(8));
            } while (Booking::where('booking_code', $bookingCode)->exists());

            $booking = Booking::create([
                'user_id' => $userId,
                'booking_code' => $bookingCode,
                'grand_total' => $totalAmount,
                'status' => 'pending', 
                'payment_method' => $request->payment_method,
                'qr_string' => 'TIKETLOKA-PAY-' . $bookingCode,
            ]);

            $uniqueTicketCode = 'TKT-' . $destination->id . '-' . Str::upper(Str::random(6));

            BookingDetail::create([
                'booking_id' => $booking->id,
                'destination_id' => $destination->id,
                'quantity' => $request->quantity,
                'price_per_unit' => $destination->price,
                'addons' => json_encode($request->addons ?? []),
                'subtotal' => $totalAmount,
                'visit_date' => $request->visit_date,
                'ticket_code' => $uniqueTicketCode,
            ]);

            return response()->json([
                'message' => 'Pesanan dibuat, silakan lakukan pembayaran',
                'booking_code' => $booking->booking_code,
                'data' => $booking
            ], 201);
        });
    }

    /**
     * PERBAIKAN: Muat relasi addons master agar frontend bisa baca harga
     */
    public function myBookings()
    {
        $bookings = Booking::with(['details.destination.addons']) // Tambahkan .addons
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $bookings]);
    }

    public function show($booking_code)
    {
        $booking = Booking::with(['details.destination.addons', 'user']) // Tambahkan .addons
            ->where('booking_code', $booking_code)
            ->firstOrFail();

        $user = Auth::user();
        if ($booking->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(['data' => $booking]);
    }

    public function showByCode($booking_code, Request $request)
    {
        $booking = Booking::with(['details.destination.addons']) // Tambahkan .addons
            ->where('booking_code', $booking_code)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $booking->qris_string = $booking->qr_string; 
        return response()->json(['data' => $booking]);
    }

    // ... method cancel & markAsPaid tetap sama ...

    public function cancel($booking_code, Request $request)
    {
        $booking = Booking::where('booking_code', $booking_code)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$booking) return response()->json(['message' => 'Pesanan tidak ditemukan'], 404);
        if ($booking->status !== 'pending') return response()->json(['message' => 'Gagal'], 400);

        $booking->update(['status' => 'cancelled']);
        return response()->json(['status' => 'success']);
    }

    public function markAsPaid($booking_code, Request $request)
    {
        $booking = Booking::where('booking_code', $booking_code)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $booking->update(['status' => 'paid', 'paid_at' => now()]);
        return response()->json(['status' => 'success']);
    }
}