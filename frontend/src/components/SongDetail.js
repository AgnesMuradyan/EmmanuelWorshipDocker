import React, { useState, useEffect } from 'react';
import {Link, useParams} from 'react-router-dom';
import axios from 'axios';
import './SongDetail.css';
import logo from "./logo.png";

const SongDetail = () => {
  const { id } = useParams();
  const [song, setSong] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    axios.get(`https://emmanuel-worship-backend.onrender.com/api/songs/${id}/`)
      .then(response => setSong(response.data))
      .catch(error => console.error('There was an error fetching the song!', error));
  }, [id]);

  if (!song) return <div className="loading">Loading...</div>;

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const downloadChords = () => {
    axios.get(`https://emmanuel-worship-backend.onrender.com/api/songs/${id}/view-chords/`, { responseType: 'blob' })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${song.title}_chords.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch(error => console.error('There was an error downloading the chords!', error));
  };

  const downloadPowerpoint = () => {
    axios.get(`https://emmanuel-worship-backend.onrender.com/api/songs/${id}/view-powerpoint/`, { responseType: 'blob' })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${song.title}_powerpoint.pptx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch(error => console.error('There was an error downloading the PowerPoint!', error));
  };

  const printSong = () => {
    const printContent = `
      <div style="font-size: 26px; font-weight: bold; text-align: center;">${song.title}</div>
      <pre style="font-size: 22px; white-space: pre-wrap; margin-top: 20px;">${song.verse}</pre>
    `;
    const newWindow = window.open('', '', 'width=600,height=400');
    newWindow.document.write(printContent);
    newWindow.document.close();
    newWindow.print();
  };

  return (
      <div className="song-detail">
          <nav className="navbar">
              <div className="navbar-brand">
                  <img src={logo} alt="EmmanuelWorship Logo" className="logo"/>
                  <span className="brand-name">EmmanuelWorship</span>
              </div>
              <div className="menu-icon" onClick={toggleMenu}>
                  &#9776;
              </div>
              <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
                  <Link to="/plans" className="nav-link">Ծրագրեր</Link>
                  <Link to="/songs" className="nav-link">Երգեր</Link>
              </div>
          </nav>
          <h1 className="song-title">{song.title}</h1>
          <pre className="song-verse">{song.verse}</pre>
          <p className="song-key">Original Key: <span>{song.original_key}</span></p>
          <p className="song-link">
              Original Link:
              <a href={song.original_link} target="_blank" rel="noopener noreferrer">
                  {song.original_link}
              </a>
          </p>
          {song.chords ? (
              <div className="chords-container">
                  <iframe
                      src={`https://emmanuel-worship-backend.onrender.com/api/songs/${id}/view-chords/`}
                      className="chords-iframe"
                      title="Chords"
                      frameBorder="0"
                      scrolling="auto"
                      allowFullScreen
                  ></iframe>
              </div>
          ) : (
              <p className="no-chords">No chords available</p>
          )}
          <div className="buttons">
              <button className="download-button" onClick={downloadChords}>Ներբեռնել նոտաները</button>
              <button className="download-button" onClick={downloadPowerpoint}>Ներբեռնել սլայդը</button>
              <button className="print-button" onClick={printSong}>Տպել երգը</button>
          </div>
          <p className="song-date">Ստեղծվել է: <span>{new Date(song.created_at).toLocaleDateString()}</span></p>
          <p className="song-date">Փոփոխվել է: <span>{new Date(song.updated_at).toLocaleDateString()}</span></p>
      </div>
  );
};

export default SongDetail;

