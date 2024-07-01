import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './PlanList.css';
import logo from './logo.png'; // Ensure you have a logo.png file in the appropriate directory

const PlanList = () => {
  const [plans, setPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dayTypeFilter, setDayTypeFilter] = useState({
    ALL: true,
    TH: false,
    SU: false,
    OT: false,
  });

  useEffect(() => {
    axios.get('http://localhost:8000/api/plans/')
      .then(response => setPlans(response.data))
      .catch(error => console.error('There was an error fetching the plans!', error));
  }, []);

  const handleSearch = event => {
    setSearchTerm(event.target.value);
  };

  const handleDayTypeChange = event => {
    const { name, checked } = event.target;
    if (name === "ALL") {
      setDayTypeFilter({
        ALL: checked,
        TH: checked,
        SU: checked,
        OT: checked,
      });
    } else {
      setDayTypeFilter(prevFilter => {
        const updatedFilter = {
          ...prevFilter,
          [name]: checked,
          ALL: false,
        };
        if (updatedFilter.TH && updatedFilter.SU && updatedFilter.OT) {
          updatedFilter.ALL = true;
        }
        return updatedFilter;
      });
    }
  };

  const filteredPlans = plans.filter(plan =>
    plan.date.includes(searchTerm) &&
    (dayTypeFilter.ALL || dayTypeFilter[plan.day_type])
  );

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="plan-list-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <img src={logo} alt="EmmanuelWorship Logo" className="logo" />
          <span className="brand-name">EmmanuelWorship</span>
        </div>
        <div className="menu-icon" onClick={toggleMenu}>
          &#9776;
        </div>
        <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <Link to="/plans" className="nav-link" onClick={toggleMenu}>Ծրագրեր</Link>
          <Link to="/songs" className="nav-link" onClick={toggleMenu}>Երգեր</Link>
        </div>
      </nav>
      <h1 className="title">Ծրագրեր</h1>
      <input
        type="date"
        placeholder="Search by date"
        value={searchTerm}
        onChange={handleSearch}
        className="search-input"
      />
        <div className="filters">
            <label>
                <input
                    type="checkbox"
                    name="ALL"
                    checked={dayTypeFilter.ALL}
                    onChange={handleDayTypeChange}
                />
                Բոլորը
            </label>
            <label>
                <input
                    type="checkbox"
                    name="SU"
                    checked={dayTypeFilter.SU}
                    onChange={handleDayTypeChange}
                />
                Կիրակի
            </label>
            <label>
                <input
                    type="checkbox"
                    name="TH"
                    checked={dayTypeFilter.TH}
                    onChange={handleDayTypeChange}
                />
                Հինգշաբթի
            </label>
            <label>
                <input
                    type="checkbox"
                    name="OT"
                    checked={dayTypeFilter.OT}
                    onChange={handleDayTypeChange}
                />
                Այլ
            </label>
        </div>
        <ul className="plan-list">
            {filteredPlans.map(plan => (
                <li key={plan.id} className="plan-item">
                    <Link to={`/plans/${plan.id}`} className="plan-link">{plan.date}</Link>
                </li>
            ))}
        </ul>
    </div>
  );
};

export default PlanList;
