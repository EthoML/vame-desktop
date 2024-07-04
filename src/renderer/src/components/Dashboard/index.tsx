import React from 'react';
import { DashboardContainer } from './styles';

interface DashboardProps {
  children: React.ReactNode;
}

const Dashboard: React.FC<DashboardProps> = ({ children }) => {
  return (
    <DashboardContainer>
      {children}
    </DashboardContainer>
  );
};

export default Dashboard;
