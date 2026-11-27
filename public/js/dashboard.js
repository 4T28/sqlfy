// State Management
let songs = [];
let currentSong = null;
let isPlaying = false;
let currentSongIndex = -1;
let isShuffle = false;
let repeatMode = 0; // 0: no repeat, 1: repeat all, 2: repeat one
let volume = 70;
let isMuted = false;
let deleteTargetId = null;
let currentLibraryTab = 'playlists';
let playlists = [];
let favorites = [];
let addToPlaylistSongId = null;

// DOM Elements
const audioPlayer = document.getElementById('audioPlayer');
const btnPlayPause = document.getElementById('btnPlayPause');
const btnNext = document.getElementById('btnNext');
const btnPrevious = document.getElementById('btnPrevious');
const btnShuffle = document.getElementById('btnShuffle');
const btnRepeat = document.getElementById('btnRepeat');
const btnMute = document.getElementById('btnMute');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const volumeBar = document.getElementById('volumeBar');
const volumeFill = document.getElementById('volumeFill');
const currentTitle = document.getElementById('currentTitle');
const currentArtist = document.getElementById('currentArtist');
const timeCurrent = document.getElementById('timeCurrent');
const timeDuration = document.getElementById('timeDuration');
const searchInput = document.getElementById('searchInput');
const searchContainer = document.getElementById('searchContainer');

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    fetchSongs(); // Fetch dari database
    fetchPlaylists();
    fetchFavorites();
    setupEventListeners();
    setVolume(volume);
}

// Fetch Songs dari Database
async function fetchSongs() {
    try {
        const response = await fetch('/api/songs');
        const data = await response.json();
        songs = data;
        renderQuickPicks();
        renderSongList();
    } catch (error) {
        console.error('Error fetching songs:', error);
    }
}

async function fetchPlaylists() {
    try {
        const response = await fetch('/api/playlists');
        const data = await response.json();
        playlists = data;
    } catch (error) {
        console.error('Error fetching playlists:', error);
    }
}

async function fetchFavorites() {
    try {
        const response = await fetch('/api/favorites');
        const data = await response.json();
        favorites = data.map(fav => fav.song_id);
    } catch (error) {
        console.error('Error fetching favorites:', error);
    }
}

// Render Functions
function renderQuickPicks() {
    const quickPicks = document.getElementById('quickPicks');
    const quickPickSongs = songs.slice(0, 6);
    
    quickPicks.innerHTML = quickPickSongs.map(song => `
        <div class="quick-pick-item" onclick="playSong(${song.id})">
            <div class="quick-pick-cover" style="background-image: url('${song.cover_url || ''}')">
                ${!song.cover_url ? '<i class="fas fa-music"></i>' : ''}
            </div>
            <div class="quick-pick-title">${escapeHtml(song.title)}</div>
            <div class="quick-pick-play">
                <i class="fas fa-play"></i>
            </div>
        </div>
    `).join('');
}

function renderSongList(songArray = songs, containerId = 'songList') {
    const container = document.getElementById(containerId);
    
    if (songArray.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-400 py-8">No songs found</div>';
        return;
    }
    
    container.innerHTML = songArray.map((song, index) => {
        const isCurrentSong = currentSong && currentSong.id === song.id;
        
        return `
            <div class="song-item ${isCurrentSong && isPlaying ? 'playing' : ''}" onclick="playSong(${song.id})">
                <div class="song-number">
                    ${isCurrentSong && isPlaying ? `
                        <div class="song-playing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    ` : `
                        <span class="song-number-text">${index + 1}</span>
                        <i class="fas fa-play song-number-play"></i>
                    `}
                </div>
                <div class="song-details">
                    <div class="song-cover-small" style="background-image: url('${song.cover_url || ''}')">
                        ${!song.cover_url ? '<i class="fas fa-music"></i>' : ''}
                    </div>
                    <div class="song-text">
                        <div class="song-name">${escapeHtml(song.title)}</div>
                        <div class="song-artist">${escapeHtml(song.artist)}</div>
                    </div>
                </div>
                <div class="song-album">${escapeHtml(song.album || '-')}</div>
                <div class="song-actions">
                    <button class="btn-delete-song" onclick="event.stopPropagation(); deleteSong(${song.id}, '${escapeHtml(song.title)}')" title="Delete song">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="song-duration">${song.duration}</div>
            </div>
        `;
    }).join('');
}

