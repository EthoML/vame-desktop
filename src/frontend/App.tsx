import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar';
import Settings from './pages/Settings';
import Dashboard from './components/Dashboard';
import Home from './pages/Home';
import Create from './pages/Create';
import Project from './pages/Project';
import Terminal from './pages/Terminal';

const App: React.FC = () => {

  return (<Dashboard>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/project" element={<Project />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/terminal" element={<Terminal />} />
        </Routes>
      </Dashboard>
  );
}

export default App