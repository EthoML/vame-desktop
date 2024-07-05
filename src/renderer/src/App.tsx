import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';

import Home from './pages/Home';
import { ProjectsProvider } from './context/Projects';
import Create from './pages/Create';
import Settings from './pages/Settings';
import Project from './pages/Project';

const App: React.FC = () => {

  return (<Dashboard>
      <Navbar />
      <ProjectsProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/project" element={<Project />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </ProjectsProvider>
  </Dashboard>
  );
}

export default App