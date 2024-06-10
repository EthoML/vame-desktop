import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import DynamicForm from '../components/DynamicForm';
import { get, post } from '../utils/requests';
import { onConnected } from '../commoners';

import settingsSchema from '../../schema/settings.schema.json';

const PaddedContainer = styled.div`
  padding: 25px 50px;
`;

const Settings: React.FC = () => {

  const [ settings, setSettings ] = useState(null);

  // Load the pipeline configuration when the server is ready
  useEffect(() => {
    onConnected(async () => {
      get('/settings').then(setSettings)
    });
  }, []);

  return (
    <PaddedContainer>
      {settings ? <DynamicForm 
        initialValues={settings}
        submitText='Save Settings'
        schema={settingsSchema}
        onFormSubmit={(settings) => post('/settings', settings)}
      /> : <p>Loading settings from the server...</p>}
    </PaddedContainer>
  );
};

export default Settings;
