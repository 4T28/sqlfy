<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>SQLfy | Dashboard</title>
    <link rel="stylesheet" href="{{ asset('css/dashboard.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="logo">
                <i class="fas fa-music"></i>
                <h1>SQLfy</h1>
            </div>
            
            <nav class="nav-menu">
                <a href="#" class="nav-item active" data-view="home">
                    <i class="fas fa-home"></i>
                    <span>Home</span>
                </a>
                <a href="#" class="nav-item" data-view="upload">
                    <i class="fas fa-upload"></i>
                    <span>Upload</span>
                </a>
                <a href="#" class="nav-item" data-view="library">
                    <i class="fas fa-book"></i>
                    <span>Library</span>
                </a>
            </nav>

            <div class="sidebar-bottom">
                <a href="#" class="nav-item" id="btnCreatePlaylist">
                    <i class="fas fa-plus-circle"></i>
                    <span>Create Playlist</span>
                </a>
                <a href="#" class="nav-item" id="btnLikedSongs">
                    <i class="fas fa-heart"></i>
                    <span>Liked Songs</span>
                </a>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <!-- Top Bar -->
            <div class="top-bar">
                <div class="search-container" id="searchContainer" style="display: none;">
                    <i class="fas fa-search"></i>
                    <input type="text" id="searchInput" placeholder="Search songs, artists, or albums...">
                </div>
                <div class="user-menu">
                    <div class="user-profile">
                        <i class="fas fa-user-circle"></i>
                        <span>{{ Auth::user()->name ?? 'User' }}</span>
                    </div>
                </div>
            </div>

            <!-- Content Area -->
            <div class="content-area">
                <!-- Home View -->
                <div id="homeView" class="view active">
                    <h2 class="section-title">Good evening</h2>
                    <div class="quick-picks" id="quickPicks">
                        <!-- Quick picks akan diisi oleh JavaScript -->
                    </div>

                    <h2 class="section-title">All Songs</h2>
                    <div class="song-list" id="songList">
                        <!-- Song list akan diisi oleh JavaScript -->
                    </div>
                </div>

                <!-- Upload View -->
                <div id="uploadView" class="view">
                    <h2 class="section-title">Upload Song</h2>
                    
                    <div class="upload-container">
                        <form id="uploadForm" enctype="multipart/form-data">
                            @csrf
                            
                            <div class="upload-section">
                                <!-- Audio File Upload -->
                                <div class="form-group">
                                    <label for="audioFile" class="form-label">
                                        <i class="fas fa-music"></i> Audio File *
                                    </label>
                                    <div class="file-upload-area" id="audioUploadArea">
                                        <input type="file" id="audioFile" name="audio_file" accept="audio/*" required hidden>
                                        <div class="upload-placeholder">
                                            <i class="fas fa-cloud-upload-alt"></i>
                                            <p>Click to upload or drag and drop</p>
                                            <span class="file-info">MP3, WAV, OGG, M4A (Max 20MB)</span>
                                        </div>
                                        <div class="file-selected" style="display: none;">
                                            <i class="fas fa-file-audio"></i>
                                            <span class="file-name"></span>
                                            <button type="button" class="btn-remove-file"><i class="fas fa-times"></i></button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Cover Image Upload -->
                                <div class="form-group">
                                    <label for="coverImage" class="form-label">
                                        <i class="fas fa-image"></i> Cover Image
                                    </label>
                                    <div class="file-upload-area" id="coverUploadArea">
                                        <input type="file" id="coverImage" name="cover_image" accept="image/*" hidden>
                                        <div class="upload-placeholder">
                                            <i class="fas fa-image"></i>
                                            <p>Click to upload cover</p>
                                            <span class="file-info">JPG, PNG, GIF (Max 2MB)</span>
                                        </div>
                                        <div class="file-preview" style="display: none;">
                                            <img src="" alt="Cover preview">
                                            <button type="button" class="btn-remove-file"><i class="fas fa-times"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Song Details -->
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="title" class="form-label">Title *</label>
                                    <input type="text" id="title" name="title" class="form-input" placeholder="Enter song title" required>
                                </div>

                                <div class="form-group">
                                    <label for="artist" class="form-label">Artist *</label>
                                    <input type="text" id="artist" name="artist" class="form-input" placeholder="Enter artist name" required>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="album" class="form-label">Album</label>
                                    <input type="text" id="album" name="album" class="form-input" placeholder="Enter album name">
                                </div>

                                <div class="form-group">
                                    <label for="duration" class="form-label">Duration</label>
                                    <input type="text" id="duration" name="duration" class="form-input" placeholder="e.g., 3:45" pattern="[0-9]+:[0-9]{2}">
                                </div>
                            </div>

                            <!-- Progress Bar -->
                            <div class="upload-progress" id="uploadProgress" style="display: none;">
                                <div class="progress-bar-upload">
                                    <div class="progress-fill-upload" id="uploadProgressFill"></div>
                                </div>
                                <span class="progress-text" id="uploadProgressText">0%</span>
                            </div>

                            <!-- Buttons -->
                            <div class="form-actions">
                                <button type="reset" class="btn-secondary">Reset</button>
                                <button type="submit" class="btn-primary" id="btnSubmitUpload">
                                    <i class="fas fa-upload"></i> Upload Song
                                </button>
                            </div>

                            <!-- Message -->
                            <div class="upload-message" id="uploadMessage" style="display: none;"></div>
                        </form>
                    </div>
                </div>

                <!-- Search View -->
                <div id="searchView" class="view">
                    <h2 class="section-title">Search Results</h2>
                    <div class="song-list" id="searchResults">
                        <!-- Search results akan diisi oleh JavaScript -->
                    </div>
                </div>

                <!-- Library View -->
                <div id="libraryView" class="view">
                    <h2 class="section-title">Library</h2>
                    <div class="library-tabs">
                        <button class="tab-btn active" data-tab="playlists">Playlists</button>
                        <button class="tab-btn" data-tab="artists">Artists</button>
                        <button class="tab-btn" data-tab="albums">Albums</button>
                    </div>
                    <div class="library-content" id="libraryContent">
                        <!-- Library content akan diisi oleh JavaScript -->
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Player Bar -->
    <div class="player-bar">
        <div class="player-content">
            <!-- Current Song Info -->
            <div class="current-song">
                <div class="song-cover">
                    <i class="fas fa-music"></i>
                </div>
                <div class="song-info">
                    <div class="song-title" id="currentTitle">Select a song</div>
                    <div class="song-artist" id="currentArtist">-</div>
                </div>
                <button class="btn-favorite" id="btnFavorite">
                    <i class="far fa-heart"></i>
                </button>
            </div>

            <!-- Player Controls -->
            <div class="player-controls">
                <div class="control-buttons">
                    <button class="control-btn" id="btnShuffle">
                        <i class="fas fa-random"></i>
                    </button>
                    <button class="control-btn" id="btnPrevious">
                        <i class="fas fa-step-backward"></i>
                    </button>
                    <button class="control-btn btn-play" id="btnPlayPause">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="control-btn" id="btnNext">
                        <i class="fas fa-step-forward"></i>
                    </button>
                    <button class="control-btn" id="btnRepeat">
                        <i class="fas fa-redo"></i>
                    </button>
                </div>
                <div class="progress-container">
                    <span class="time-current" id="timeCurrent">0:00</span>
                    <div class="progress-bar" id="progressBar">
                        <div class="progress-fill" id="progressFill">
                            <div class="progress-handle"></div>
                        </div>
                    </div>
                    <span class="time-duration" id="timeDuration">0:00</span>
                </div>
            </div>

            <!-- Volume Controls -->
            <div class="volume-controls">
                <button class="control-btn" id="btnMute">
                    <i class="fas fa-volume-up"></i>
                </button>
                <div class="volume-bar" id="volumeBar">
                    <div class="volume-fill" id="volumeFill">
                        <div class="volume-handle"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Audio Element -->
    <audio id="audioPlayer"></audio>

    <!-- Delete Confirmation Modal -->
    <div class="modal-overlay" id="deleteModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Delete Song</h3>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to delete "<strong id="deleteSongTitle"></strong>"?</p>
                <p>This action cannot be undone.</p>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn-modal btn-modal-cancel" onclick="closeDeleteModal()">Cancel</button>
                <button type="button" class="btn-modal btn-modal-delete" onclick="confirmDelete()">Delete</button>
            </div>
        </div>
    </div>

    <!-- Create Playlist Modal -->
    <div class="modal-overlay" id="createPlaylistModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Create Playlist</h3>
            </div>
            <div class="modal-body">
                <form id="createPlaylistForm">
                    <div class="form-group">
                        <label for="playlistName" class="form-label">Playlist Name *</label>
                        <input type="text" id="playlistName" name="name" class="form-input" placeholder="My Playlist" required>
                    </div>
                    <div class="form-group">
                        <label for="playlistDescription" class="form-label">Description</label>
                        <textarea id="playlistDescription" name="description" class="form-input" rows="3" placeholder="Add a description (optional)"></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn-modal btn-modal-cancel" onclick="closeCreatePlaylistModal()">Cancel</button>
                <button type="button" class="btn-modal btn-modal-delete" onclick="confirmCreatePlaylist()">Create</button>
            </div>
        </div>
    </div>

    <!-- Add to Playlist Modal -->
    <div class="modal-overlay" id="addToPlaylistModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Add to Playlist</h3>
            </div>
            <div class="modal-body">
                <div id="playlistSelectionList">
                    <!-- Playlist list akan diisi oleh JavaScript -->
                </div>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn-modal btn-modal-cancel" onclick="closeAddToPlaylistModal()">Close</button>
            </div>
        </div>
    </div>

    <script src="{{ asset('js/dashboard.js') }}"></script>
</body>
</html>