import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import PageHeading from '@renderer/components/PageHeading';
import { usePageHeader } from '@renderer/context/PageHeader';
import DynamicForm from '@renderer/components/DynamicForm';
import { ErrorNote } from '@renderer/components/StepStatus';
import { PaddedContainer, FormOverlay } from './styles';

import { onVAMEReady } from '@renderer/utils/vame';
import { useProjects } from '@renderer/context/Projects';

import createSchema from '../../../../schema/create.schema.json';

// Supported pose-estimation file types (must match create.schema.json).
const SUPPORTED_EXTS = ['.csv', '.slp', '.h5', '.nwb', '.nc'];
// Letters, numbers, hyphen and underscore only — no spaces or other characters.
const NAME_RE = /^[A-Za-z0-9_-]+$/;

const ext = (p: string) => p.slice(p.lastIndexOf('.')).toLowerCase();
const stem = (p: string) => (p.split(/[\\/]/).pop() || p).replace(/\.[^.]+$/, '');

const Create: React.FC = () => {
  const navigate = useNavigate()
  const { createProject, projects } = useProjects()

  const [blockSubmission, setBlockSubmission] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // A fresh reproducibility seed suggested per project (user can override).
  const suggestedSeed = useMemo(() => Math.floor(Math.random() * 1_000_000), [])

  useEffect(() => {
    onVAMEReady(() => setBlockSubmission(false))
  }, [])

  // Existing project names (lower-cased) to reject duplicates before submitting.
  const existingNames = useMemo(
    () =>
      new Set(
        projects
          .map((p) => p.config?.project_name?.toLowerCase())
          .filter(Boolean) as string[]
      ),
    [projects]
  )

  // Returns the list of unmet requirements (empty = ready to create).
  const validateCreate = useCallback(
    (values: Record<string, unknown>): string[] => {
      const errors: string[] = []

      // Validate the raw value — it's what gets submitted (NAME_RE forbids
      // spaces, so leading/trailing whitespace is rejected rather than trimmed).
      const name = String(values.name ?? '')
      const pes = Array.isArray(values.pes_paths) ? (values.pes_paths as string[]) : []
      const videos = Array.isArray(values.videos) ? (values.videos as string[]) : []

      // Project name
      if (!name.trim()) {
        errors.push('Enter a project name.')
      } else {
        if (name.length < 4) errors.push('Project name must be at least 4 characters.')
        if (!NAME_RE.test(name))
          errors.push('Project name may only contain letters, numbers, hyphens and underscores (no spaces).')
        if (existingNames.has(name.toLowerCase()))
          errors.push(`A project named “${name}” already exists.`)
      }

      // Pose estimation files
      if (pes.length === 0) {
        errors.push('Select at least one pose estimation file.')
      } else {
        const exts = Array.from(new Set(pes.map(ext)))
        if (exts.some((e) => !SUPPORTED_EXTS.includes(e)))
          errors.push('One or more selected files have an unsupported type.')
        if (exts.length > 1)
          errors.push('All pose estimation files must be the same type.')

        const stems = pes.map((p) => stem(p).toLowerCase())
        if (new Set(stems).size !== stems.length)
          errors.push('Pose estimation files must have unique names.')

        // NWB needs its pose-location keys filled in.
        if (exts.length === 1 && exts[0] === '.nwb') {
          if (!String(values.processing_module_key ?? '').trim())
            errors.push('NWB Processing Module is required.')
          if (!String(values.pose_estimation_key ?? '').trim())
            errors.push('NWB Pose Estimation Key is required.')
        }
      }

      // Videos are paired to pose files positionally — one each, or none.
      if (videos.length > 0 && videos.length !== pes.length)
        errors.push('Add exactly one video per pose file, or none at all.')

      // Without a video, fps can't be auto-detected, so it must be provided.
      if (videos.length === 0) {
        const fps = Number(values.fps)
        if (!Number.isFinite(fps) || fps <= 0)
          errors.push('Frames per second is required when no video is selected.')
      }

      return errors
    },
    [existingNames]
  )

  const handleFormSubmit = async (formData) => {
    // Set submitting state to show overlay immediately
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const result = await createProject(formData)

      if (!result.created) {
        setIsSubmitting(false)
        setErrorMessage('A project with this name already exists. Choose a different name.')
        return
      }

      // Navigate immediately to the project page
      navigate({
        pathname: "/project",
        search: `?path=${result.config.project_path}`
      });

    } catch (error) {
      setIsSubmitting(false)
      setErrorMessage(error instanceof Error ? error.message : String(error))
    }
  };

  usePageHeader(<PageHeading title="Create a New Project" />, [])

  return (
    <PaddedContainer>
      <DynamicForm
        schema={createSchema as unknown as Schema}
        initialValues={{ project_random_state: suggestedSeed }}
        onFormSubmit={handleFormSubmit}
        blockSubmission={blockSubmission || isSubmitting}
        submitText='Create Project'
        validate={validateCreate}
      />
      {errorMessage && <ErrorNote>{errorMessage}</ErrorNote>}
      {isSubmitting && (
        <FormOverlay>
          <FontAwesomeIcon icon={faSpinner} spin size="3x" style={{ color: 'var(--color-accent)' }} />
        </FormOverlay>
      )}
    </PaddedContainer>
  );
};

export default Create;
