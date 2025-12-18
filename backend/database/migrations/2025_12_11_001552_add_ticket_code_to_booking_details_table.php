<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Cek dulu apakah kolom SUDAH ada
        if (!Schema::hasColumn('booking_details', 'ticket_code')) {
            Schema::table('booking_details', function (Blueprint $table) {
                // Sesuaikan tipe datanya dengan kode asli Anda
                $table->string('ticket_code')->nullable()->after('destination_id');
            });
        }
    }

    public function down()
    {
        if (Schema::hasColumn('booking_details', 'ticket_code')) {
            Schema::table('booking_details', function (Blueprint $table) {
                $table->dropColumn('ticket_code');
            });
        }
    }
};