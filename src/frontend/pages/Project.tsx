import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Pipeline from '../Pipeline';

import styled from 'styled-components';
import { onReady } from '../commoners';
import Tabs from '../components/Tabs';

import { CenteredFullscreenDiv, StyledHeaderDiv } from '../components/elements';

import ProjectConfiguration from '../tabs/ProjectConfiguration';
import Organize from '../tabs/Organize';
import Model from '../tabs/Model';
import Segmentation from '../tabs/Segmentation';
import UMAPVisualization from '../tabs/UMAPVisualization';
import MotifVideos from '../tabs/MotifVideos';
import CommunityAnalysis from '../tabs/CommunityAnalysis';
import { post } from '../utils/requests';
import { showTerminalWhileRunning } from '../popups';


const ProjectHeader = styled.header`
  padding: 20px 30px;
`

const ProjectInformation = styled.div`
  display: flex;
  gap: 15px;
  padding: 10px;

`;

const ProjectInformationCapsule = styled.div`
  display: flex;
  align-items: center;
  margin: 0;
  background: #f4f4f4;
  padding: 5px 10px;
  border-radius: 10px
`;


const HeaderButton = styled.button`
  font-size: 14px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background: #181c24;
  color: white;
  cursor: pointer;
`;


const Project: React.FC = () => {

  const [ searchParams ] = useSearchParams();

  const [ pipeline, setPipeline ] = useState();

  const [ selectedTab, setSelectedTab ] = useState();

  const navigate = useNavigate()

  const projectPath = searchParams.get("project")

  // Load the pipeline configuration when the server is ready
  useEffect(() => {
    onReady(() => {
      const pipeline = new Pipeline(projectPath)
      pipeline.load().then(() => setPipeline(pipeline))
    })
    
   }, [])

   if (!pipeline) return <CenteredFullscreenDiv>
      <div>
        <b>Loading project details...</b>
        <br/>
        <small>{projectPath}</small>
      </div>
    </CenteredFullscreenDiv>


   const loadedPipeline = pipeline as Pipeline

   post('project/register', { project: loadedPipeline.path }) // Register project access


  const submitTab = async (
    callback,
    tab?: string
  ) => {

    const result = await callback()

    // Reload the pipeline
    const pipeline = new Pipeline(projectPath)
    await pipeline.load()
    setPipeline(pipeline)

    // Set the selected tab if provided
    if (tab) setSelectedTab(tab)

    return result

  }

  const { organized, modeled, segmented, motifs_created } = loadedPipeline.workflow

  const tabs = [
    {
      id: 'project-configuration',
      label: '1. Project Configuration',
      complete: organized,
      content: <ProjectConfiguration 
        pipeline={loadedPipeline} 
        onFormSubmit={async (formData) => submitTab(() => {
          return showTerminalWhileRunning(async () => {

            const { advanced_options, ...mainProperties } = formData
            await loadedPipeline.configure({...mainProperties, ...advanced_options})

          }, "Configuring your project")
        }, 'data-organization')}
      />
    },
    {
      id: 'data-organization',
      label: '2. Data Organization',
      complete: organized,
      content: <Organize 
        pipeline={loadedPipeline}
        onFormSubmit={async (params) => submitTab(() => {

          return showTerminalWhileRunning(async () => {
            
            const { pose_ref_index, advanced_options } = params

            await loadedPipeline.align({ pose_ref_index, ...advanced_options })

            // Create the trainset
            await loadedPipeline.create_trainset({ pose_ref_index }) 

            // NOTE: Allow users to inspect the quality of the trainset here

          }, 'Organizing your data for model creation')

        }, 'model-creation')}
      />,
    },
    {
      id: 'model-creation',
      label: '3. Model Creation',
      disabled: !organized,
      complete: modeled,
      content: <Model 
        pipeline={loadedPipeline}
        onFormSubmit={async ({ train, evaluate } = {
          train: true,
          evaluate: true
        }) => {

          const runAll = train && evaluate
          return submitTab(async () => {
            return showTerminalWhileRunning(async () => {

              if (train) await loadedPipeline.train() // Train the model
              if (evaluate) await loadedPipeline.evaluate() // Evaluate the model

            }, `Running ${ runAll ? 'model training and evaluation' : train ? 'model training' : 'model evaluation' }`)
          }, runAll ? 'segmentation' : 'model-creation')
          
        }}
      />
    },

    {
      id: 'segmentation',
      label: '4. Pose Segmentation',
      disabled: !modeled,
      complete: segmented,
      content: <Segmentation 
        pipeline={loadedPipeline}
        onFormSubmit={() => submitTab(() => {
            return showTerminalWhileRunning(async () => {
              await loadedPipeline.segment() // Run pose segmentation
            }, 'Running pose segmentation')
          })}
      />
    },
    {
      id: 'motifs',
      label: '5. Motif Videos',
      disabled: !segmented,
      complete: motifs_created,
      content: <MotifVideos 
        pipeline={loadedPipeline}
        onFormSubmit={async () => submitTab(() => {
            return showTerminalWhileRunning(async () => {
              await loadedPipeline.motif_videos() // Create motif videos separately from pose segmentation
            }, 'Creating motif videos')
          })}
      />
    },
    {
      id: 'community',
      label: '6. Community Analysis',
      disabled: !segmented,
      content: <CommunityAnalysis 
        pipeline={loadedPipeline}
        onFormSubmit={() => submitTab((props) => {
            return showTerminalWhileRunning(async () => {

              await loadedPipeline.community(props) // Run community analysis
              await loadedPipeline.community_videos() // Creating community videos. NOTE: Will need additional consultation for how to proceed
              
            }, 'Running community analysis + generating community videos')
          })}
      />
    },
    {
      id: 'umap',
      label: '7. UMAP Visualization',
      disabled: !segmented,
      content: <UMAPVisualization
        pipeline={loadedPipeline}
        onFormSubmit={async () => submitTab(() => {
            return showTerminalWhileRunning(async () => {
              await loadedPipeline.visualization() // Create visualization
            }, 'Creating UMAP visualization')
          })}
      />
    },
  ];


   return (
    <div>
      <ProjectHeader>
        <StyledHeaderDiv>
          <h2>{loadedPipeline.configuration.Project}</h2>
          <HeaderButton onClick={() => {
            navigate({
              pathname: '/create',
              search: `?project=${loadedPipeline.path}`
            })
          }}>Restart Project</HeaderButton>
        </StyledHeaderDiv>
        <ProjectInformation>
          <ProjectInformationCapsule><small><b>Creation Date</b> <small>{loadedPipeline.creationDate.toLocaleDateString()}</small></small></ProjectInformationCapsule>
          <ProjectInformationCapsule><small><b>Project Location</b> <small>{loadedPipeline.configuration.project_path}</small></small></ProjectInformationCapsule>
        </ProjectInformation>
      </ProjectHeader>
      <Tabs 
        tabs={tabs} 
        selected={selectedTab}
      />

    </div>
  );
};

export default Project;
