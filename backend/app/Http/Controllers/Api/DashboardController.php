<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\User;
use App\Models\BookingDetail;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        // 1. FILTER TANGGAL
        $endDate = $request->end_date ? Carbon::parse($request->end_date)->endOfDay() : Carbon::now()->endOfDay();
        $startDate = $request->start_date ? Carbon::parse($request->start_date)->startOfDay() : $endDate->copy()->subDays(6)->startOfDay();

        $applyDateFilter = function($query) use ($startDate, $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        };

        // 2. STATISTIK KARTU (Cards)
        $revenueQuery = Booking::where('status', 'paid');
        $applyDateFilter($revenueQuery);
        $totalRevenue = $revenueQuery->sum('grand_total');

        $bookingsQuery = Booking::where('status', 'paid');
        $applyDateFilter($bookingsQuery);
        $totalBookings = $bookingsQuery->count();

        $ticketsQuery = BookingDetail::whereHas('booking', function ($q) use ($startDate, $endDate) {
            $q->where('status', 'paid')->whereBetween('created_at', [$startDate, $endDate]);
        });
        $totalTicketsSold = $ticketsQuery->sum('quantity');

        $totalUsers = User::where('role', 'customer')->count();

        // 3. GRAFIK 1: TREN PENDAPATAN (Line Chart)
        $chartRevenue = [];
        $period = \Carbon\CarbonPeriod::create($startDate, $endDate);

        $revenueData = Booking::where('status', 'paid')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('DATE(created_at) as date, SUM(grand_total) as total')
            ->groupBy('date')
            ->pluck('total', 'date');

        foreach ($period as $date) {
            $dateKey = $date->format('Y-m-d');
            $chartRevenue[] = [
                'date' => $date->format('d M'),
                'total' => $revenueData[$dateKey] ?? 0
            ];
        }

        // 4. GRAFIK 2: WISATA TERPOPULER (Bar Chart) - BARU!
        // Menggabungkan tabel booking_details dan destinations
        $popularRaw = BookingDetail::whereHas('booking', function ($q) use ($startDate, $endDate) {
                $q->where('status', 'paid')
                  ->whereBetween('created_at', [$startDate, $endDate]);
            })
            ->join('destinations', 'booking_details.destination_id', '=', 'destinations.id')
            ->select('destinations.name', \Illuminate\Support\Facades\DB::raw('SUM(booking_details.quantity) as total_tickets'))
            ->groupBy('destinations.id', 'destinations.name')
            ->orderByDesc('total_tickets')
            ->limit(5) // Ambil Top 5
            ->get();

        $chartPopular = $popularRaw->map(function($item) {
            return [
                'name' => $item->name,
                'total' => (int)$item->total_tickets
            ];
        });

        // 5. DATA TABEL TERBARU
        $recentQuery = Booking::with(['user', 'details.destination']);
        $applyDateFilter($recentQuery);
        $recentBookings = $recentQuery->orderBy('created_at', 'desc')->take(5)->get();

        return response()->json([
            'data' => [
                'total_revenue' => $totalRevenue,
                'total_bookings' => $totalBookings,
                'total_tickets_sold' => (int) $totalTicketsSold,
                'total_users' => $totalUsers,
                'recent_bookings' => $recentBookings,
                
                // Data Grafik Dikirim ke Frontend
                'chart_revenue' => $chartRevenue,
                'chart_popular' => $chartPopular 
            ]
        ]);
    }
}