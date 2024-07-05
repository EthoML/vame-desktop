import { useProjects } from '@renderer/context/Projects';
import React, { useCallback } from 'react';
import { PaddedContainer } from './styles';
import Header from '@renderer/components/Header';
import Tippy from '@tippyjs/react';
import Button from '@renderer/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import ProjectsList from './ProjectList';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const { projects, refresh, deleteProject } = useProjects()
  const navigate = useNavigate()

  const onEdit = useCallback((project: Project) => {
    navigate(`project?path=${project.config.project_path}`)
  }, [])

  const onDelete = useCallback(async (project: Project) => {
    try {
      await deleteProject(project.config.project_path)
    } catch (e) {
      alert(e)
    }
  }, [])

  return (
    <PaddedContainer>

      <Header title="Projects">
        <Tippy content={<span>Refresh</span>}>
          <>
            <Button onClick={refresh}>
              <FontAwesomeIcon icon={faArrowsRotate} />
            </Button>
          </>
        </Tippy>
      </Header>

      {projects && projects?.length > 0 ? (
        <ProjectsList
          projects={projects}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : (
        <p>No projects found in the VAME Desktop output directory.</p>
      )}
    </PaddedContainer>
  );
};

export default Home;
