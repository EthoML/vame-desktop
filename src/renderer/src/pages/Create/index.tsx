import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '@renderer/components/Header';
import DynamicForm from '@renderer/components/DynamicForm';
import { PaddedContainer } from './styles';

import { onVAMEReady } from '@renderer/utils/vame';
import { useProjects } from '@renderer/context/Projects';

import createSchema from '../../../../schema/create.schema.json';

const Create: React.FC = () => {
  const navigate = useNavigate()
  const { createProject } = useProjects()

  const [blockSubmission, setBlockSubmission] = useState(true)

  useEffect(() => {
    onVAMEReady(() => setBlockSubmission(false))
  }, [])

  const handleFormSubmit = async (formData) => {
    try {
      const result = await createProject(formData)

      if (!result.created) 
        return alert('A project with this name already exists!')

      navigate({
        pathname: "/project",
        search: `?project=${result.config.project_path}`
      });
      
    } catch (error) {
      alert(error)
    }
  };

  return (
    <PaddedContainer>
      <Header title="Create a New Project" />
      <DynamicForm
        schema={createSchema as unknown as Schema}
        onFormSubmit={handleFormSubmit}
        blockSubmission={blockSubmission}
        submitText='Create Project'
      />
    </PaddedContainer>
  );
};

export default Create;
