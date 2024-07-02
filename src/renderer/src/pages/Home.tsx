import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { get } from '../utils/requests';
import { onConnected } from '../utils/vame';
import { useNavigate } from 'react-router-dom';
import PipelineList from '../components/PipelineList';
import { StyledHeaderDiv } from '../components/elements';
import Pipeline from '@renderer/context/Pipeline';
import Tippy from '@tippyjs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';

export const PaddedContainer = styled.div`
  padding: 25px 50px;
  overflow-y: auto !important;

  h2 {
    margin: 20px 0px;
  }
`;

const ControlButton = styled.button`
  font-size: 20px;
  cursor: pointer;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  color: white;
  background: #181c24;

  &[disabled] {
    opacity: 0.5;
  }
`;

const loadPipelines = async (paths?: string[]) => {
  if(paths?.length)
  return await Promise.all(paths.map(async (path: any) => {
    const pipeline = new Pipeline(path)
    await pipeline.load()
    return pipeline
  }))

  return []
}

const Home: React.FC = () => {

  const navigate = useNavigate()

  const [allPipelines, setAllPipelines] = useState<any[] | null>(null);
  const [recentPipelines, setRecentPipelines] = useState<any[] | null>(null);

  const loadData = useCallback(async()=>{
    get('projects').then(async (data) => setAllPipelines(await loadPipelines(data)))

    get('projects/recent').then(async (data) => {
      setRecentPipelines((await loadPipelines(data)).reverse())
    })
  },[])

  // Load the pipeline configuration when the server is ready
  useEffect(() => {
    onConnected(async () => {
      loadData()
    })

  }, [loadData])


  const onEdit = async (pipeline) => {

    navigate({
      pathname: "/project",
      search: `?project=${pipeline.path}`
    });
  }

  const onDelete = (pipeline) => {
    const newAllPipelines = allPipelines?.filter((p: any) => p.path !== pipeline.path)
    const newRecentPipelines = recentPipelines?.filter((p: any) => p.path !== pipeline.path)
    setAllPipelines(newAllPipelines)
    setRecentPipelines(newRecentPipelines)
  }


  const loadingMessage = <p>Loading...</p>

  return (
    <PaddedContainer>

      <StyledHeaderDiv>
        <h2>Recent Projects</h2>
        <Tippy content={<span>Refresh</span>}>
            <ControlButton onClick={loadData}>
                <FontAwesomeIcon icon={faArrowsRotate} />
            </ControlButton>
        </Tippy>
      </StyledHeaderDiv>

      {recentPipelines ? (recentPipelines?.length > 0 ? (
        <PipelineList
          pipelines={recentPipelines}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : (
        <p>No recent projects.</p>
      )) : loadingMessage}

      <StyledHeaderDiv>
        <h2>All Projects</h2>
      </StyledHeaderDiv>
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
