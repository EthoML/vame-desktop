import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Pipeline from '../Pipeline';

import styled from 'styled-components';
import { onReady } from '../commoners';
import Tabs from '../components/Tabs';
import DynamicForm from '../components/DynamicForm';
import ProjectConfiguration from '../tabs/ProjectConfiguration';
import { CenteredFullscreenDiv } from '../components/divs';
import Alignment from '../tabs/Alignment';

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

  const [ pipeline, setPipeline ] = useState(null);

  const projectPath = searchParams.get("project")

  // Load the pipeline configuration when the server is ready
  useEffect(() => {
    onReady(() => {
      const pipeline = new Pipeline(projectPath)
      pipeline.load().then(() => setPipeline(pipeline))
    })
   }, [])

   if (!pipeline) return <CenteredFullscreenDiv>
      <div>
        <b>Loading project details...</b>
        <br/>
        <small>{projectPath}</small>
      </div>
    </CenteredFullscreenDiv>


   const loadedPipeline = pipeline as Pipeline

  const tabs = [
    {
      label: 'Project Configuration',
      content: <ProjectConfiguration 
        configuration={loadedPipeline.configuration} 
        onFormSubmit={async (updatedConfiguration) => {
          await loadedPipeline.configure(updatedConfiguration)

          // Reload the pipeline
          const pipeline = new Pipeline(projectPath)
          await pipeline.load()
          setPipeline(pipeline)
        }} 
      />
    },
    {
      label: 'Data Alignment',
      content: <Alignment 
        pipeline={loadedPipeline}
        onFormSubmit={async (params) => {
          const alignedResults = await loadedPipeline.align(params)
          console.log(alignedResults)
        }}
      />,
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
        <h2>{loadedPipeline.configuration.Project}</h2>
        <ProjectInformation>
          <ProjectInformationCapsule><small><b>Creation Date</b> <small>{loadedPipeline.creationDate.toLocaleDateString()}</small></small></ProjectInformationCapsule>
          <ProjectInformationCapsule><small><b>Project Location</b> <small>{loadedPipeline.configuration.project_path}</small></small></ProjectInformationCapsule>
        </ProjectInformation>
      </ProjectHeader>
      <Tabs tabs={tabs} />

    </div>
  );
};

export default Project;