// Navigation
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const view = this.getAttribute('data-view');
            switchView(view);
        });
    });

    // Player Controls
    btnPlayPause.addEventListener('click', togglePlayPause);
    btnNext.addEventListener('click', playNext);
    btnPrevious.addEventListener('click', playPrevious);
    btnShuffle.addEventListener('click', toggleShuffle);
    btnRepeat.addEventListener('click', toggleRepeat);
    btnMute.addEventListener('click', toggleMute);

    // Progress Bar
    progressBar.addEventListener('click', seekTo);
    
    // Volume Bar
    volumeBar.addEventListener('click', changeVolume);

    // Search
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Audio Events
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', handleSongEnd);
    audioPlayer.addEventListener('loadedmetadata', updateDuration);

    // Upload Form Events
    setupUploadForm();

    // Library Tabs
    setupLibraryTabs();

    // Sidebar buttons
    setupSidebarButtons();
}

function switchView(viewName) {
    // Update navigation
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.nav-item[data-view="${viewName}"]`)?.classList.add('active');

    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${viewName}View`)?.classList.add('active');

    // Show/hide search bar
    if (viewName === 'search') {
        searchContainer.style.display = 'block';
        searchInput.focus();
    } else {
        searchContainer.style.display = 'none';
    }

    // Load library content if library view
    if (viewName === 'library') {
        loadLibraryContent(currentLibraryTab);
    }
}

// Player Functions
function playSong(songId) {
    const song = songs.find(s => s.id === songId);
    if (!song) return;

    currentSong = song;
    currentSongIndex = songs.findIndex(s => s.id === songId);
    
    // Update player info
    currentTitle.textContent = song.title;
    currentArtist.textContent = song.artist;

    // Load and play audio
    if (song.url) {
        audioPlayer.src = song.url;
        audioPlayer.load();
        audioPlayer.play()
            .then(() => {
                isPlaying = true;
                updatePlayPauseButton();
            })
            .catch(error => {
                console.error('Error playing audio:', error);
                alert('Cannot play this song. Audio file may be missing.');
            });
    }

    renderSongList();
    renderQuickPicks();
}

function togglePlayPause() {
    if (!currentSong) {
        // Play first song if none selected
        if (songs.length > 0) {
            playSong(songs[0].id);
        }
        return;
    }

    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
    } else {
        audioPlayer.play()
            .then(() => {
                isPlaying = true;
            })
            .catch(error => {
                console.error('Error playing audio:', error);
            });
    }

    updatePlayPauseButton();
    renderSongList();
}

function playNext() {
    if (songs.length === 0) return;

    if (isShuffle) {
        const randomIndex = Math.floor(Math.random() * songs.length);
        playSong(songs[randomIndex].id);
    } else {
        const nextIndex = (currentSongIndex + 1) % songs.length;
        playSong(songs[nextIndex].id);
    }
}

function playPrevious() {
    if (songs.length === 0) return;

    const prevIndex = currentSongIndex === 0 ? songs.length - 1 : currentSongIndex - 1;
    playSong(songs[prevIndex].id);
}

function toggleShuffle() {
    isShuffle = !isShuffle;
    btnShuffle.style.color = isShuffle ? '#1db954' : '';
}

function toggleRepeat() {
    repeatMode = (repeatMode + 1) % 3;
    
    if (repeatMode === 0) {
        btnRepeat.style.color = '';
        btnRepeat.innerHTML = '<i class="fas fa-redo"></i>';
    } else if (repeatMode === 1) {
        btnRepeat.style.color = '#1db954';
        btnRepeat.innerHTML = '<i class="fas fa-redo"></i>';
    } else {
        btnRepeat.style.color = '#1db954';
        btnRepeat.innerHTML = '<i class="fas fa-redo"></i><span style="font-size: 10px;">1</span>';
    }
}

