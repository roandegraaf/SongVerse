import React, {useEffect, useState} from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import header_logo from './logo/header_big.png'


const App = () => {
    const [similarSongs, setSimilarSongs] = useState([]);
    const [songLink, setSongLink] = useState('');
    const [playlistId, setPlaylistId] = useState(null);

    const REDIRECT_URI = "https://songverse.app"
    //const REDIRECT_URI = "http://localhost:3000"
    const CLIENT_ID = "51a7443fa7e54e6dbba2eeb3baf569a9"
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
    const RESPONSE_TYPE = "token"
    const SCOPE = "user-read-currently-playing playlist-modify-private playlist-modify-public playlist-read-private playlist-read-collaborative"

    const [token, setToken] = useState("")
    const [notification, setNotification] = useState('');
    const [showNotification, setShowNotification] = useState(false);
    const [isDisabled, setIsDisabled] = useState(true);

    const [danceability, setDanceability] = useState(0.5);
    const [energy, setEnergy] = useState(0.5);
    const [loudness, setLoudness] = useState(0.5);
    const [valence, setValence] = useState(0.5);
    const [isEnergyEnabled, setIsEnergyEnabled] = useState(false);
    const [isLoudnessEnabled, setIsLoudnessEnabled] = useState(false);
    const [isDanceabilityEnabled, setIsDanceabilityEnabled] = useState(false);
    const [isValenceEnabled, setIsValenceEnabled] = useState(false);
    const [sliderIsEnabled, setSliderIsEnabled] = useState(false);

    const getQueryParams = () => {
        const params = [];

        if (isEnergyEnabled) {
            params.push(`target_energy=${energy}`);
        }

        if (isLoudnessEnabled) {
            params.push(`target_loudness=${loudness}`);
        }

        if (isDanceabilityEnabled) {
            params.push(`target_danceability=${danceability}`);
        }

        if (isValenceEnabled) {
            params.push(`target_valence=${valence}`);
        }

        return params.join('&');
    };

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const toggleTheme = () => {
        if (theme === 'light') {
            setTheme('dark');
        } else {
            setTheme('light');
        }
    };

    const handleDanceabilityChange = (event) => {
        setDanceability(event.target.value / 100);
    };

    const handleEnergyChange = (event) => {
        setEnergy(event.target.value / 100);
    };

    const handleLoudnessChange = (event) => {
        setLoudness(event.target.value / 100);
    };

    const handleValenceChange = (event) => {
        setValence(event.target.value / 100);
    }

    const handleDanceabilityCheckboxChange = () => {
        setIsDanceabilityEnabled(!isDanceabilityEnabled);
    }

    const handleEnergyCheckboxChange = () => {
        setIsEnergyEnabled(!isEnergyEnabled);
    }

    const handleLoudnessCheckboxChange = () => {
        setIsLoudnessEnabled(!isLoudnessEnabled);
    }

    const handleValenceCheckboxChange = () => {
        setIsValenceEnabled(!isValenceEnabled);
    }

    const handleClick = () => {
        setSliderIsEnabled(!sliderIsEnabled);
    };

    useEffect(() => {
        localStorage.setItem('theme', theme);
        document.body.className = theme;
    }, [theme]);

    useEffect(() => {
        document.body.className = theme;
    }, [theme]);

    useEffect(() => {
        const toggle = document.querySelector('.toggle-checkbox');
        toggle.checked = theme === 'dark';
    }, [theme]);

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
            method: 'POST', headers: {
                'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`
            }, body: JSON.stringify({
                name: 'SongVerse Playlist', description: 'A playlist created with SongVerse', public: true
            })
        });
        const data = await response.json();
        setPlaylistId(data.id);

        setIsDisabled(true);
        setNotification('Playlist created!');
        setShowNotification(true);
        setTimeout(() => {
            setShowNotification(false);
        }, 1500);
    }

    useEffect(() => {
        addSongsToPlaylist()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playlistId]);

    async function addSongsToPlaylist() {
        if (!playlistId || !token) {
            return;
        }
        console.log(similarSongs)
        const trackUris = similarSongs.map(r => r.uri);
        await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: 'POST', headers: {
                'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`
            }, body: JSON.stringify({
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
            const songExtract = songLink.split('/').pop();
            const songId = songExtract.split('?')[0];
            const urlWithOptions = `https://api.spotify.com/v1/recommendations?limit=50&market=NL&seed_tracks=${songId}&target_popularity=0&${getQueryParams()}`;
            const url = `https://api.spotify.com/v1/recommendations?limit=50&seed_tracks=${songId}&target_popularity=0`

            if (sliderIsEnabled) {
                const response = await axios.get(urlWithOptions, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });

                console.log(response)
                setSimilarSongs(response.data.tracks);
            }
            else {
                const response = await axios.get(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });

                console.log(response)
                setSimilarSongs(response.data.tracks);
            }
            setIsDisabled(false);
        } catch (error) {
            console.error(error);
            logout();
        }
    };

    return (<body className={`App ${theme}`}>
    <div>
        <header className="App-header">
            <img src={header_logo} alt={"SongVerse"} width={3300} height={800}/>
        </header>
        <label>
            <input className='toggle-checkbox' type='checkbox' onChange={toggleTheme}></input>
            <div className='toggle-slot'>
                <div className='sun-icon-wrapper'>
                    <div className="iconify sun-icon" data-icon="feather-sun" data-inline="false"></div>
                </div>
                <div className='toggle-button'></div>
                <div className='moon-icon-wrapper'>
                    <div className="iconify moon-icon" data-icon="feather-moon" data-inline="false"></div>
                </div>
            </div>
        </label>
        {token ? (<div className={"main-page"}>
            <label htmlFor="song-link" className={"song-link-label"}>
                Paste a Spotify song link:
            </label>
            <form className={"textbox"}>
                <input
                    id="song-link"
                    type="text"
                    value={songLink}
                    onChange={e => setSongLink(e.target.value)}
                />
            </form>
            <div className={"buttons"}>
                <div className="notification-container">
                    <div className={`notification ${showNotification ? 'show' : ''}`}>
                        {notification}
                    </div>
                </div>
                <button type="button" className={"btn btn-primary"} onClick={handleSubmit}>Search</button>
                <button id={"options-button"} className={"btn btn-secondary"} onClick={handleClick}>Options
                </button>
                <button id="create-playlist" type="button" className={"btn btn-secondary"}
                        onClick={createPlaylist} disabled={isDisabled}>Create Playlist
                </button>
                {/*<button type="button" className={"btn btn-secondary"} onClick={logout}>Logout</button>*/}
            </div>
            <div className="slidedown">
                {sliderIsEnabled && (<div className="slidedown-content">
                    <div className="SlideDownMenu-content">
                        <div className="menu-item">
                            <input type="checkbox" checked={isEnergyEnabled} onChange={handleEnergyCheckboxChange}/>
                            <label>Energy:</label>
                            <input type="range" min="0" max="100" step="0.01" value={energy * 100} onChange={handleEnergyChange} disabled={!isEnergyEnabled}/>
                        </div>
                        <div className="menu-item">
                            <input type="checkbox" checked={isLoudnessEnabled} onChange={handleLoudnessCheckboxChange}/>
                            <label>Loudness:</label>
                            <input type="range" min="0" max="100" step="0.01" value={loudness * 100} onChange={handleLoudnessChange} disabled={!isLoudnessEnabled}/>
                        </div>
                        <div className="menu-item">
                            <input type="checkbox" checked={isDanceabilityEnabled} onChange={handleDanceabilityCheckboxChange}/>
                            <label>Danceability:</label>
                            <input type="range" min="0" max="100" step="0.01" value={danceability * 100} onChange={handleDanceabilityChange} disabled={!isDanceabilityEnabled}/>
                        </div>
                        <div className="menu-item">
                            <input type="checkbox" checked={isValenceEnabled} onChange={handleValenceCheckboxChange}/>
                            <label>Happiness:</label>
                            <input type="range" min="0" max="100" step="0.01" value={valence * 100} onChange={handleValenceChange} disabled={!isValenceEnabled}/>
                        </div>
                    </div>
                </div>)}
            </div>
            <div className="song-grid">
                {similarSongs.length > 0 && similarSongs.map(song => (<a href={song.uri}>
                    <div className="song" key={song.id}>
                        <img src={song.album.images[0].url} alt={`${song.name} album cover`}/>
                        <div className="song-info">
                            <h5>{song.name}</h5>
                            <p>{song.artists[0].name}</p>
                        </div>
                        <a className={"song-link"} href={song.uri}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                                 className="bi bi-spotify" viewBox="0 0 18 18">
                                <path
                                    d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.669 11.538a.498.498 0 0 1-.686.165c-1.879-1.147-4.243-1.407-7.028-.77a.499.499 0 0 1-.222-.973c3.048-.696 5.662-.397 7.77.892a.5.5 0 0 1 .166.686zm.979-2.178a.624.624 0 0 1-.858.205c-2.15-1.321-5.428-1.704-7.972-.932a.625.625 0 0 1-.362-1.194c2.905-.881 6.517-.454 8.986 1.063a.624.624 0 0 1 .206.858zm.084-2.268C10.154 5.56 5.9 5.419 3.438 6.166a.748.748 0 1 1-.434-1.432c2.825-.857 7.523-.692 10.492 1.07a.747.747 0 1 1-.764 1.288z"/>
                            </svg>
                            Play on Spotify
                        </a>
                    </div>
                </a>))}
            </div>
        </div>) : (<body>
        <div className={"login-page"}>
            <p className={"paragraph"}>
                <p1>With this app you can provide a Spotify song link and get a list of 50 similar songs,
                    but
                    very unpopular ones. It's like a Spotify Song Radio, but with songs you probably don't
                    know
                    yet.
                </p1>
            </p>
            <br/>
            {!token ? <a type="button" className="btn btn-success"
                         href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                     className="bi bi-spotify" viewBox="0 0 18 18">
                    <path
                        d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.669 11.538a.498.498 0 0 1-.686.165c-1.879-1.147-4.243-1.407-7.028-.77a.499.499 0 0 1-.222-.973c3.048-.696 5.662-.397 7.77.892a.5.5 0 0 1 .166.686zm.979-2.178a.624.624 0 0 1-.858.205c-2.15-1.321-5.428-1.704-7.972-.932a.625.625 0 0 1-.362-1.194c2.905-.881 6.517-.454 8.986 1.063a.624.624 0 0 1 .206.858zm.084-2.268C10.154 5.56 5.9 5.419 3.438 6.166a.748.748 0 1 1-.434-1.432c2.825-.857 7.523-.692 10.492 1.07a.747.747 0 1 1-.764 1.288z"/>
                </svg>
                Login to Spotify</a> : <button onClick={logout}>Logout</button>}
        </div>
        <script
            src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"
            integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p"
            crossOrigin="anonymous"
        ></script>
        <script src="switch.js"></script>
        </body>)}
    </div>
    </body>);
};

export default App;

