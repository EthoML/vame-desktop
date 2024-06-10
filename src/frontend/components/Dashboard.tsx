import React from 'react';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100vh;
  width: 100vw;

  & > *:nth-child(2) {
    display: flex;
    flex-direction: column;
    overflow-y: hidden;
  }
`;

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