function toggleMute() {
    isMuted = !isMuted;
    audioPlayer.muted = isMuted;
    
    if (isMuted || volume === 0) {
        btnMute.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else {
        btnMute.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
}

function updatePlayPauseButton() {
    if (isPlaying) {
        btnPlayPause.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        btnPlayPause.innerHTML = '<i class="fas fa-play"></i>';
    }
}

// Progress and Time
function updateProgress() {
    if (audioPlayer.duration) {
        const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressFill.style.width = percent + '%';
        
        timeCurrent.textContent = formatTime(audioPlayer.currentTime);
    }
}

function updateDuration() {
    if (audioPlayer.duration) {
        timeDuration.textContent = formatTime(audioPlayer.duration);
    }
}

function seekTo(e) {
    if (!audioPlayer.duration) return;
    
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioPlayer.currentTime = percent * audioPlayer.duration;
}

function changeVolume(e) {
    const rect = volumeBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    volume = Math.max(0, Math.min(100, percent * 100));
    setVolume(volume);
}

function setVolume(vol) {
    volume = vol;
    audioPlayer.volume = vol / 100;
    volumeFill.style.width = vol + '%';
    
    if (vol === 0) {
        btnMute.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else {
        btnMute.innerHTML = '<i class="fas fa-volume-up"></i>';
        isMuted = false;
    }
}

function handleSongEnd() {
    if (repeatMode === 2) {
        // Repeat one
        audioPlayer.currentTime = 0;
        audioPlayer.play();
    } else if (repeatMode === 1) {
        // Repeat all
        playNext();
    } else {
        // No repeat
        if (currentSongIndex < songs.length - 1) {
            playNext();
        } else {
            isPlaying = false;
            updatePlayPauseButton();
        }
    }
}

// Search
function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    
    if (query === '') {
        renderSongList(songs, 'searchResults');
        return;
    }
    
    const filtered = songs.filter(song => 
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query) ||
        (song.album && song.album.toLowerCase().includes(query))
    );
    
    renderSongList(filtered, 'searchResults');
}

// Utility Functions
function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Upload Form Functions
function setupUploadForm() {
    const uploadForm = document.getElementById('uploadForm');
    const audioFile = document.getElementById('audioFile');
    const coverImage = document.getElementById('coverImage');
    const audioUploadArea = document.getElementById('audioUploadArea');
    const coverUploadArea = document.getElementById('coverUploadArea');

    if (!uploadForm) return;

    // Audio file upload
    audioUploadArea.addEventListener('click', () => audioFile.click());
    audioFile.addEventListener('change', (e) => handleFileSelect(e, 'audio'));

    // Cover image upload
    coverUploadArea.addEventListener('click', () => coverImage.click());
    coverImage.addEventListener('change', (e) => handleFileSelect(e, 'cover'));

    // Remove file buttons
    document.querySelectorAll('.btn-remove-file').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const type = btn.closest('#audioUploadArea') ? 'audio' : 'cover';
            removeFile(type);
        });
    });

    // Form submit
    uploadForm.addEventListener('submit', handleUploadSubmit);
}

function handleFileSelect(e, type) {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'audio') {
        // Validate audio file
        const maxSize = 20 * 1024 * 1024; // 20MB
        if (file.size > maxSize) {
            showUploadMessage('Audio file size must be less than 20MB', 'error');
            return;
        }

        const audioUploadArea = document.getElementById('audioUploadArea');
        const placeholder = audioUploadArea.querySelector('.upload-placeholder');
        const selected = audioUploadArea.querySelector('.file-selected');
        const fileName = selected.querySelector('.file-name');

        placeholder.style.display = 'none';
        selected.style.display = 'flex';
        fileName.textContent = file.name;

    } else if (type === 'cover') {
        // Validate image file
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            showUploadMessage('Cover image size must be less than 2MB', 'error');
            return;
        }

        const coverUploadArea = document.getElementById('coverUploadArea');
        const placeholder = coverUploadArea.querySelector('.upload-placeholder');
        const preview = coverUploadArea.querySelector('.file-preview');
        const img = preview.querySelector('img');

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
            placeholder.style.display = 'none';
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function removeFile(type) {
    if (type === 'audio') {
        const audioFile = document.getElementById('audioFile');
        const audioUploadArea = document.getElementById('audioUploadArea');
        const placeholder = audioUploadArea.querySelector('.upload-placeholder');
        const selected = audioUploadArea.querySelector('.file-selected');

        audioFile.value = '';
        placeholder.style.display = 'flex';
        selected.style.display = 'none';

    } else if (type === 'cover') {
        const coverImage = document.getElementById('coverImage');
        const coverUploadArea = document.getElementById('coverUploadArea');
        const placeholder = coverUploadArea.querySelector('.upload-placeholder');
        const preview = coverUploadArea.querySelector('.file-preview');

        coverImage.value = '';
        placeholder.style.display = 'flex';
        preview.style.display = 'none';
    }
}

