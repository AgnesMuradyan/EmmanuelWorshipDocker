import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SongSelection = ({ planId }) => {
  const [songs, setSongs] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/songs/')
      .then(response => setSongs(response.data))
      .catch(error => console.error('There was an error fetching the songs!', error));
  }, []);

  const handleSongSelect = (song) => {
    setSelectedSongs([...selectedSongs, song]);
  };

  const handleSave = () => {
    const songsData = selectedSongs.map((song, index) => ({
      song: song.id,
      order: index,
    }));

    axios.put(`http://localhost:8000/api/plans/${planId}/`, {
      songs: songsData
    })
      .then(response => console.log('Songs saved successfully!', response))
      .catch(error => console.error('There was an error saving the songs!', error));
  };

  return (
    <div>
      <h2>Select Songs</h2>
      <ul>
        {songs.map(song => (
          <li key={song.id}>
            {song.title}
            <button onClick={() => handleSongSelect(song)}>Add</button>
          </li>
        ))}
      </ul>
      <h2>Selected Songs</h2>
      <ul>
        {selectedSongs.map((song, index) => (
          <li key={index}>{song.title}</li>
        ))}
      </ul>
      <button onClick={handleSave}>Save Order</button>
    </div>
  );
};

export default SongSelection;
