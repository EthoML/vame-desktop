import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { onConnected } from '../commoners';
import { get } from '../utils/requests';
import Pipeline from '../Pipeline';
import { useNavigate } from 'react-router-dom';
import { CenteredFullscreenDiv } from '../components/divs';

export const PaddedContainer = styled.div`
  padding: 20px;
  overflow-y: auto !important;

  h2 {
    margin-bottom: 20px;
  }
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
`;

const ListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 10px;

  h3 {
    font-size: 18px;
    font-weight: bold;
    margin: 0;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  font-size: 14px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background: #181c24;
  color: white;
  cursor: pointer;
`;

const Home: React.FC = () => {

  const navigate = useNavigate()

  const [ pipelines, setPipelines ] = useState(null);

  // Load the pipeline configuration when the server is ready
  useEffect(() => {
    onConnected(async () => {
      const pipelinePaths = await get('/pipelines')

      const pipelines = await Promise.all(pipelinePaths.map(async (pipelinePath: any) => {
        const pipeline = new Pipeline(pipelinePath)
        await pipeline.load()
        return pipeline
      }))

      setPipelines(pipelines)
    })
   }, [])

   if (!pipelines) return <CenteredFullscreenDiv>
      <div>
        <b>Loading all projects...</b>
        <br/>
        <small>Requested from the local VAME API</small>
      </div>
    </CenteredFullscreenDiv>


  // Sort the pipelines by creation date
  pipelines.sort((a: any, b: any) => {
    return a.creationDate > b.creationDate ? -1 : 1
  })

  return (
    <PaddedContainer>

      <h2>My Projects</h2>

      {pipelines.length > 0 ? (
        <List>
          {pipelines.map((pipeline: any) => (
            <ListItem key={pipeline.path}>
              <div>
                <h3>{pipeline.configuration.Project}</h3>
                <small>{pipeline.path}</small>
              </div>
              <ButtonContainer>
                <Button onClick={() => {
                  navigate({ 
                    pathname: "/project",
                    search: `?project=${pipeline.path}`
                  });
                }}>Edit</Button>
                <Button onClick={() => {

                  // Check to make sure user wants to delete the project
                  if (!window.confirm(`Are you sure you want to delete project "${pipeline.configuration.Project}"?`)) return

                  // Delete the project
                  pipeline.delete()
                  setPipelines(pipelines.filter((p: any) => p.path !== pipeline.path))
                }}>Delete</Button>
              </ButtonContainer>
            </ListItem>
          ))}
        </List>
      ) : (
        <p>No projects found.</p>
      )}
    </PaddedContainer>
  );
};

export default Home;
