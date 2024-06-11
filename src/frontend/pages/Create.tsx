import React from 'react';
import styled from 'styled-components';
import DynamicForm from '../components/DynamicForm';
import { post } from '../utils/requests';
import Pipeline from '../Pipeline';
import { useNavigate } from 'react-router-dom';

import createSchema from '../../schema/create.schema.json';

const PaddedContainer = styled.div`
  padding: 25px 50px;
`;


const Create: React.FC = () => {

  const navigate = useNavigate()


  const handleFormSubmit = async (formData) => {

    // Map the files to their paths
    if (formData.videos) formData.videos = formData.videos.map((video: File) => video.path)
    if (formData.csvs) formData.csvs = formData.csvs.map((csv: File) => csv.path)

    const pipeline = new Pipeline()
    await pipeline.create(formData)

    navigate({ 
      pathname: "/project",
      search: `?project=${pipeline.path}`
    });

  };


  return (
    <PaddedContainer>
      <h2>Create a New Project</h2>
      <DynamicForm 
        submitText='Create Project'
        schema={createSchema} 
        onFormSubmit={handleFormSubmit} 
      />
    </PaddedContainer>
  );
};

export default Create;
