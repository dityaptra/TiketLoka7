<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inclusion extends Model
{
    use HasFactory;

    // IZINKAN SEMUA KOLOM DIISI
    protected $guarded = []; 

    // Relasi balik ke Destination (Opsional tapi bagus)
    public function destination()
    {
        return $this->belongsTo(Destination::class);
    }
}