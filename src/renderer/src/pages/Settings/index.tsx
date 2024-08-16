import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import settingsSchema from '../../../../schema/settings.schema.json';
import { onConnected } from '@renderer/utils/vame';
import { get, post } from '@renderer/utils/requests';
import DynamicForm from '@renderer/components/DynamicForm';
import { extractDefaultValues } from '@renderer/utils/extractDefaultValues';
import { useSettings } from '@renderer/context/Settings';

const PaddedContainer = styled.div`
  padding: 25px 50px;
`;

const Settings: React.FC = () => {
  const schema = settingsSchema as unknown as Schema

  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);

  const {
    tabsLock,
    setTabsLock
  } = useSettings();

  const handleSubmit = useCallback(settings => {
    post('/settings', settings)
  }, [])

  // Load the pipeline configuration when the server is ready
  useEffect(() => {
    onConnected(async () => {
      get<Record<string, unknown>>('/settings').then(res => {
        if (res.success) {
          setSettings(res.data)
        } else {
          setSettings(extractDefaultValues(schema))
        }
      })
    });
  }, []);

  return (
    <PaddedContainer>

      <label htmlFor="tabsLock">Enable Tab Lock {" "}</label>

      <input
        id='tabsLock'
        type='checkbox'
        checked={tabsLock as any}
        onClick={()=>setTabsLock(v=>!v)}
      />

      {settings ? <DynamicForm
        initialValues={settings}
        submitText='Save Settings'
        schema={settingsSchema as unknown as Schema}
        onFormSubmit={handleSubmit}
      /> : <p>Loading settings from the server...</p>}
    </PaddedContainer>
  );
};

export default Settings;
