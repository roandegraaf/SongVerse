import React, {useEffect, useState } from 'react';
import axios from 'axios';
import 'react-spotify-auth/dist/index.css'


const App = () => {
  const [similarSongs, setSimilarSongs] = useState([]);
  const [songLink, setSongLink] = useState('');

  const CLIENT_ID = "51a7443fa7e54e6dbba2eeb3baf569a9"
  const REDIRECT_URI = "https://spotify.servertj.nl"
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"

  const [token, setToken] = useState("")


  useEffect(() => {
    const hash = window.location.hash
    let token = window.localStorage.getItem("token")

    if (!token && hash) {
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

      window.location.hash = ""
      window.localStorage.setItem("token", token)
    }

    setToken(token)

  }, [])

  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Extract the song ID from the song link
      const songExtract = songLink.split('/').pop();

      const songId = songExtract.split('?')[0];

      // Use the Spotify API to search for similar songs
      const response = await axios.get(`https://api.spotify.com/v1/recommendations?limit=50&market=NL&seed_tracks=${songId}&target_popularity=0`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {
          limit: 50, // Set a limit of 50 similar songs
          seed_tracks: songId, // Set the song as the seed track for the recommendations
          target_popularity: 0, // Set the target popularity to 0, which will return only very unpopular songs
        }
      });

      // Update the state with the similar songs
      console.log(response.data)
      setSimilarSongs(response.data.tracks);
    } catch (error) {
      console.error(error);
    }
  };

  return (
      <div>
        {token ? (
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
              <button onClick={logout}>Logout</button>
            </form>
        ) : (
              <header className="App-header">
                <h1>Spotify React</h1>
                {!token ?
                    <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Login
                      to Spotify</a>
                    : <button onClick={logout}>Logout</button>}
              </header>
        )}
        {similarSongs.length > 0 && (
            <ul>
              {similarSongs.map(song => (
                  <li key={song.id}>
                    <a href={song.uri} target="_blank">{song.name}</a> by {song.artists[0].name}
                  </li>
              ))}
            </ul>
        )}
      </div>
  );
};

export default App;

