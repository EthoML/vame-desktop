import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { post } from '@renderer/utils/requests';
import { onConnected, onProjectReady } from '@renderer/utils/vame';
import { formatDatetime } from '@renderer/utils/date';

import { useProjects } from '@renderer/context/Projects';

import Tabs from '@renderer/components/Tabs';
import PageHeading from '@renderer/components/PageHeading';
import { usePageHeader } from '@renderer/context/PageHeader';
import { Container } from './styles';

import Preprocessing from './Tabs/Preprocessing';
import ModelTrainingAccordion from './Tabs/ModelTrainingAccordion';
import PoseSegmentationAccordion from './Tabs/PoseSegmentationAccordion';
import CommunityAnalysisAccordion from './Tabs/CommunityAnalysisAccordion';
import { MainContainer } from '@renderer/components/Container';
import RawDataTab from './Tabs/RawDataTab';
import Report from './Tabs/Report';

const Project: React.FC = () => {

  const [searchParams] = useSearchParams();
  const projectPath = searchParams.get("path")
  const {
    refresh,
    runPreprocessing,
  } = useProjects()

  const [project, setProject] = useState<ProjectType | undefined>()
  const [blockSubmit, setBlockSubmit] = useState(true);
  const [selectedTab, setSelectedTab] = useState<string>("input-data");

  // Load this project directly so it resolves a freshly-opened external project
  // (which /load registers and symlinks), independent of the global list timing.
  const loadProject = useCallback(async () => {
    if (!projectPath) return
    const res = await post<ProjectType>('load', { project: projectPath })
    const data = res.success ? (res.data as any) : null
    if (data && !data.error) {
      setProject({ ...data, creation_datetime: data.config?.creation_datetime })
    }
  }, [projectPath])

  // Function to handle tab submission
  const submitTab = useCallback(async (
    callback: () => Promise<void>,
    tab?: string
  ) => {
    try {
      setBlockSubmit(true)
      await callback()

      if (tab) {
        const localItem = `selected-tab-${project?.config.project_name}`
        localStorage.setItem(localItem, tab)
        setSelectedTab(tab)
      }

      await loadProject()
      await refresh()
    } catch (e) {
      console.error("Error in submitTab:", e);
    } finally {
      setBlockSubmit(false);
    }
  }, [project, loadProject])


  useEffect(() => {
    if (projectPath) {
      onConnected(() => { loadProject() })

      onProjectReady(projectPath, () => {
        setBlockSubmit(false);
      })
    }
  }, [projectPath, loadProject])

  useEffect(() => {
    if (project) {
      const loadedTab = localStorage.getItem(`selected-tab-${project?.config.project_name}`)
      if (loadedTab) {
        setSelectedTab(loadedTab)
      }
    }
  }, [project])

  // Publish the project name + facts into the navbar header slot.
  usePageHeader(
    project ? (
      <PageHeading
        title={project.config.project_name || project.config.project_path}
        meta={[
          {
            label: 'Created',
            value: project.config.creation_datetime ? formatDatetime(project.config.creation_datetime) : '',
          },
          { label: 'Location', value: project.config.project_path || '' },
          { label: 'VAME', value: project.config.vame_version || '' },
        ]}
      />
    ) : (
      <PageHeading title="Loading project…" />
    ),
    [project]
  )

  if (!project) {
    return (
      <MainContainer>
        <div>
          <b>Loading project details...</b>
          <br />
          <small>{projectPath}</small>
        </div>
      </MainContainer>
    );
  }

  // Check if states exist and have expected properties
  const preprocessingState = project.states?.preprocessing || {};
  const preprocessingVisualizationState = project.states?.preprocessing_visualization || {};
  const create_trainset = project.states?.create_trainset || {};
  const train_model = project.states?.train_model || {};
  const evaluate_model = project.states?.evaluate_model || {};
  const segment_session = project.states?.segment_session || {};
  const community = project.states?.community || {};

  const projectPreprocessed = preprocessingState.execution_state === "success" && preprocessingVisualizationState.execution_state === "success";
  const trainsetCreated = create_trainset.execution_state === "success";
  // A user-stopped ("aborted") run still saves a usable model
  const modelCreated =
    train_model.execution_state === "success" ||
    train_model.execution_state === "aborted";
  const modelEvaluated = evaluate_model.execution_state === "success";
  const segmented = segment_session.execution_state === "success";
  const report_session = project.states?.generate_reports || {};
  const reportCompleted = report_session.execution_state === "success";


  const isFailed = (s: { execution_state?: string } = {}) =>
    s.execution_state === "failed";

  const tabs = [
    {
      id: 'input-data',
      label: '1. Input Data',
      complete: true,
      content: (() => {
        try {
          return (
            <RawDataTab
              projectPath={project.config.project_path}
              sessionNames={(project.config as any)?.session_names || []}
            />
          );
        } catch (error) {
          console.error("Error rendering ProjectConfiguration:", error);
          return (
            <div style={{ padding: 20, background: "var(--color-surface-sunken)" }}>
              <h3>Project Configuration Content (Fallback)</h3>
              <p>Error rendering the ProjectConfiguration component.</p>
              <p><b>Error:</b> {String(error)}</p>
              <p><b>Original props:</b></p>
              <ul>
                <li>project: {JSON.stringify(project.config?.Project)}</li>
                <li>blockSubmission: {String(blockSubmit)}</li>
              </ul>
            </div>
          );
        }
      })()
    },
    {
      id: 'preprocessing',
      label: '2. Preprocessing',
      disabled: false,
      complete: projectPreprocessed,
      failed: isFailed(preprocessingState) || isFailed(preprocessingVisualizationState),
      tooltip: "Finish project configuration first.",
      content: (() => {
        try {
          return (
            <Preprocessing
              project={project}
              blockSubmission={blockSubmit}
              blockTooltip="Waiting VAME to be ready."
              onFormSubmit={
                async (params) => submitTab(
                  async () => {
                    await runPreprocessing({
                      project: project.config.project_path,
                      ...params
                    });
                  },
                  'preprocessing'
                )
              }
            />
          );
        } catch (error) {
          console.error("Error rendering Preprocessing component:", error);
          return (
            <div style={{ padding: 20, background: "var(--color-surface-sunken)" }}>
              <h3>Preprocessing Content (Fallback)</h3>
              <p>Error rendering the Preprocessing component.</p>
              <p><b>Error:</b> {String(error)}</p>
              <p><b>Original props:</b></p>
              <ul>
                <li>project: {JSON.stringify((project.config as any).project_name || (project.config as any).Project)}</li>
                <li>blockSubmission: {String(blockSubmit)}</li>
              </ul>
            </div>
          );
        }
      })()
    },
    {
      id: 'model-training',
      label: '3. Model Training',
      disabled: !projectPreprocessed,
      complete: trainsetCreated && modelCreated && modelEvaluated,
      failed: isFailed(create_trainset) || isFailed(train_model) || isFailed(evaluate_model),
      tooltip: "Organize your project first.",
      content: (
        <ModelTrainingAccordion
          project={project}
          onFormSubmit={async () => submitTab(async () => { }, 'model-training')}
          blockSubmit={blockSubmit}
          setBlockSubmit={setBlockSubmit}
        />
      )
    },
    {
      id: 'segmentation',
      label: '4. Pose Segmentation',
      disabled: !modelEvaluated,
      complete: segmented,
      failed: isFailed(segment_session),
      tooltip: "Model your project first.",
      content: (
        <PoseSegmentationAccordion
          project={project}
          blockSubmit={blockSubmit}
          setBlockSubmit={setBlockSubmit}
          onFormSubmit={async () => submitTab(async () => { }, 'segmentation')}
        />
      )
    },
    {
      id: 'community-analysis',
      label: '5. Community Analysis',
      disabled: !segmented,
      complete: community?.execution_state === "success",
      failed: isFailed(community),
      tooltip: "Need Pose Segmentation.",
      content: (
        <CommunityAnalysisAccordion
          project={project}
          blockSubmit={blockSubmit}
          setBlockSubmit={setBlockSubmit}
          onFormSubmit={async () => submitTab(async () => { }, 'community-analysis')}
        />
      )
    },
    {
      id: 'report',
      label: '6. Report',
      complete: reportCompleted,
      failed: isFailed(report_session),
      disabled: !segmented,
      tooltip: "Need segmentation.",
      content: (
        <Report
          project={project}
          blockSubmission={blockSubmit}
          blockTooltip="Waiting VAME to be ready."
          onFormSubmit={async () => submitTab(async () => { }, 'report')}
        />
      )
    },
  ];

  return (
    <Container>
      <Tabs
        tabs={tabs}
        selected={selectedTab}
      />
    </Container>
  );
};

export default Project;
