import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [accessToken, setAccessToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [similarSongs, setSimilarSongs] = useState([]);
  const [songLink, setSongLink] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Use the Spotify API to exchange the email and password for an access token
      const response = await axios.post('https://accounts.spotify.com/api/token', {
        grant_type: 'password',
        username: email,
        password: password,
      }, {
        auth: {
          username: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
          password: process.env.REACT_APP_SPOTIFY_CLIENT_SECRET,
        },
      });

      // Update the state with the access token
      setAccessToken(response.data.access_token);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Extract the song ID from the song link
      const songId = songLink.split('/')[4];

      // Use the Spotify API to search for similar songs
      const response = await axios.get(`https://api.spotify.com/v1/tracks/${songId}/recommendations`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        params: {
          limit: 50, // Set a limit of 50 similar songs
          seed_tracks: songId, // Set the song as the seed track for the recommendations
          target_popularity: 0, // Set the target popularity to 0, which will return only very unpopular songs
        }
      });

      // Update the state with the similar songs
      setSimilarSongs(response.data.tracks);
    } catch (error) {
      console.error(error);
    }
  };

  return (
      <div>
        {accessToken ? (
            <form onSubmit={handleSubmit}>
              <label htmlFor="song-link">
                Paste a Spotify song link:
                <input
                    id="song-link"
                    type="text"
                    value={songLink}
                    onChange={e => setSongLink(e.target.value)}
                />
              </label>
              <button type="submit">Search</button>
            </form>
        ) : (
            <form onSubmit={handleLogin}>
              <label htmlFor="email">
                Email:
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
              </label>
              <label htmlFor="password">
                Password:
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
              </label>
              <button type="submit">Log in</button>
            </form>
        )}
        {similarSongs.length > 0 && (
            <ul>
              {similarSongs.map(song => (
                  <li key={song.id}>
                    {song.name} by {song.artists[0].name}
                  </li>
              ))}
            </ul>
        )}
      </div>
  );
};

export default App;

