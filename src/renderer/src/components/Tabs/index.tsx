import Tippy from '@tippyjs/react';
import React, { useEffect, useState } from 'react';
import { TabButton, TabContent, TabList, TabPane, TabsContainer } from './styles';

type Tab = {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  tooltip?: string;
  complete?: boolean;
}

type TabProps = {
  tabs: Tab[];
  selected?: string;
}

const Tabs = ({
  tabs,
  selected = tabs[0].id,
}: TabProps) => {

  const [activeTab, setActiveTab] = useState(selected);

  useEffect(() => { setActiveTab(selected) }, [selected]);

  const handleTabClick = (id) => setActiveTab(id);

  return (
    <>
      <TabList>
        {tabs.map(({ id, label, complete, disabled, tooltip }) => {
          return (
            <div key={id} >
              {tooltip ? (
                <Tippy content={tooltip} placement='bottom' hideOnClick={false}>
                  <TabButton
                    disabled={disabled}
                    $active={id === activeTab}
                    $complete={complete}
                    onClick={() => handleTabClick(id)}
                  >
                    {label}
                  </TabButton>
                </Tippy>
              ) :
                (
                  <TabButton
                    key={id}
                    disabled={disabled}
                    $active={id === activeTab}
                    $complete={complete}
                    onClick={() => handleTabClick(id)}
                  >
                    {label}
                  </TabButton>
                )
              }
            </div>
          )
        })}
      </TabList>
      <TabsContainer>
        <TabContent>
          {tabs.map((tab) => (
            <TabPane
              key={tab.id}
              $active={tab.id === activeTab}
            >
              {tab.content}
            </TabPane>
          ))}
        </TabContent>
      </TabsContainer>
    </>
  );
};

export default Tabs