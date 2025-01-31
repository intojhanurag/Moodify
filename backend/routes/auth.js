const axios = require('axios');
const base64 = require('base-64');
const dotenv = require('dotenv');

dotenv.config();

// Getting environment variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

// Function to get authorization headers with a token
function getAuthHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

// Function to get a token using client credentials
async function getToken() {
  const authString = `${CLIENT_ID}:${CLIENT_SECRET}`;
  const authBase64 = base64.encode(authString);

  const url = "https://accounts.spotify.com/api/token";
  const headers = {
    Authorization: `Basic ${authBase64}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
  
  const data = { grant_type: "client_credentials" };
  
  try {
    const result = await axios.post(url, data, { headers });
    const token = result.data.access_token;
    return token;
  } catch (error) {
    console.error("Error getting token:", error.response ? error.response.data : error.message);
    return null;
  }
}

// Function to refresh the access token using a refresh token
async function refreshAccessToken(refreshToken) {
  const refreshUrl = "https://accounts.spotify.com/api/token";
  const headers = {
    Authorization: `Basic ${base64.encode(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
  };
  
  const data = {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  };
  
  try {
    const response = await axios.post(refreshUrl, data, { headers });
    if (response.status === 200) {
      return response.data.access_token;
    } else {
      console.error("Error in refreshing token:", response.data);
      return null;
    }
  } catch (error) {
    console.error("Error in refreshing token:", error.response ? error.response.data : error.message);
    return null;
  }
}

module.exports = { getAuthHeader, getToken, refreshAccessToken };
