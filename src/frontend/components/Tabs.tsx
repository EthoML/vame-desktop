import React, { useState } from 'react';
import styled from 'styled-components';

const TabsContainer = styled.div`
  width: 100%;
  display: grid;
  overflow: hidden;
`;

const TabList = styled.div`
  display: flex;
  overflow-x: auto;
  white-space: nowrap;
  border-bottom: 1px solid #ccc;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none; /* Hide scrollbar for webkit browsers */
  }
`;

const TabButton = styled.button`
  padding: 10px 20px;
  cursor: pointer;
  border: none;
  background: none;
  font-size: 16px;
  outline: none;
  transition: background-color 0.3s;
  border-bottom: ${(props) => (props.active ? '2px solid #007bff' : 'none')};
  font-weight: ${(props) => (props.active ? 'bold' : 'normal')};
  flex-shrink: 0;
  flex-grow: 1;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const TabContent = styled.div`
  overflow: auto;
  padding: 20px;
`;

const TabPane = styled.div`
  display: ${(props) => (props.active ? 'block' : 'none')};
`;

const Tabs = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].label);

  const handleTabClick = (label) => {
    setActiveTab(label);
  };

  return (
    <TabsContainer>
      <TabList>
        {tabs.map((tab) => (
          <TabButton
            key={tab.label}
            active={tab.label === activeTab ? 1  : 0}
            onClick={() => handleTabClick(tab.label)}
          >
            {tab.label}
          </TabButton>
        ))}
      </TabList>
      <TabContent>
        {tabs.map((tab) => (
          <TabPane key={tab.label} active={tab.label === activeTab ? 1 : 0}>
            {tab.content}
          </TabPane>
        ))}
      </TabContent>
    </TabsContainer>
  );
};

export default Tabs;
