import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SongList from './components/SongList';
import SongDetail from './components/SongDetail';
import PlanList from './components/PlanList';
import PlanDetail from './components/PlanDetail';
import SongSelection from './components/SongSelection';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<SongList />} />
      <Route path="/songs" element={<SongList />} />
      <Route path="/songs/:id" element={<SongDetail />} />
      <Route path="/plans" element={<PlanList />} />
      <Route path="/plans/:id" element={<PlanDetail />} />
      <Route path="/songs/select" element={<SongSelection />} />
    </Routes>
  </Router>
);

export default App;
