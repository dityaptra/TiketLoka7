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
        // CEK DULU: Hanya buat kolom jika belum ada
        if (!Schema::hasColumn('reviews', 'image')) {
            Schema::table('reviews', function (Blueprint $table) {
                $table->string('image')->nullable()->after('comment');
            });
        }
    }

    public function down()
    {
        // CEK DULU: Hanya hapus jika kolomnya ada
        if (Schema::hasColumn('reviews', 'image')) {
            Schema::table('reviews', function (Blueprint $table) {
                $table->dropColumn('image');
            });
        }
    }
};