import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './PlanDetail.css';
import logo from './logo.png';

const PlanDetail = () => {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    axios
      .get(`https://emmanuel-worship-backend.onrender.com/api/plans/${id}/`)
      .then((response) => setPlan(response.data))
      .catch((error) => console.error('There was an error fetching the plan!', error));
  }, [id]);

  const toggleMenu = () => setMenuOpen((m) => !m);

  const downloadConcatenatedPowerpoint = () => {
    axios
      .get(`https://emmanuel-worship-backend.onrender.com/api/plans/${id}/download-concatenated-powerpoint/`, {
        responseType: 'blob',
      })
      .then((response) => {
        const url = window.URL.createObjectURL(
          new Blob([response.data], {
            type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          }),
        );
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Plan_${plan?.date}_concatenated_powerpoint.pptx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((error) =>
        console.error('There was an error downloading the concatenated PowerPoint!', error),
      );
  };

  const downloadSummaryDocx = () => {
    axios
      .get(`https://emmanuel-worship-backend.onrender.com/api/plans/${id}/download-summary-docx/`, {
        responseType: 'blob',
      })
      .then((response) => {
        const url = window.URL.createObjectURL(
          new Blob([response.data], {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          }),
        );
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Plan_${plan?.date}_summary.docx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((error) => console.error('There was an error downloading the DOCX summary!', error));
  };

  // Hooks must run before any early returns
  const orderedLeadSingers = useMemo(() => {
    const arr = plan?.lead_singers_ordered ?? [];
    return arr.slice().sort((a, b) => a.order - b.order);
  }, [plan?.lead_singers_ordered]);

  const sortedSongs = useMemo(() => {
    const arr = plan?.songs ?? [];
    return arr.slice().sort((a, b) => a.order - b.order);
  }, [plan?.songs]);

  if (!plan) return <div className="loading">Loading...</div>;

  return (
    <div className="plan-detail">
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

      <h1 className="plan-date">Ծրագիր {plan.date}</h1>

      <div className="section">
        <h2 className="section-title">Վարողներ</h2>
        <ul className="list">
          {orderedLeadSingers.map((item) => (
            <li key={item.id} className="list-item">
              {item.first_name} {item.last_name}
            </li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h2 className="section-title">Վոկալ</h2>
        <ul className="list">
          {(plan.singers ?? []).map((singer) => (
            <li key={singer.id} className="list-item">
              {singer.first_name} {singer.last_name}
            </li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h2 className="section-title">Երաժիշտներ</h2>
        <ul className="list">
          {(plan.musicians ?? []).map((musician) => (
            <li key={musician.id} className="list-item">
              {musician.first_name} {musician.last_name}
            </li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h2 className="section-title">Երգեր</h2>
        <ul className="list">
          {sortedSongs.map((planSong) => (
            <li key={planSong.id} className="list-item">
              <Link to={`/songs/${planSong.song_id}`} className="song-link">
                {planSong.song_title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="download-actions">
        <button className="download-button" onClick={downloadConcatenatedPowerpoint}>
          Ներբեռնել միակցված սլայդը
        </button>
        <button className="download-button" onClick={downloadSummaryDocx}>
          Ներբեռնել ծրագիրը (DOCX)
        </button>
      </div>
    </div>
  );
};

export default PlanDetail;
