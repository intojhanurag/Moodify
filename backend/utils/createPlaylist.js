const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";

// Function to create a playlist on Spotify
async function createPlaylistOnSpotify(userToken, songIds) {
  try {
    const headers = {
      "Authorization": `Bearer ${userToken}`,
    };

    // Get current user info
    const currentUserResponse = await axios.get(`${SPOTIFY_API_BASE_URL}/me`, { headers });
    const userId = currentUserResponse.data.id;

    // Create the playlist
    const createPlaylistData = {
      name: "My Custom Playlist",
      description: "Created using weirdspotify.com",
      public: true,
    };

    const createPlaylistResponse = await axios.post(
      `${SPOTIFY_API_BASE_URL}/users/${userId}/playlists`,
      createPlaylistData,
      { headers }
    );

    const playlistId = createPlaylistResponse.data.id;

    // Add tracks to the playlist
    const addTracksData = {
      uris: songIds.map((songId) => `spotify:track:${songId}`),
    };

    const addTracksResponse = await axios.post(
      `${SPOTIFY_API_BASE_URL}/playlists/${playlistId}/tracks`,
      addTracksData,
      { headers }
    );

    // Delay for a short time before sending the response
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check the response status for success or failure
    if (addTracksResponse.status < 300) {
      return {
        success: true,
        message: "Playlist created successfully",
        playlist_url: createPlaylistResponse.data.external_urls.spotify,
      };
    } else {
      return {
        success: false,
        message: "Failed to add tracks to the playlist",
        playlist_url: null,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message,
      playlist_url: null,
    };
  }
}

module.exports = { createPlaylistOnSpotify };
