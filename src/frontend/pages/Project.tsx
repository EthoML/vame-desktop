import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Pipeline from '../Pipeline';

import styled from 'styled-components';
import { onReady } from '../commoners';
import Tabs from '../components/Tabs';
import DynamicForm from '../components/DynamicForm';
import ProjectConfiguration from '../tabs/ProjectConfiguration';
import { CenteredFullscreenDiv } from '../components/divs';

import projectConfigSchema from '../../schema/config.schema.json'


const ProjectHeader = styled.header`
  padding: 20px;
`

const ProjectInformation = styled.div`
  display: flex;
  gap: 15px;
  padding: 10px;

`;

const ProjectInformationCapsule = styled.div`
  display: flex;
  align-items: center;
  margin: 0;
  background: #f4f4f4;
  padding: 5px 10px;
  border-radius: 10px
`;

const Project: React.FC = () => {

  const [ searchParams ] = useSearchParams();

  const [ pipeline, setPipelineInfo] = useState(null);

  const projectPath = searchParams.get("project")

  // Load the pipeline configuration when the server is ready
  useEffect(() => {
    onReady(() => {
      const pipeline = new Pipeline(projectPath)
      pipeline.load().then(() => setPipelineInfo(pipeline))
    })
   }, [])

   if (!pipeline) return <CenteredFullscreenDiv>
      <div>
        <b>Loading project details...</b>
        <br/>
        <small>{projectPath}</small>
      </div>
    </CenteredFullscreenDiv>

  const handleFormSubmit = (formData) => {
    console.log('Form Data:', formData);
  };

  const tabs = [
    {
      label: 'Project Configuration',
      content: <ProjectConfiguration 
        configuration={pipeline.configuration} 
        schema={projectConfigSchema}
        onFormSubmit={handleFormSubmit} 
      />
    },
    {
      label: 'Data Alignment',
      content: <div>Coming soon...</div>
    },
    {
      label: 'Data Preparation',
      content: <div>Coming soon...</div>
    },
    {
      label: 'Model Training',
      content: <div>Coming soon...</div>
    },
    {
      label: 'Evaluation',
      content: <div>Coming soon...</div>
    },
    {
      label: 'Segmentation',
      content: <div>Coming soon...</div>
    },
    {
      label: 'Quantification',
      content: <div>Coming soon...</div>
    },
  ];


 
  return (
    <div>
      <ProjectHeader>
        <h2>{pipeline.configuration.Project}</h2>
        <ProjectInformation>
          <ProjectInformationCapsule><small><b>Creation Date</b> <small>{pipeline.creationDate.toLocaleDateString()}</small></small></ProjectInformationCapsule>
          <ProjectInformationCapsule><small><b>Project Location</b> <small>{pipeline.configuration.project_path}</small></small></ProjectInformationCapsule>
        </ProjectInformation>
      </ProjectHeader>
      <Tabs tabs={tabs} />

    </div>
  );
};

export default Project;
