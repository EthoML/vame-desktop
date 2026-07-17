import { useProjects } from '@renderer/context/Projects';
import React, { useCallback, useState } from 'react';
import { PaddedContainer } from './styles';
import { ErrorNote } from '@renderer/components/StepStatus';
import PageHeading from '@renderer/components/PageHeading';
import { usePageHeader } from '@renderer/context/PageHeader';
import ProjectsList from './ProjectList';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const { projects, deleteProject } = useProjects()
  const navigate = useNavigate()
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const onEdit = useCallback((project: ProjectType) => {
    navigate(`project?path=${project.config?.project_path}`)
  }, [])

  const onDelete = useCallback(async (project: ProjectType) => {
    setDeleteError(null)
    const name = project.config?.project_name ?? project.config?.project_path ?? 'project'
    try {
      await deleteProject(project.config?.project_path)
    } catch (e) {
      setDeleteError(
        `Could not delete "${name}": ${e instanceof Error ? e.message : String(e)}`
      )
    }
  }, [])

  usePageHeader(<PageHeading title="Projects" />, [])

  return (
    <PaddedContainer>
      {deleteError && <ErrorNote>{deleteError}</ErrorNote>}

      {projects && projects?.length > 0 ? (
        <ProjectsList
          projects={projects}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : (
        <p>No projects found in the VAME App output directory.</p>
      )}
    </PaddedContainer>
  );
};

export default Home;
