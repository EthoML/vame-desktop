import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { onConnected } from '../commoners';
import { get, post } from '../utils/requests';
import Pipeline from '../Pipeline';
import { useNavigate } from 'react-router-dom';
import PipelineList from '../components/PipelineList';

export const PaddedContainer = styled.div`
  padding: 25px 50px;
  overflow-y: auto !important;

  h2 {
    margin: 20px 0px;
  }
`;


const loadPipelines = async (paths) => {

   return await Promise.all(paths.map(async (path: any) => {
        const pipeline = new Pipeline(path)
        await pipeline.load()
        return pipeline
    }))
}

const Home: React.FC = () => {

  const navigate = useNavigate()

  const [ allPipelines, setAllPipelines ] = useState(null);
  const [ recentPipelines, setRecentPipelines ] = useState(null);

  // Load the pipeline configuration when the server is ready
  useEffect(() => {
    onConnected(async () => {

      get('projects').then(async (paths) => setAllPipelines(await loadPipelines(paths)))

      get('projects/recent').then(async (paths) => setRecentPipelines((await loadPipelines(paths)).reverse()))
    })
   }, [])


   console.log('Recent Pipelines:', recentPipelines)

   const onEdit = async (pipeline) => {
    await post('project/register', { project: pipeline.path })

    navigate({ 
      pathname: "/project",
      search: `?project=${pipeline.path}`
    });
  }

  const onDelete = (pipeline) => {
    const newAllPipelines = allPipelines.filter((p: any) => p.path !== pipeline.path)
    const newRecentPipelines = recentPipelines.filter((p: any) => p.path !== pipeline.path)
    setAllPipelines(newAllPipelines)
    setRecentPipelines(newRecentPipelines)
  }


  const loadingMessage = <p>Loading...</p>

  return (
    <PaddedContainer>

      <h2>Recent Projects</h2>

      {recentPipelines ? (recentPipelines?.length > 0 ? (
        <PipelineList 
          pipelines={recentPipelines} 
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : (
        <p>No recent projects.</p>
      )) : loadingMessage}

      <h2>All Projects</h2>
      {allPipelines ? (allPipelines?.length > 0 ? (
        <PipelineList 
          pipelines={allPipelines.sort((a: any, b: any) => a.creationDate > b.creationDate ? -1 : 1)} 
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : (
        <p>No projects found in the VAME Desktop output directory.</p>
      )) : loadingMessage}
    </PaddedContainer>
  );
};

export default Home;