async function handleUploadSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const btnSubmit = document.getElementById('btnSubmitUpload');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('uploadProgressFill');
    const progressText = document.getElementById('uploadProgressText');

    // Disable submit button
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

    // Show progress bar
    uploadProgress.style.display = 'block';

    try {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                progressFill.style.width = percent + '%';
                progressText.textContent = percent + '%';
            }
        });

        // Handle response
        xhr.addEventListener('load', () => {
            if (xhr.status === 200 || xhr.status === 201) {
                const response = JSON.parse(xhr.responseText);
                showUploadMessage('Song uploaded successfully!', 'success');
                
                // Reset form
                form.reset();
                removeFile('audio');
                removeFile('cover');
                
                // Refresh song list
                fetchSongs();

                // Switch to home view
                setTimeout(() => {
                    switchView('home');
                }, 2000);

            } else {
                const error = JSON.parse(xhr.responseText);
                showUploadMessage(error.message || 'Upload failed. Please try again.', 'error');
            }

            // Reset button
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = '<i class="fas fa-upload"></i> Upload Song';
            
            // Hide progress bar
            setTimeout(() => {
                uploadProgress.style.display = 'none';
                progressFill.style.width = '0%';
                progressText.textContent = '0%';
            }, 2000);
        });

        xhr.addEventListener('error', () => {
            showUploadMessage('Network error. Please check your connection.', 'error');
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = '<i class="fas fa-upload"></i> Upload Song';
            uploadProgress.style.display = 'none';
        });

        // Send request
        xhr.open('POST', '/api/songs/upload');
        xhr.setRequestHeader('X-CSRF-TOKEN', document.querySelector('meta[name="csrf-token"]').content);
        xhr.send(formData);

    } catch (error) {
        console.error('Upload error:', error);
        showUploadMessage('An error occurred. Please try again.', 'error');
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<i class="fas fa-upload"></i> Upload Song';
        uploadProgress.style.display = 'none';
    }
}

function showUploadMessage(message, type) {
    const messageDiv = document.getElementById('uploadMessage');
    messageDiv.textContent = message;
    messageDiv.className = 'upload-message ' + type;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Library Functions
function setupLibraryTabs() {
    const tabs = document.querySelectorAll('.library-tabs .tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Load content
            const tabType = this.getAttribute('data-tab');
            currentLibraryTab = tabType;
            loadLibraryContent(tabType);
        });
    });
}

function loadLibraryContent(type) {
    const container = document.getElementById('libraryContent');
    
    if (type === 'playlists') {
        // Show playlists
        if (playlists.length === 0) {
            container.innerHTML = `
                <div class="empty-playlists">
                    <i class="fas fa-list-music"></i>
                    <p>No playlists yet</p>
                    <p style="font-size: 14px;">Create your first playlist to organize your music</p>
                </div>
            `;
        } else {
            container.innerHTML = '<div class="artist-grid"></div>';
            const grid = container.querySelector('.artist-grid');
            
            playlists.forEach(playlist => {
                grid.innerHTML += `
                    <div class="artist-card" onclick="viewPlaylist(${playlist.id})">
                        <div class="artist-image">
                            <i class="fas fa-music"></i>
                        </div>
                        <div class="artist-name">${escapeHtml(playlist.name)}</div>
                        <div class="artist-info">${playlist.song_count || 0} songs</div>
                    </div>
                `;
            });
        }
        
    } else if (type === 'artists') {
        // Group by artists
        const artists = {};
        songs.forEach(song => {
            if (!artists[song.artist]) {
                artists[song.artist] = [];
            }
            artists[song.artist].push(song);
        });
        
        container.innerHTML = '<div class="artist-grid"></div>';
        const grid = container.querySelector('.artist-grid');
        
        Object.keys(artists).sort().forEach(artist => {
            const artistSongs = artists[artist];
            const firstSong = artistSongs[0];
            
            grid.innerHTML += `
                <div class="artist-card" onclick="filterByArtist('${escapeHtml(artist)}')">
                    <div class="artist-image">
                        ${firstSong.cover_url ? 
                            `<img src="${firstSong.cover_url}" alt="${escapeHtml(artist)}">` : 
                            '<i class="fas fa-user"></i>'
                        }
                    </div>
                    <div class="artist-name">${escapeHtml(artist)}</div>
                    <div class="artist-info">${artistSongs.length} song${artistSongs.length > 1 ? 's' : ''}</div>
                </div>
            `;
        });
        
    } else if (type === 'albums') {
        // Group by albums
        const albums = {};
        songs.forEach(song => {
            const albumName = song.album || 'Unknown Album';
            if (!albums[albumName]) {
                albums[albumName] = {
                    artist: song.artist,
                    songs: [],
                    cover: song.cover_url
                };
            }
            albums[albumName].songs.push(song);
        });
        
        container.innerHTML = '<div class="album-grid"></div>';
        const grid = container.querySelector('.album-grid');
        
        Object.keys(albums).sort().forEach(album => {
            const albumData = albums[album];
            
            grid.innerHTML += `
                <div class="album-card" onclick="filterByAlbum('${escapeHtml(album)}')">
                    <div class="album-image">
                        ${albumData.cover ? 
                            `<img src="${albumData.cover}" alt="${escapeHtml(album)}">` : 
                            '<i class="fas fa-compact-disc"></i>'
                        }
                    </div>
                    <div class="album-name">${escapeHtml(album)}</div>
                    <div class="album-info">${escapeHtml(albumData.artist)} • ${albumData.songs.length} song${albumData.songs.length > 1 ? 's' : ''}</div>
                </div>
            `;
        });
    }
}

