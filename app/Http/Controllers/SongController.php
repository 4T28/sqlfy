<?php

namespace App\Http\Controllers;

use App\Models\Song;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SongController extends Controller
{
    /**
     * Display the dashboard view.
     */
    public function index()
    {
        return view('dashboard');
    }

    /**
     * Get all songs via API.
     */
    public function getSongs(Request $request)
    {
        $query = Song::query();

        // Search functionality
        if ($request->has('search') && $request->search != '') {
            $query->search($request->search);
        }

        // Get all songs ordered by title
        $songs = $query->orderBy('title', 'asc')->get();

        return response()->json($songs);
    }

    /**
     * Get single song by ID.
     */
    public function show($id)
    {
        $song = Song::findOrFail($id);
        return response()->json($song);
    }

    /**
     * Stream audio file.
     */
    public function stream($id)
    {
        $song = Song::findOrFail($id);

        $path = storage_path('app/public/' . $song->file_path);

        if (!file_exists($path)) {
            return response()->json([
                'message' => 'Audio file not found'
            ], 404);
        }

        return response()->file($path, [
            'Content-Type' => 'audio/mpeg',
            'Accept-Ranges' => 'bytes',
        ]);
    }

    /**
     * Upload new song.
     */
    public function upload(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'artist' => 'required|string|max:255',
            'album' => 'nullable|string|max:255',
            'duration' => 'nullable|string|max:10',
            'audio_file' => 'required|file|mimes:mp3,wav,ogg,m4a|max:20480', // Max 20MB
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Max 2MB
        ]);

        try {
            // Upload audio file
            $audioPath = $request->file('audio_file')->store('songs', 'public');

            // Upload cover image if exists
            $coverPath = null;
            if ($request->hasFile('cover_image')) {
                $coverPath = $request->file('cover_image')->store('covers', 'public');
            }

            // Get duration or use provided
            $duration = $request->duration ?? '0:00';

            // Create song
            $song = Song::create([
                'title' => $request->title,
                'artist' => $request->artist,
                'album' => $request->album,
                'duration' => $duration,
                'file_path' => $audioPath,
                'cover_image' => $coverPath,
            ]);

            return response()->json([
                'message' => 'Song uploaded successfully',
                'song' => $song
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to upload song',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete song.
     */
    public function destroy($id)
    {
        try {
            $song = Song::findOrFail($id);

            // Delete files from storage
            if ($song->file_path && Storage::disk('public')->exists($song->file_path)) {
                Storage::disk('public')->delete($song->file_path);
            }

            if ($song->cover_image && Storage::disk('public')->exists($song->cover_image)) {
                Storage::disk('public')->delete($song->cover_image);
            }

            // Delete from database
            $song->delete();

            return response()->json([
                'message' => 'Song deleted successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete song',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}