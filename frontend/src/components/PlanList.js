import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './PlanList.css';
import logo from './logo.png';
import Pagination from './Pagination'; // ✨ added

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
  const [currentPage, setCurrentPage] = useState(1);
  const plansPerPage = 15;

  useEffect(() => {
    // Fetch ALL pages so client-side pagination works over the full list
    const fetchAll = async () => {
      try {
        let url = 'https://emmanuel-worship-backend.onrender.com/api/plans/';
        const all = [];
        while (url) {
          const { data } = await axios.get(url);
          const chunk = Array.isArray(data) ? data : (data?.results ?? []);
          all.push(...chunk);
          url = data?.next ?? null; // follow DRF pagination
        }
        setPlans(all);
      } catch (error) {
        console.error('There was an error fetching the plans!', error);
      }
    };
    fetchAll();
  }, []);

  // 🔁 Reset to page 1 whenever search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dayTypeFilter]);

  const handleSearch = event => setSearchTerm(event.target.value);

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
        const updatedFilter = { ...prevFilter, [name]: checked, ALL: false };
        if (updatedFilter.TH && updatedFilter.SU && updatedFilter.OT) updatedFilter.ALL = true;
        return updatedFilter;
      });
    }
  };

  const monthNames = [
    'Հունվար', 'Փետրվար', 'Մարտ', 'Ապրիլ', 'Մայիս', 'Հունիս',
    'Հուլիս', 'Օգոստոս', 'Սեպտեմբեր', 'Հոկտեմբեր', 'Նոյեմբեր', 'Դեկտեմբեր'
  ];

  const formatDate = dateString => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const source = Array.isArray(plans) ? plans : [];
  const filteredPlans = source
    .filter(plan =>
      (plan?.date ?? '').includes(searchTerm) &&
      (dayTypeFilter.ALL || !!dayTypeFilter[plan?.day_type])
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // newest first

  const indexOfLastPlan = currentPage * plansPerPage;
  const indexOfFirstPlan = indexOfLastPlan - plansPerPage;
  const currentPlans = filteredPlans.slice(indexOfFirstPlan, indexOfLastPlan);

  const totalPages = Math.ceil(filteredPlans.length / plansPerPage) || 1;

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    const container = document.querySelector('.plan-list-container');
    if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

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
          <input type="checkbox" name="ALL" checked={dayTypeFilter.ALL} onChange={handleDayTypeChange} />
          Բոլորը
        </label>
        <label>
          <input type="checkbox" name="SU" checked={dayTypeFilter.SU} onChange={handleDayTypeChange} />
          Կիրակի
        </label>
        <label>
          <input type="checkbox" name="TH" checked={dayTypeFilter.TH} onChange={handleDayTypeChange} />
          Հինգշաբթի
        </label>
        <label>
          <input type="checkbox" name="OT" checked={dayTypeFilter.OT} onChange={handleDayTypeChange} />
          Այլ
        </label>
      </div>

      {/* render the paged slice */}
      <ul className="plan-list">
        {currentPlans.map(plan => (
          <li key={plan.id} className="plan-item">
            <Link to={`/plans/${plan.id}`} className="plan-link">{formatDate(plan.date)}</Link>
          </li>
        ))}
      </ul>

      {/* pretty, arrow/ellipsis pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        siblingCount={1}
        boundaryCount={1}
      />
    </div>
  );
};

export default PlanList;
