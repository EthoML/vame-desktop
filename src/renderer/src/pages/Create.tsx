import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import DynamicForm from '../components/DynamicForm';
import { onConnected, onVAMEReady, post } from '../utils/requests';
import { useNavigate, useSearchParams } from 'react-router-dom';

import createSchema from '../../../schema/create.schema.json';
import { StyledHeaderDiv } from '../components/elements';
import Pipeline from '@renderer/context/Pipeline';

const PaddedContainer = styled.div`
  padding: 25px 50px;
`;


const Create: React.FC = () => {

  const navigate = useNavigate()

  const [ canSubmit, setCanSubmit ] = useState(false)
  const [ pipeline, setPipeline ] = useState(null);

  const [ searchParams ] = useSearchParams();

  const projectPath = searchParams.get("project")

  // Load the pipeline configuration when the server is ready
  useEffect(() => {

    onVAMEReady(() => setCanSubmit(true))

    onConnected(() => {
      if (projectPath) {
        const pipeline = new Pipeline(projectPath)
        pipeline.load().then(() => setPipeline(pipeline))
      }
    })
    
   }, [])


  const handleFormSubmit = async (formData) => {

    const pipeline = new Pipeline()
    const result = await pipeline.create(formData)

    if (!result.created) return alert('A project with this name already exists!')

    navigate({ 
      pathname: "/project",
      search: `?project=${pipeline.path}`
    });
  };

  const initialValues = pipeline ? pipeline.data : {}

  return (
    <PaddedContainer>
      <StyledHeaderDiv>
        <h2>Create a New Project</h2>
      </StyledHeaderDiv>
      <DynamicForm 
        initialValues={initialValues}
        submitText='Create Project'
        blockSubmission={!canSubmit ? true : false }
        schema={createSchema} 
        onFormSubmit={handleFormSubmit} 
      />
    </PaddedContainer>
  );
};

export default Create;
