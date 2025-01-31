const express = require('express');
const cors = require('cors');
const session = require('express-session');
const dotenv = require('dotenv');
const { getToken, refreshAccessToken } = require('./routes/auth');
const { searchAlgo } = require('./routes/search');
const { createPlaylistOnSpotify } = require('./utils/createPlaylist');
const { Visit } = require('./models/visit');
const { sequelize } = require('./config/db'); // Sequelize instance

dotenv.config({path:'./config/.env'});
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
}));

// Routes
app.get('/api/getvisits', async (req, res) => {
  const visitCount = await Visit.count();
  res.json({ visits: visitCount });
});

app.get('/api/login', async (req, res) => {
  const isGuest = req.query.guest === 'true';
  
  if (isGuest) {
    req.session.userType = 'guest';
    const userToken = await refreshAccessToken(process.env.GUEST_REFRESH_TOKEN);
    req.session.token = userToken;
    return res.redirect("/search");
  }

  req.session.userType = 'normal';
  
  const authQueryParameters = {
    response_type: "code",
    redirect_uri: process.env.REDIRECT_URI,
    scope: "playlist-modify-public",
    client_id: process.env.CLIENT_ID,
  };
  
  const urlArgs = new URLSearchParams(authQueryParameters).toString();
  const authUrl = `${process.env.AUTH_URL}/?${urlArgs}`;
  res.redirect(authUrl);
});

app.get('/api/callback', async (req, res) => {
  const authToken = req.query.code;
  const codePayload = {
    grant_type: "authorization_code",
    code: authToken,
    redirect_uri: process.env.REDIRECT_URI,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
  };
  
  const postRequest = await axios.post(process.env.TOKEN_URL, codePayload);
  const responseData = postRequest.data;
  req.session.token = responseData.access_token;

  res.redirect("/search");
});

app.get('/api/logout', (req, res) => {
  if (req.session.userType === 'normal') {
    req.session.token = null;
  }
  res.redirect("/");
});

app.post("/api/search", async (req, res) => {
  const newVisit = await Visit.create(); // Assuming Sequelize ORM
  const query = req.body.query.trim();
  const token = getToken(req.session.token);
  
  const result = await searchAlgo(token, query);
  
  res.json(result);
});

app.post("/api/create_playlist", async (req, res) => {
  const newVisit = await Visit.create();
  const userToken = req.session.token;
  const songIds = req.body.song_ids;
  
  const responseData = await createPlaylistOnSpotify(userToken, songIds);
  
  if (responseData.success) {
    res.json(responseData);
  } else {
    res.status(500).json(responseData);
  }
});

app.get("/search", (req, res) => {
  if (!req.session.userType) {
    return res.redirect("/");
  }
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// Static file serving
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// Start the server
sequelize.sync().then(() => {
  app.listen(process.env.PORT || 5000, () => {
    console.log("Server is running...");
  });
});
