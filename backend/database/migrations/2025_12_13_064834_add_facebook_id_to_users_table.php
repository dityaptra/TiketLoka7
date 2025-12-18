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
            // Cek dulu apakah kolom facebook_id sudah ada
            if (!Schema::hasColumn('users', 'facebook_id')) {
                // Cek apakah kolom google_id ada agar posisi 'after' tidak error
                if (Schema::hasColumn('users', 'google_id')) {
                    $table->string('facebook_id')->nullable()->after('google_id');
                } else {
                    $table->string('facebook_id')->nullable()->after('email');
                }
            }
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'facebook_id')) {
                $table->dropColumn('facebook_id');
            }
        });
    }
};