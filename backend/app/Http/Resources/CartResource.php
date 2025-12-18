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
            'total_price' => $this->total_price,
            'visit_date' => $this->visit_date,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'destination' => $this->whenLoaded('destination'),
        ];
    }
}
