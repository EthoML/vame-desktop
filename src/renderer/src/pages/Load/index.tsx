import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PageHeading from '@renderer/components/PageHeading';
import { usePageHeader } from '@renderer/context/PageHeader';
import DynamicForm from '@renderer/components/DynamicForm';
import { ErrorNote } from '@renderer/components/StepStatus';
import { post } from '@renderer/utils/requests';

import loadSchema from '../../../../schema/load-project.schema.json';
import { PaddedContainer } from '../Create/styles';

const Load: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (formData: { project_folder?: string | string[] }) => {
    setError(null);
    const value = formData.project_folder;
    const folder = Array.isArray(value) ? value[0] : value;

    if (!folder) {
      setError('Please select a project folder.');
      return;
    }

    // Gate the import: refuse anything the backend can't actually open, so an
    // unusable project is never symlinked into the projects directory.
    setChecking(true);
    try {
      const res = await post<{ valid: boolean; reason: string | null }>(
        'project/validate',
        { project: folder }
      );
      if (!res.success) {
        setError(res.error);
        return;
      }
      if (!res.data.valid) {
        setError(res.data.reason ?? 'This folder is not a valid VAME project.');
        return;
      }
      navigate({
        pathname: '/project',
        search: `?path=${encodeURIComponent(folder)}`,
      });
    } finally {
      setChecking(false);
    }
  };

  usePageHeader(<PageHeading title="Load an External Project" />, [])

  return (
    <PaddedContainer>
      <p>
        Select the VAME project directory — the folder that contains{' '}
        <code>config.yaml</code>.
      </p>
      {error && <ErrorNote>{error}</ErrorNote>}
      <DynamicForm
        schema={loadSchema as unknown as Schema}
        onFormSubmit={handleSubmit}
        submitText={checking ? 'Checking…' : 'Load Project'}
        blockSubmission={checking}
      />
    </PaddedContainer>
  );
};

export default Load;
