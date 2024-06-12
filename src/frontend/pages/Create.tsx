import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import DynamicForm from '../components/DynamicForm';
import { post } from '../utils/requests';
import Pipeline from '../Pipeline';
import { useNavigate, useSearchParams } from 'react-router-dom';

import createSchema from '../../schema/create.schema.json';
import { onReady } from '../commoners';

const PaddedContainer = styled.div`
  padding: 25px 50px;
`;


const Create: React.FC = () => {

  const navigate = useNavigate()

  const [ pipeline, setPipeline ] = useState(null);

  const [ searchParams ] = useSearchParams();

  const projectPath = searchParams.get("project")

  // Load the pipeline configuration when the server is ready
  useEffect(() => {
    onReady(() => {
      if (!projectPath) return
      const pipeline = new Pipeline(projectPath)
      pipeline.load().then(() => setPipeline(pipeline))
    })
    
   }, [])

   console.log(pipeline)


  const handleFormSubmit = async (formData) => {

    const pipeline = new Pipeline()
    await pipeline.create(formData)

    navigate({ 
      pathname: "/project",
      search: `?project=${pipeline.path}`
    });
  };

  const initialValues = pipeline ? pipeline.data : {}

  return (
    <PaddedContainer>
      <h2>Create a New Project</h2>
      <DynamicForm 
        initialValues={initialValues}
        submitText='Create Project'
        schema={createSchema} 
        onFormSubmit={handleFormSubmit} 
      />
    </PaddedContainer>
  );
};

export default Create;
