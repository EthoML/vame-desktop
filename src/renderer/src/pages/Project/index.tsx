import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { open } from '@renderer/utils/folders';
import { post } from '@renderer/utils/requests';
import { onConnected, onVAMEReady } from '@renderer/utils/vame';

import { useProjects } from '@renderer/context/Projects';

import Tabs from '@renderer/components/Tabs';
import Header from '@renderer/components/Header';
import { CenteredFullscreenDiv, HeaderButton, HeaderButtonContainer, ProjectHeader, ProjectInformation, ProjectInformationCapsule } from './styles';

import ProjectConfiguration from './Tabs/ProjectConfiguration';

// import Organize from './tabs/Organize';
// import Model from './tabs/Model';
// import Segmentation from './tabs/Segmentation';
// import UMAPVisualization from './tabs/UMAPVisualization';
// import MotifVideos from './tabs/MotifVideos';
// import CommunityAnalysis from './tabs/CommunityAnalysis';
// import CommunityVideos from './tabs/CommunityVideos';


const Project: React.FC = () => {

  const [searchParams] = useSearchParams();
  const projectPath = searchParams.get("path")
  const {
    getProject,
    refresh,
    configureProject,
  } = useProjects()

  const [project, setProject] = useState<Project | undefined>()
  const [blockSubmit, setBlockSubmit] = useState(true);
  const [selectedTab, setSelectedTab] = useState<string>();

  const navigate = useNavigate()


  const submitTab = useCallback(async (
    callback: () => Promise<void>,
    tab?: string
  ) => {
    console.log("submitTab")

    await callback()
    await refresh()

    if (tab) setSelectedTab(tab)
  }, [])


  useEffect(() => {
    onConnected(async () => {
      if (projectPath) {
        post('project/register', { project: projectPath }).then(res => {
          if (res.success)
            setProject(getProject(projectPath))
        })
      }
    })

    onVAMEReady(() => setBlockSubmit(false))
  }, [projectPath])

  if (!project) {
    return (
      <CenteredFullscreenDiv>
        <div>
          <b>Loading project details...</b>
          <br />
          <small>{projectPath}</small>
        </div>
      </CenteredFullscreenDiv>
    );
  }

  const {
    organized,
    modeled,
    segmented,
    motif_videos_created,
    communities_created,
    community_videos_created,
    umaps_created
  } = project.workflow


  // const tabs = [
  //   {
  //     id: 'project-configuration',
  //     label: '1. Project Configuration',
  //     complete: organized,
  //     content: <ProjectConfiguration
  //       pipeline={loadedPipeline}
  //       block={willBlock}
  //       onFormSubmit={async (formData) => submitTab(async () => {
  //         const { advanced_options, ...mainProperties } = formData
  //         await loadedPipeline.configure({ ...mainProperties, ...advanced_options })
  //       }
  //         , 'data-organization')}
  //     />
  //   },
  //   {
  //     id: 'data-organization',
  //     label: '2. Data Organization',
  //     complete: organized,
  //     content: <Organize
  //       pipeline={loadedPipeline}
  //       block={willBlock}
  //       onFormSubmit={async (params) => submitTab(async () => {

  //         const { pose_ref_index, advanced_options } = params

  //         pose_ref_index.description = `${pose_ref_index.description}. `

  //         await loadedPipeline.align({ pose_ref_index, ...advanced_options })

  //         // Create the trainset
  //         await loadedPipeline.create_trainset({ pose_ref_index })

  //         // NOTE: Allow users to inspect the quality of the trainset here

  //       }, 'model-creation')}
  //     />,
  //   },
  //   {
  //     id: 'model-creation',
  //     label: '3. Model Creation',
  //     disabled: !organized ? { tooltip: 'Please organize your data first' } : false,
  //     complete: modeled,
  //     content: <Model
  //       pipeline={loadedPipeline}
  //       block={willBlock}
  //       onFormSubmit={async ({ train, evaluate } = {
  //         train: true,
  //         evaluate: true
  //       }) => {

  //         const runAll = train && evaluate
  //         return submitTab(async () => {

  //           if (train) await loadedPipeline.train() // Train the model
  //           if (evaluate) await loadedPipeline.evaluate() // Evaluate the model

  //         }, runAll ? 'segmentation' : 'model-creation')
  //       }}
  //     />
  //   },

  //   {
  //     id: 'segmentation',
  //     label: '4. Pose Segmentation',
  //     disabled: !modeled ? { tooltip: 'Please create a model first' } : false,
  //     complete: segmented,
  //     content: <Segmentation
  //       pipeline={loadedPipeline}
  //       block={willBlock}
  //       onFormSubmit={() => submitTab(async () => {
  //         await loadedPipeline.segment() // Run pose segmentation
  //       }, 'segmentation')}
  //     />
  //   },
  //   {
  //     id: 'motifs',
  //     label: '5. Motif Videos',
  //     disabled: !segmented ? { tooltip: 'Please segment poses first' } : false,
  //     complete: motif_videos_created,
  //     content: <MotifVideos
  //       pipeline={loadedPipeline}
  //       block={willBlock}
  //       onFormSubmit={async () => submitTab(async () => {
  //         await loadedPipeline.motif_videos() // Create motif videos separately from pose segmentation
  //       }, 'motifs')}
  //     />
  //   },
  //   {
  //     id: 'community',
  //     label: '6a. Community Analysis',
  //     disabled: !segmented ? { tooltip: 'Please segment poses first' } : false,
  //     complete: communities_created,
  //     content: <CommunityAnalysis
  //       pipeline={loadedPipeline}
  //       block={willBlock}
  //       onFormSubmit={(props) => submitTab(async () => {
  //         await loadedPipeline.community(props) // Run community analysis
  //       }, 'community-videos')}
  //     />
  //   },
  //   {
  //     id: 'community-videos',
  //     label: '6b. Community Videos',
  //     disabled: !communities_created ? { tooltip: 'Please run community analysis first' } : false,
  //     complete: community_videos_created,
  //     content: <CommunityVideos
  //       pipeline={loadedPipeline}
  //       block={willBlock}
  //       onFormSubmit={async () => submitTab(async () => {
  //         await loadedPipeline.community_videos() // Creating community videos.
  //       }, 'community-videos')}
  //     />
  //   },
  //   {
  //     id: 'umap',
  //     label: '7. UMAP Visualization',
  //     completed: umaps_created,
  //     disabled: !segmented ? { tooltip: 'Please segment poses first' } : false,
  //     content: <UMAPVisualization
  //       pipeline={loadedPipeline}
  //       block={willBlock}
  //       onFormSubmit={async () => submitTab(async () => {
  //         await loadedPipeline.visualization() // Create visualization
  //       }, 'umap')}
  //     />
  //   },
  // ];


  const tabs = [
    {
      id: 'project-configuration',
      label: '1. Project Configuration',
      complete: organized,
      content: <ProjectConfiguration
        project={project}
        blockSubmission={blockSubmit}
        blockTooltip="Waiting VAME to be ready."
        onFormSubmit={async (formData) => submitTab(async () => {
          const { advanced_options, ...mainProperties } = formData as any

          await configureProject(
            { config: { ...mainProperties, ...advanced_options }, project: project.config.project_path 
          }).catch(e => alert(e))
          
        }, 'data-organization')}
      />
    },
  ]

  return (
    <>
      <ProjectHeader>
        <Header title={project.config.Project}>
          <HeaderButtonContainer>
            <HeaderButton onClick={() => {
              open(project.config.project_path)

            }}>Open in File Explorer</HeaderButton>
            <HeaderButton onClick={() => {
              navigate({
                pathname: '/create',
                search: `?project=${project.config.project_path}`
              })
            }}>Restart Project</HeaderButton>
          </HeaderButtonContainer>
        </Header>
        <ProjectInformation>
          <ProjectInformationCapsule>
            <small>
              <b>Creation Date</b>
              <small>
                {project.created_at}
              </small>
            </small></ProjectInformationCapsule>
          <ProjectInformationCapsule>
            <small>
              <b>Project Location</b>
              <small>
                {project.config.project_path}
              </small>
            </small>
          </ProjectInformationCapsule>
        </ProjectInformation>
      </ProjectHeader>

      <Tabs
        tabs={tabs}
        selected={selectedTab}
      />
    </>
  );
};

export default Project;
