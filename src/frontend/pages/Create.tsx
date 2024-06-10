import React from 'react';
import styled from 'styled-components';
import DynamicForm from '../components/DynamicForm';
import { post } from '../utils/requests';
import Pipeline from '../Pipeline';
import { useNavigate } from 'react-router-dom';

const PaddedContainer = styled.div`
  padding: 20px;
`;

const creationSchema = {
  properties:{
    name: {
      type: 'string',
      title: 'Project Name',
      required: true
    },
    videos: {
      type: 'array',
      title: 'Videos',
      items: {
        type: 'file',
        accept: 'video/*',  // Accept only video files
      },
      required: true
    },
    csvs: {
      type: 'array',
      title: 'CSV Files',
      items: {
        type: 'file',
        accept: [ '.csv' ],  // Accept only CSV files
      },
      required: true
    },

    videotype: {
      type: 'string',
      title: 'Video Type',
      enum: ['mp4', 'avi', 'mkv', 'mov'],
      required: true
    },
  }
}

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
      <p>Provide all the details related to your project</p>

      <DynamicForm 
        submitText='Create Project'
        schema={creationSchema} 
        onFormSubmit={handleFormSubmit} 
      />
    </PaddedContainer>
  );
};

export default Create;
