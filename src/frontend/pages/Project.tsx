import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Pipeline from '../Pipeline';

import styled from 'styled-components';
import { onReady } from '../commoners';
import Tabs from '../components/Tabs';

import { CenteredFullscreenDiv } from '../components/divs';

import ProjectConfiguration from '../tabs/ProjectConfiguration';
import Alignment from '../tabs/Alignment';
import Preparation from '../tabs/Preparation';
import Segmentation from '../tabs/Segmentation';
import Quantification from '../tabs/Quantification';
import Evaluation from '../tabs/Evaluation';


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

  const [ pipeline, setPipeline ] = useState();

  const [ selectedTab, setSelectedTab ] = useState();

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

  const submitTab = async (
    callback,
    tab?: string
  ) => {

    const result = await callback().catch(e => window.alert(e))

    // Reload the pipeline
    const pipeline = new Pipeline(projectPath)
    await pipeline.load()
    setPipeline(pipeline)

    // Set the selected tab if provided
    if (tab) setSelectedTab(tab)


    return result

  }


  console.log(pipeline)

  const tabs = [
    {
      id: 'project-configuration',
      label: 'Project Configuration',
      content: <ProjectConfiguration 
        pipeline={loadedPipeline} 
        onFormSubmit={async (updatedConfiguration) => submitTab(() => loadedPipeline.configure(updatedConfiguration), 'data-alignment')} 
      />
    },
    {
      id: 'data-alignment',
      label: 'Data Alignment',
      content: <Alignment 
        pipeline={loadedPipeline}
        onFormSubmit={async (params) => submitTab(() => loadedPipeline.align(params), 'model-training')}
      />,
    },
    {
      id: 'model-training',
      label: 'Model Training',
      content: <Preparation 
        pipeline={loadedPipeline}
        onFormSubmit={async (params) => submitTab(async () => {
            // await loadedPipeline.create_trainset(params) // Create the trainset
            // await loadedPipeline.train() // Train the model
            await loadedPipeline.evaluate() // Evaluate the model
          }, 'evaluation')}
      />
    },
    {
      id: 'evaluation',
      label: 'Evaluation',
      content: <Evaluation 
        pipeline={loadedPipeline}
      />
    },
    {
      id: 'segmentation',
      label: 'Segmentation',
      content: <Segmentation 
        pipeline={loadedPipeline}
        onFormSubmit={async () => submitTab(async () => {
            await loadedPipeline.segment() // Run pose segmentation
          })}
      />
    },
    {
      id: 'quantification',
      label: 'Quantification',
      content: <Quantification />
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
      <Tabs 
        tabs={tabs} 
        selected={selectedTab}
      />

    </div>
  );
};

export default Project;
