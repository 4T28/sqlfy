<?php

namespace App\Http\Controllers;

use App\Models\Playlist;
use App\Models\Favorite;
use Illuminate\Http\Request;

class PlaylistController extends Controller
{
    /**
     * Get all user's playlists.
     */
    public function index()
    {
        // For demo: using user_id = 1, or you can use auth()->id()
        $userId = 1; // Change to auth()->id() if you have authentication
        
        $playlists = Playlist::where('user_id', $userId)
                            ->with('songs')
                            ->get();

        return response()->json($playlists);
    }

    /**
     * Create new playlist.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        // For demo: using user_id = 1
        $userId = 1; // Change to auth()->id() if you have authentication

        $playlist = Playlist::create([
            'user_id' => $userId,
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return response()->json($playlist, 201);
    }

    /**
     * Get single playlist with songs.
     */
    public function show($id)
    {
        $playlist = Playlist::with('songs')->findOrFail($id);
        return response()->json($playlist);
    }

    /**
     * Update playlist.
     */
    public function update(Request $request, $id)
    {
        $playlist = Playlist::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $playlist->update($request->only(['name', 'description']));

        return response()->json($playlist);
    }

    /**
     * Delete playlist.
     */
    public function destroy($id)
    {
        $playlist = Playlist::findOrFail($id);
        $playlist->delete();

        return response()->json([
            'message' => 'Playlist deleted successfully'
        ]);
    }

    /**
     * Add song to playlist.
     */
    public function addSong(Request $request, $id, $songId)
    {
        $playlist = Playlist::findOrFail($id);
        $playlist->addSong($songId);

        return response()->json([
            'message' => 'Song added to playlist'
        ]);
    }

    /**
     * Remove song from playlist.
     */
    public function removeSong($id, $songId)
    {
        $playlist = Playlist::findOrFail($id);
        $playlist->removeSong($songId);

        return response()->json([
            'message' => 'Song removed from playlist'
        ]);
    }

    /**
     * Get user's favorite songs.
     */
    public function favorites()
    {
        // For demo: using user_id = 1
        $userId = 1; // Change to auth()->id() if you have authentication

        $favorites = Favorite::where('user_id', $userId)
                            ->with('song')
                            ->latest()
                            ->get()
                            ->pluck('song');

        return response()->json($favorites);
    }

    /**
     * Toggle favorite.
     */
    public function toggleFavorite($songId)
    {
        // For demo: using user_id = 1
        $userId = 1; // Change to auth()->id() if you have authentication

        $favorite = Favorite::where('user_id', $userId)
                           ->where('song_id', $songId)
                           ->first();

        if ($favorite) {
            $favorite->delete();
            return response()->json([
                'message' => 'Removed from favorites',
                'is_favorite' => false
            ]);
        } else {
            Favorite::create([
                'user_id' => $userId,
                'song_id' => $songId,
            ]);
            return response()->json([
                'message' => 'Added to favorites',
                'is_favorite' => true
            ]);
        }
    }
}