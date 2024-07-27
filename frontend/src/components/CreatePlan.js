import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreatePlan.css';
import logo from './logo.png';

const CreatePlan = () => {
  const [date, setDate] = useState('');
  const [leadSingers, setLeadSingers] = useState([]);
  const [singers, setSingers] = useState([]);
  const [musicians, setMusicians] = useState([]);
  const [allMusicians, setAllMusicians] = useState([]);
  const [allSingers, setAllSingers] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [songs, setSongs] = useState([{ song_id: '', order: 1 }]);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    // Fetch all musicians
    axios.get(`${apiUrl}/api/musicians`)
      .then(response => setAllMusicians(response.data))
      .catch(error => console.error('There was an error fetching the musicians!', error));

    // Fetch all singers
    axios.get(`${apiUrl}/api/singers`)
      .then(response => setAllSingers(response.data))
      .catch(error => console.error('There was an error fetching the singers!', error));

    // Fetch all songs
    axios.get(`${apiUrl}/api/songs`)
      .then(response => setAllSongs(response.data))
      .catch(error => console.error('There was an error fetching the songs!', error));
  }, [apiUrl]);

  const handleAddSong = () => {
    setSongs([...songs, { song_id: '', order: songs.length + 1 }]);
  };

  const handleRemoveSong = (index) => {
    const newSongs = songs.filter((_, i) => i !== index);
    setSongs(newSongs.map((song, i) => ({ ...song, order: i + 1 })));
  };

  const handleSongChange = (index, field, value) => {
    const newSongs = songs.map((song, i) =>
      i === index ? { ...song, [field]: value } : song
    );
    setSongs(newSongs);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const planData = {
      date,
      lead_singers: leadSingers,
      singers: singers,
      musicians: musicians,
      plansong_set: songs,
    };

    console.log('Plan data to be sent:', planData);

    axios.post(`${apiUrl}/api/plans`, planData)
      .then(() => {
        navigate('/plans');
      })
      .catch((error) => console.error('There was an error creating the plan!', error));
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="create-plan">
      <nav className="navbar">
        <div className="navbar-brand">
          <img src={logo} alt="EmmanuelWorship Logo" className="logo" />
          <span className="brand-name">EmmanuelWorship</span>
        </div>
        <div className="menu-icon" onClick={toggleMenu}>
          &#9776;
        </div>
        <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <Link to="/plans" className="nav-link">
            Ծրագրեր
          </Link>
          <Link to="/songs" className="nav-link">
            Երգեր
          </Link>
        </div>
      </nav>

      <h1>Create Plan</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="leadSingers">Lead Singers</label>
          <select
            id="leadSingers"
            multiple
            value={leadSingers}
            onChange={(e) =>
              setLeadSingers(Array.from(e.target.selectedOptions, option => option.value))
            }
          >
            {allSingers.map(person => (
              <option key={person.id} value={person.id}>
                {person.first_name} {person.last_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="singers">Singers</label>
          <select
            id="singers"
            multiple
            value={singers}
            onChange={(e) =>
              setSingers(Array.from(e.target.selectedOptions, option => option.value))
            }
          >
            {allSingers.map(person => (
              <option key={person.id} value={person.id}>
                {person.first_name} {person.last_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="musicians">Musicians</label>
          <select
            id="musicians"
            multiple
            value={musicians}
            onChange={(e) =>
              setMusicians(Array.from(e.target.selectedOptions, option => option.value))
            }
          >
            {allMusicians.map(person => (
              <option key={person.id} value={person.id}>
                {person.first_name} {person.last_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Songs</label>
          {songs.map((song, index) => (
            <div key={index} className="song-group">
              <select
                value={song.song_id}
                onChange={(e) =>
                  handleSongChange(index, 'song_id', e.target.value)
                }
                required
              >
                <option value="">Select Song</option>
                {allSongs.map(songOption => (
                  <option key={songOption.id} value={songOption.id}>
                    {songOption.title}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleRemoveSong(index)}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAddSong}>
            Add Song
          </button>
        </div>

        <button type="submit">Create Plan</button>
      </form>
    </div>
  );
};

export default CreatePlan;
