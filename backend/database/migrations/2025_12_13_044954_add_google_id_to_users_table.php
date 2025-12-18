<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // 1. Cek dulu apakah kolom google_id sudah ada
            if (!Schema::hasColumn('users', 'google_id')) {
                $table->string('google_id')->nullable()->after('email');
            }

            // 2. Ubah password jadi nullable (aman dijalankan berulang)
            $table->string('password')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            // Hapus kolom google_id jika ada
            if (Schema::hasColumn('users', 'google_id')) {
                $table->dropColumn('google_id');
            }
            
            // Kembalikan password menjadi tidak boleh kosong
            // Note: Hati-hati, ini bisa error jika ada data user dengan password kosong
            $table->string('password')->nullable(false)->change();
        });
    }
};