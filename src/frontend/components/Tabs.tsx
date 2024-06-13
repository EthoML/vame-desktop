import Tippy from '@tippyjs/react';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { DisableToggle } from '../types';

type Tab = {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: DisableToggle;
  complete?: boolean;
}

type TabProps = {
  tabs: Tab[];
  selected?: string;
}

const TabsContainer = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
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

  &:disabled {
    pointer-events: none;
  }

  ${(props) => (props.complete ? `&:after {
    margin-left: 10px;
    content: '✓';
    color: #28a745;
  }` : '')}

`;

const TabContent = styled.div`
  display: flex;
  position: relative;
  overflow: auto;
`;

const TabPane = styled.div`
  display: ${(props) => (props.active ? 'block' : 'none')};
  width: 100%;
  height: 100%;
`;

const Tabs = ({ 
  tabs,
  selected = tabs[0].id,
}: TabProps) => {
  
  const [ activeTab, setActiveTab ] = useState(selected);

  useEffect(() => { setActiveTab(selected) }, [ selected ]);

  const handleTabClick = (id) => setActiveTab(id);


  return (
    <TabsContainer>
      <TabList>
        {tabs.map((tab) => {
          const { id, label, complete, disabled } = tab;
          const tooltip = disabled?.tooltip || '';

          const button = <TabButton
              key={id}
              active={id === activeTab ? 1  : 0}
              disabled={disabled ? 1 : 0}
              complete={complete ? 1 : 0}
              onClick={() => handleTabClick(id)}
            >
              {label}
            </TabButton>

          if (tooltip) return (
            <Tippy content={tooltip} key={id} placement='bottom' hideOnClick={false}>
              <div>{button}</div>
            </Tippy>
          )

          return button
      })}
      </TabList>
      <TabContent>
        {tabs.map((tab) => (
          <TabPane key={tab.id} active={tab.id === activeTab ? 1 : 0}>
            {tab.content}
          </TabPane>
        ))}
      </TabContent>
    </TabsContainer>
  );
};

export default Tabs;
