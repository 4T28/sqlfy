<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SongController;
use App\Http\Controllers\PlaylistController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Dashboard route
Route::get('/', [SongController::class, 'index'])->name('dashboard');

// API Routes untuk AJAX
Route::prefix('api')->group(function () {
    // Songs
    Route::get('/songs', [SongController::class, 'getSongs']);
    Route::get('/songs/{id}', [SongController::class, 'show']);
    Route::get('/songs/{id}/stream', [SongController::class, 'stream']);
    Route::post('/songs/upload', [SongController::class, 'upload']);
    Route::delete('/songs/{id}', [SongController::class, 'destroy']);
    
    // Playlists
    Route::get('/playlists', [PlaylistController::class, 'index']);
    Route::post('/playlists', [PlaylistController::class, 'store']);
    Route::get('/playlists/{id}', [PlaylistController::class, 'show']);
    Route::put('/playlists/{id}', [PlaylistController::class, 'update']);
    Route::delete('/playlists/{id}', [PlaylistController::class, 'destroy']);
    Route::post('/playlists/{id}/songs/{songId}', [PlaylistController::class, 'addSong']);
    Route::delete('/playlists/{id}/songs/{songId}', [PlaylistController::class, 'removeSong']);
    
    // Favorites
    Route::get('/favorites', [PlaylistController::class, 'favorites']);
    Route::post('/favorites/{songId}/toggle', [PlaylistController::class, 'toggleFavorite']);
});