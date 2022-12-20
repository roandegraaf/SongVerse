import React, {useEffect, useState} from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

const App = () => {
    const [similarSongs, setSimilarSongs] = useState([]);
    const [songLink, setSongLink] = useState('');
    const [playlistId, setPlaylistId] = useState(null);

    const CLIENT_ID = "51a7443fa7e54e6dbba2eeb3baf569a9"
    const REDIRECT_URI = "https://songverse.servertj.nl"
    //const REDIRECT_URI = "http://localhost:3000"
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
    const RESPONSE_TYPE = "token"
    const SCOPE = "user-read-currently-playing playlist-modify-private playlist-modify-public playlist-read-private playlist-read-collaborative"

    const [token, setToken] = useState("")


    useEffect(() => {
        document.title = "SongVerse";

        const hash = window.location.hash
        let token = window.localStorage.getItem("token")

        if (!token && hash) {
            token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

            window.location.hash = ""
            window.localStorage.setItem("token", token)
        }

        setToken(token)

    }, [token]);


    async function createPlaylist() {
        const response = await fetch('https://api.spotify.com/v1/me/playlists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'SongVerse Playlist',
                description: 'A playlist created with SongVerse',
                public: true
            })
        });
        const data = await response.json();
        setPlaylistId(data.id);
    }

    useEffect(() => {
        addSongsToPlaylist()
    }, [playlistId]);
    async function addSongsToPlaylist() {
        if (!playlistId || !token) {
            return;
        }
        console.log(similarSongs)
        const trackUris = similarSongs.map(r => r.uri);
        await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                uris: trackUris
            })
        }, [])
    }

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
            setSimilarSongs(response.data.tracks);
        } catch (error) {
            console.error(error);
        }
    };

    const getUserId = () => {
        if (token) {
            const headers = {Authorization: `Bearer ${token}`}
            return fetch("https://api.spotify.com/v1/me", {headers: headers})
                .then(response => response.json())
                .then(jsonResponse => {
                    if (jsonResponse) {
                        const {id, display_name, email, external_urls, images} = jsonResponse
                        const profile = {
                            user_id: id,
                            email: email,
                            name: display_name,
                            image: images[0].url,
                            url: external_urls.spotify
                        }
                        console.log(profile.user_id)
                        return profile
                    }
                })
        }
    }

    return (

        <div>
            {token ? (
                <div>
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
                    <button onClick={createPlaylist}>Create Playlist</button>
                    <button onClick={logout}>Logout</button>
                </div>
            ) : (
                <div>
                    <header className="App-header">
                        <h1>SongVerse</h1>
                        <br/>
                    </header>
                    <p className={"paragraph"}>
                        <p1>With this app you can provide a Spotify song link and get a list of 50 similar songs, but very unpopular ones. It's like a Spotify Song Radio, but with songs you probably don't know yet.</p1>
                    </p>
                    <br/>
                    {!token ?
                        <a type="button" className="btn btn-success"
                           href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor"
                                 className="bi bi-spotify" viewBox="0 0 18 18">
                                <path
                                    d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.669 11.538a.498.498 0 0 1-.686.165c-1.879-1.147-4.243-1.407-7.028-.77a.499.499 0 0 1-.222-.973c3.048-.696 5.662-.397 7.77.892a.5.5 0 0 1 .166.686zm.979-2.178a.624.624 0 0 1-.858.205c-2.15-1.321-5.428-1.704-7.972-.932a.625.625 0 0 1-.362-1.194c2.905-.881 6.517-.454 8.986 1.063a.624.624 0 0 1 .206.858zm.084-2.268C10.154 5.56 5.9 5.419 3.438 6.166a.748.748 0 1 1-.434-1.432c2.825-.857 7.523-.692 10.492 1.07a.747.747 0 1 1-.764 1.288z"/>
                            </svg>
                            Login to Spotify</a>
                        : <button onClick={logout}>Logout</button>}
                </div>
            )}
            {similarSongs.length > 0 && (
                <ul>
                    {similarSongs.map(song => (
                        <li key={song.id}>
                            <a href={song.uri} target="_blank" rel="noopener noreferrer">{song.name}</a> by <a
                            href={song.artists[0].uri} target="_blank"
                            rel="noopener noreferrer">{song.artists[0].name}</a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default App;

