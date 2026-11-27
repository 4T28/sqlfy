<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Playlist extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = [
        'song_count',
    ];

    /**
     * Get the number of songs in playlist.
     */
    public function getSongCountAttribute()
    {
        return $this->songs()->count();
    }

    /**
     * Relationship: Playlist belongs to a user.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relationship: Playlist has many songs.
     */
    public function songs()
    {
        return $this->belongsToMany(Song::class, 'playlist_song')
                    ->withPivot('order')
                    ->withTimestamps()
                    ->orderBy('pivot_order');
    }

    /**
     * Add song to playlist.
     */
    public function addSong($songId)
    {
        $maxOrder = $this->songs()->max('pivot_order') ?? -1;
        return $this->songs()->attach($songId, ['order' => $maxOrder + 1]);
    }

    /**
     * Remove song from playlist.
     */
    public function removeSong($songId)
    {
        return $this->songs()->detach($songId);
    }
}