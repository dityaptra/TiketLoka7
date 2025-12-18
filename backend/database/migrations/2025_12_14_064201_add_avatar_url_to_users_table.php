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
        // Cek dulu biar aman, kalau belum ada baru dibuat
        if (!Schema::hasColumn('users', 'avatar_url')) {
            $table->string('avatar_url')->nullable()->after('phone_number');
        }
    });
}

public function down()
{
    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn('avatar_url');
    });
}
};
