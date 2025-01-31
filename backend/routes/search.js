const { getAuthHeader } = require('./auth');
const { Song } = require('../models/song');
const axios = require('axios');
const random = require('random');

// Constants
const depth = 50;
const maxPages = 5;

// Function to handle the search algorithm
async function searchAlgo(token, query) {
    const words = query.split(' ').filter(word => word);
    const out = [];
    let matchedIndices = new Set();  // To keep track of matched word indices
    let unmatchedWords = new Set(words);  // To track unmatched words

    for (let windowSize = 1; windowSize <= words.length; windowSize++) {
        for (let i = 0; i <= words.length - windowSize; i++) {
            // Skip if already matched
            if (Array.from(matchedIndices).some(idx => idx >= i && idx < i + windowSize)) continue;

            const substring = words.slice(i, i + windowSize).join(' ');

            // First, check the database
            let dbResult = await searchInDatabase(substring);
            if (dbResult) {
                out.push(dbResult);
                for (let j = i; j < i + windowSize; j++) matchedIndices.add(j);
                unmatchedWords.delete(substring);
                continue;
            }

            // Check in Spotify
            let results = await searchForSong(token, substring);
            if (results) {
                for (const entry of results) {
                    if (substring.toLowerCase() === entry.name.toLowerCase()) {
                        const songData = {
                            id: entry.id,
                            name: entry.name,
                            artist: entry.artists[0].name,
                            image_url: entry.album.images.length ? entry.album.images[0].url : null
                        };
                        out.push(songData);
                        for (let j = i; j < i + windowSize; j++) matchedIndices.add(j);
                        unmatchedWords.delete(substring);
                        break;
                    }
                }
            }
        }
    }

    // Handle unmatched words
    const errorMessages = Array.from(unmatchedWords).map(word => `Error: word '${word}' is not a Spotify Song`);

    console.log(`query: ${query}`);
    return { songs: out, errors: errorMessages };
}

// Function to search the database
async function searchInDatabase(songName) {
    const song = await Song.findOne({ where: { name: songName } });

    if (song) {
        const songData = JSON.parse(song.song_data);
        const songIdx = random.int(0, songData.length - 1);

        return {
            id: songData[songIdx].id,
            name: song.name,
            artist: songData[songIdx].artists[0].name,
            image_url: songData[songIdx].album.images.length ? songData[songIdx].album.images[0].url : null
        };
    }

    return null;
}

// Function to search for songs on Spotify
async function searchForSong(token, songName) {
    const url = 'https://api.spotify.com/v1/search';
    const headers = getAuthHeader(token);
    const baseQuery = `?q=${songName}&type=track&market=US&limit=${depth}`;
    let pageCount = 0;
    const exactMatches = [];

    while (pageCount < maxPages) {
        const offset = pageCount * depth;
        const queryUrl = `${url}${baseQuery}&offset=${offset}`;

        try {
            const result = await axios.get(queryUrl, { headers });
            const jsonResult = result.data.tracks.items;
            if (!jsonResult.length) break;

            jsonResult.forEach(song => {
                if (song.name.toLowerCase() === songName.toLowerCase()) exactMatches.push(song);
            });

            if (exactMatches.length) break;
            pageCount++;
        } catch (error) {
            break;
        }
    }

    return exactMatches.length ? exactMatches : null;
}

module.exports = { searchAlgo };
