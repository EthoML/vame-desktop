import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';

import Home from './pages/Home';
import { ProjectsProvider } from './context/Projects';

const App: React.FC = () => {

  return (<Dashboard>
      <Navbar />
      <ProjectsProvider>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </ProjectsProvider>
  </Dashboard>
  );
}

export default App