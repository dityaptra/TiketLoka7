<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class SocialAuthController extends Controller
{
    /**
     * 1. Redirect ke Provider (Google / Facebook)
     */
    public function redirect($provider)
    {
        // Ambil URL Frontend dari .env
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');

        // Validasi provider
        if (!in_array($provider, ['google', 'facebook'])) {
            return redirect("{$frontendUrl}/login?error=invalid_provider");
        }

        return Socialite::driver($provider)
            ->with(['prompt' => 'select_account'])
            ->redirect();
    }

    /**
     * 2. Callback dari Provider
     */
    public function callback($provider)
    {
        // Ambil URL Frontend dari .env
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');

        try {
            // Ambil data user dari provider
            $socialUser = Socialite::driver($provider)
                ->setHttpClient(new \GuzzleHttp\Client(['verify' => false]))
                ->stateless()
                ->user();

        } catch (\Laravel\Socialite\Two\InvalidStateException $e) {
            // ERROR SPESIFIK: User membatalkan login atau state tidak valid
            return redirect("{$frontendUrl}/login?error=access_denied&message=" . urlencode('Login dibatalkan'))
                ->withoutCookie('laravel_session')
                ->withoutCookie('XSRF-TOKEN')
                ->withoutCookie('token');

        } catch (\GuzzleHttp\Exception\ClientException $e) {
            // ERROR: Masalah dengan OAuth API (Token expired, dll)
            return redirect("{$frontendUrl}/login?error=oauth_error&message=" . urlencode('Gagal terhubung dengan ' . ucfirst($provider)))
                ->withoutCookie('laravel_session')
                ->withoutCookie('XSRF-TOKEN')
                ->withoutCookie('token');

        } catch (\Exception $e) {
            // ERROR: Lainnya (Network, Server down, dll)
            return redirect("{$frontendUrl}/login?error=server_error&message=" . urlencode($e->getMessage()))
                ->withoutCookie('laravel_session')
                ->withoutCookie('XSRF-TOKEN')
                ->withoutCookie('token');
        }

        // Cari user berdasarkan email
        $user = User::where('email', $socialUser->getEmail())->first();

        if (!$user) {
            // --- User Belum Ada → Register Baru ---
            $user = User::create([
                'name' => $socialUser->getName(),
                'email' => $socialUser->getEmail(),
                'password' => null, // Password null karena login sosmed
                'phone_number' => '-',
                'role' => 'user', // Default role
                'avatar_url' => $socialUser->getAvatar(), // Ambil foto profil
                // Simpan ID sesuai provider
                'google_id' => $provider === 'google' ? $socialUser->getId() : null,
                'facebook_id' => $provider === 'facebook' ? $socialUser->getId() : null,
            ]);
        } else {
            // --- User Sudah Ada → Update ID Provider ---
            if ($provider === 'google' && empty($user->google_id)) {
                $user->update([
                    'google_id' => $socialUser->getId(),
                    'avatar_url' => $socialUser->getAvatar() ?? $user->avatar_url
                ]);
            } elseif ($provider === 'facebook' && empty($user->facebook_id)) {
                $user->update([
                    'facebook_id' => $socialUser->getId(),
                    'avatar_url' => $socialUser->getAvatar() ?? $user->avatar_url
                ]);
            }
        }

        // Buat Token Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        // Redirect ke Frontend → DINAMIS sesuai provider
        // Hasilnya: http://localhost:3000/auth/google/callback?token=...
        $callbackUrl = "{$frontendUrl}/auth/{$provider}/callback";
        
        return redirect("{$callbackUrl}?token={$token}");
    }
}