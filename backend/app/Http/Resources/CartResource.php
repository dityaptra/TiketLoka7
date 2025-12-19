<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'destination_id' => $this->destination_id,
            'quantity' => $this->quantity,
            'visit_date' => $this->visit_date,
            // Kirim addons kembali sebagai array (bukan string JSON mentah)
            'addons' => is_array($this->addons) ? $this->addons : json_decode($this->addons ?? '[]', true),
            'destination' => $this->destination, // Ini akan menyertakan .addons master
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