function filterByArtist(artist) {
    const filtered = songs.filter(song => song.artist === artist);
    const container = document.getElementById('libraryContent');
    container.innerHTML = `
        <div style="margin-bottom: 24px;">
            <button onclick="loadLibraryContent('artists')" style="background: none; border: none; color: #1db954; cursor: pointer; font-size: 14px;">
                <i class="fas fa-arrow-left"></i> Back to Artists
            </button>
            <h3 style="font-size: 24px; font-weight: 700; margin-top: 16px;">${escapeHtml(artist)}</h3>
        </div>
        <div class="song-list" id="artistSongList"></div>
    `;
    renderSongList(filtered, 'artistSongList');
}

function filterByAlbum(album) {
    const filtered = songs.filter(song => (song.album || 'Unknown Album') === album);
    const container = document.getElementById('libraryContent');
    container.innerHTML = `
        <div style="margin-bottom: 24px;">
            <button onclick="loadLibraryContent('albums')" style="background: none; border: none; color: #1db954; cursor: pointer; font-size: 14px;">
                <i class="fas fa-arrow-left"></i> Back to Albums
            </button>
            <h3 style="font-size: 24px; font-weight: 700; margin-top: 16px;">${escapeHtml(album)}</h3>
        </div>
        <div class="song-list" id="albumSongList"></div>
    `;
    renderSongList(filtered, 'albumSongList');
}

// Delete Functions
function deleteSong(songId, songTitle) {
    deleteTargetId = songId;
    document.getElementById('deleteSongTitle').textContent = songTitle;
    document.getElementById('deleteModal').classList.add('active');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    deleteTargetId = null;
}

