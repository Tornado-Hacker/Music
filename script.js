// Selecting elements from the DOM
const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("search-input");
const resultsContainer = document.getElementById("results-container");

// Event listener for the search button
searchButton.addEventListener("click", async () => {
    const query = searchInput.value.trim().toLowerCase();
    if (query.length > 0) {
        try {
            const results = await fetchSearchResults(query);
            console.log('Search results:', results); // Log the results to check the structure
            displayResults(results);
        } catch (error) {
            console.error('Error fetching search results:', error);
            resultsContainer.innerHTML = '<p>Failed to fetch search results. Please try again later.</p>';
        }
    } else {
        resultsContainer.innerHTML = '<p>Please enter a search query.</p>';
    }
});

// Function to fetch search results from Saavn API
async function fetchSearchResults(query) {
    try {
        const response = await fetch(`https://saavn.dev/api/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.data; // Extracting only the 'data' object from the response
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Re-throw the error to be caught by the caller (in event listener)
    }
}

// Function to display search results in results container
async function displayResults(results) {
    let html = '';
    // Display songs
    if (results.songs && results.songs.results.length > 0) {
        html += '<h2>Songs</h2>';
        html += '<div class="songs-container">';
        for (const song of results.songs.results) {
            try {
                const songData = await fetchSongUrls(song.id);
                const mp4Url = songData.downloadUrl.find(item => item.quality === '160kbps')?.url;

                html += `
                    <div class="result-item">
                        <div class="left">
                            <img src="${song.image[2].url}" alt="Song Image">
                            <div class="song-info">
                                <p>Song: ${song.title}</p>
                                <p>Artists: ${song.primaryArtists}</p>
                                <p>Album: ${song.album}</p>
                            </div>
                        </div>
                        <div class="right">
                            <audio controls>
                                <source src="${mp4Url}" type="audio/mp4">
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    </div>
                `;
            } catch (error) {
                console.error('Error fetching song URLs:', error);
                html += `
                    <div class="result-item">
                        <p>Error fetching song data for "${song.title}". Please try again later.</p>
                    </div>
                `;
            }
        }
        html += '</div>'; // Close songs-container div
    }
    // Display albums
    if (results.albums && results.albums.results.length > 0) {
        html += '<h2>Albums</h2>';
        results.albums.results.forEach(album => {
            html += `
                <div class="result-item">
                    <div class="left">
                        <img src="${album.image[2].url}" alt="Album Image">
                        <div class="album-info">
                            <p>Album: ${album.title}</p>
                            <p>Artist: ${album.artist}</p>
                        </div>
                    </div>
                    <div class="right">
                        <!-- Placeholder for album-specific content -->
                    </div>
                </div>
            `;
        });
    }
     // Display artists
     if (results.artists && results.artists.results.length > 0) {
        html += '<h2>Artists</h2>';
        results.artists.results.forEach(artist => {
            html += `
                <div class="result-item">
                    <div class="left">
                        <img src="${artist.image[2].url}" alt="Artist Image">
                        <div class="artist-info">
                            <p>Artist: ${artist.title}</p>
                            <p>Description: ${artist.description}</p>
                        </div>
                    </div>
                    <div class="right">
                        <!-- Placeholder for artist-specific content -->
                    </div>
                </div>
            `;
        });
    }

    resultsContainer.innerHTML = html;

    // Add event listeners to dynamically loaded audio elements
    addAudioEventListeners();
}

// Function to fetch song URLs from Saavn API based on song ID
async function fetchSongUrls(songId) {
    try {
        const response = await fetch(`https://saavn.dev/api/songs/${songId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.data[0]; // Assuming data is an array and we take the first item
    } catch (error) {
        console.error('Error fetching song data:', error);
        throw error; // Re-throw the error to be caught by the caller (in displayResults)
    }
}

// Function to add event listeners to dynamically loaded audio elements
function addAudioEventListeners() {
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
        audio.addEventListener('play', () => {
            console.log('Audio started playing:', audio.src);
            // You can add additional functionality here, such as tracking plays or displaying current playing song info.
        });
        audio.addEventListener('pause', () => {
            console.log('Audio paused:', audio.src);
            // Additional functionality can be added on pause event.
        });
        audio.addEventListener('ended', () => {
            console.log('Audio ended:', audio.src);
            // Additional functionality can be added on audio end event.
        });
    });
}
