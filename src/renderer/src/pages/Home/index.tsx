import { useProjects } from '@renderer/context/Projects';
import type { Project } from '@renderer/context/Projects/types';
import React, { useCallback, useEffect, useState } from 'react';
import { PaddedContainer } from './styles';
import { ErrorNote } from '@renderer/components/StepStatus';
import PageHeading from '@renderer/components/PageHeading';
import { usePageHeader } from '@renderer/context/PageHeader';
import ProjectsList from './ProjectList';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const { projects, deleteProject, refresh } = useProjects()
  const navigate = useNavigate()
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Re-read on arrival: a run started elsewhere would otherwise show as idle.
  useEffect(() => { refresh() }, [refresh])

  const onEdit = useCallback((project: Project) => {
    const path = project.config?.project_path
    if (!path) return
    navigate(`project?path=${path}`)
  }, [])

  const onDelete = useCallback(async (project: Project) => {
    setDeleteError(null)
    const path = project.config?.project_path
    const name = project.config?.project_name ?? path ?? 'project'
    if (!path) {
      setDeleteError(`Could not delete "${name}": its location on disk is unknown.`)
      return
    }
    try {
      await deleteProject(path)
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
