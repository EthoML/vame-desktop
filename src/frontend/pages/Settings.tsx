import React from 'react';
import styled from 'styled-components';

const PaddedContainer = styled.div`
  padding: 20px;
`;

const Settings: React.FC = () => {
  return (
    <PaddedContainer>
      <h2>Settings</h2>
      <p>No settings at the moment.</p>
    </PaddedContainer>
  );
};

export default Settings;
