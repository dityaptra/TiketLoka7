<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Addon extends Model
{
    use HasFactory;

    // IZINKAN SEMUA KOLOM DIISI
    protected $guarded = [];

    public function destination()
    {
        return $this->belongsTo(Destination::class);
    }
}