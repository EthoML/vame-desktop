import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';

import Home from './pages/Home';
import { ProjectsProvider } from './context/Projects';
import Create from './pages/Create';

const App: React.FC = () => {

  return (<Dashboard>
      <Navbar />
      <ProjectsProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
        </Routes>
      </ProjectsProvider>
  </Dashboard>
  );
}

export default App