async function confirmDelete() {
    if (!deleteTargetId) return;

    try {
        const response = await fetch(`/api/songs/${deleteTargetId}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            // Remove from songs array
            songs = songs.filter(s => s.id !== deleteTargetId);
            
            // Stop playing if current song
            if (currentSong && currentSong.id === deleteTargetId) {
                audioPlayer.pause();
                currentSong = null;
                isPlaying = false;
                updatePlayPauseButton();
                currentTitle.textContent = 'Select a song';
                currentArtist.textContent = '-';
            }
            
            // Refresh displays
            renderQuickPicks();
            renderSongList();
            
            // If in library view, refresh library
            if (document.getElementById('libraryView').classList.contains('active')) {
                loadLibraryContent(currentLibraryTab);
            }
            
            closeDeleteModal();
            
            // Show success message
            alert('Song deleted successfully!');
        } else {
            const error = await response.json();
            alert('Failed to delete song: ' + (error.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('An error occurred while deleting the song.');
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('deleteModal');
    if (e.target === modal) {
        closeDeleteModal();
    }
    
    const createModal = document.getElementById('createPlaylistModal');
    if (e.target === createModal) {
        closeCreatePlaylistModal();
    }
    
    const addModal = document.getElementById('addToPlaylistModal');
    if (e.target === addModal) {
        closeAddToPlaylistModal();
    }
});

// Sidebar Functions
function setupSidebarButtons() {
    const btnCreatePlaylist = document.getElementById('btnCreatePlaylist');
    const btnLikedSongs = document.getElementById('btnLikedSongs');
    
    if (btnCreatePlaylist) {
        btnCreatePlaylist.addEventListener('click', function(e) {
            e.preventDefault();
            openCreatePlaylistModal();
        });
    }
    
    if (btnLikedSongs) {
        btnLikedSongs.addEventListener('click', function(e) {
            e.preventDefault();
            viewLikedSongs();
        });
    }
}

function openCreatePlaylistModal() {
    document.getElementById('createPlaylistModal').classList.add('active');
    document.getElementById('playlistName').focus();
}

function closeCreatePlaylistModal() {
    document.getElementById('createPlaylistModal').classList.remove('active');
    document.getElementById('createPlaylistForm').reset();
}

async function confirmCreatePlaylist() {
    const name = document.getElementById('playlistName').value.trim();
    const description = document.getElementById('playlistDescription').value.trim();
    
    if (!name) {
        alert('Please enter a playlist name');
        return;
    }
    
    try {
        const response = await fetch('/api/playlists', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, description })
        });
        
        if (response.ok) {
            const playlist = await response.json();
            playlists.push(playlist);
            closeCreatePlaylistModal();
            
            // Switch to library and reload playlists
            switchView('library');
            loadLibraryContent('playlists');
            
            alert('Playlist created successfully!');
        } else {
            const error = await response.json();
            alert('Failed to create playlist: ' + (error.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Create playlist error:', error);
        alert('An error occurred while creating the playlist.');
    }
}

async function viewPlaylist(playlistId) {
    try {
        const response = await fetch(`/api/playlists/${playlistId}`);
        const playlist = await response.json();
        
        const container = document.getElementById('libraryContent');
        container.innerHTML = `
            <div style="margin-bottom: 24px;">
                <button onclick="loadLibraryContent('playlists')" style="background: none; border: none; color: #1db954; cursor: pointer; font-size: 14px;">
                    <i class="fas fa-arrow-left"></i> Back to Playlists
                </button>
                <h3 style="font-size: 24px; font-weight: 700; margin-top: 16px;">${escapeHtml(playlist.name)}</h3>
                ${playlist.description ? `<p style="color: #b3b3b3; margin-top: 8px;">${escapeHtml(playlist.description)}</p>` : ''}
            </div>
            <div class="song-list" id="playlistSongList"></div>
        `;
        
        if (playlist.songs && playlist.songs.length > 0) {
            renderSongList(playlist.songs, 'playlistSongList');
        } else {
            document.getElementById('playlistSongList').innerHTML = '<div style="text-align: center; color: #b3b3b3; padding: 32px;">No songs in this playlist</div>';
        }
    } catch (error) {
        console.error('View playlist error:', error);
    }
}

async function viewLikedSongs() {
    try {
        const response = await fetch('/api/favorites');
        const favSongs = await response.json();
        
        // Switch to library view
        switchView('library');
        
        const container = document.getElementById('libraryContent');
        container.innerHTML = `
            <div style="margin-bottom: 24px;">
                <button onclick="switchView('home')" style="background: none; border: none; color: #1db954; cursor: pointer; font-size: 14px;">
                    <i class="fas fa-arrow-left"></i> Back
                </button>
                <h3 style="font-size: 24px; font-weight: 700; margin-top: 16px;">
                    <i class="fas fa-heart" style="color: #1db954; margin-right: 8px;"></i>
                    Liked Songs
                </h3>
            </div>
            <div class="song-list" id="likedSongsList"></div>
        `;
        
        if (favSongs.length > 0) {
            renderSongList(favSongs, 'likedSongsList');
        } else {
            document.getElementById('likedSongsList').innerHTML = '<div style="text-align: center; color: #b3b3b3; padding: 32px;">No liked songs yet</div>';
        }
    } catch (error) {
        console.error('View liked songs error:', error);
    }
}

async function toggleFavorite(songId) {
    try {
        const response = await fetch(`/api/favorites/${songId}/toggle`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.is_favorite) {
                favorites.push(songId);
            } else {
                favorites = favorites.filter(id => id !== songId);
            }
            
            // Update UI
            renderSongList();
        }
    } catch (error) {
        console.error('Toggle favorite error:', error);
    }
}