import React, {
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { createCustomContext } from "@renderer/utils/createContext";
import { onConnected, onVAMEReady } from "@renderer/utils/vame";
import { get, post } from "@renderer/utils/requests";

import {
  type IProjectContext,
  type Project
} from "./types";
import createVAMEProject from "./createVAMEProject";
import configureVAMEProject from "./configureVAMEProject";
import deleteVAMEProject from "./deleteProject";

export const [ProjectsContext, useProjects] = createCustomContext<IProjectContext>("Projects Context");

export const ProjectsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Loaded projects
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects,setLoadingProjects] = useState<boolean>(true);

  // deal with paths
  const [paths, setPaths] = useState<string[]>([]);
  const [loadingPaths,setLoadingPaths] = useState<boolean>(true);

  const loadProjectsPaths = useCallback(async () => {
    try {
      setLoadingPaths(true);
      const projectsPath = await get<string[]>('projects')
      const recentsProjectsPath = await get<string[]>('projects/recent')


      if(projectsPath.success){
        setPaths(projectsPath.data)
      } else {
        throw new Error(projectsPath.error)
      }
    } catch (e) {
      if (e instanceof Error) {
        window.alert(e.message)
      }
      throw e
    } finally {
      setLoadingPaths(false)
    }
  }, [])

  const loadProjectsData = useCallback(() => {
    setLoadingProjects(true)

    const promises = paths.map(async (path) => {
      return await post<Project>('load', { project: path })
    })

    Promise.allSettled(promises).then(data => {
      setProjects(data.map(icpResponse => {
        if (icpResponse.status === "fulfilled") {
          if(icpResponse.value.success){
            return icpResponse.value.data
          }
        }
        return
      }).filter(p => !!p) as Project[])
    }).finally(()=>{
      setLoadingProjects(false)
    })
  }, [paths])

  const refresh = useCallback(loadProjectsPaths,[])

  useEffect(() => {
    onConnected(loadProjectsPaths)
  }, [loadProjectsPaths])

  useEffect(() => {
    onVAMEReady(loadProjectsData)
  }, [loadProjectsData])

  const createProject = useCallback(createVAMEProject,[])
  const configureProject = useCallback(configureVAMEProject,[])
  const deleteProject = useCallback(deleteVAMEProject,[])

  const alignProject = useCallback(async ()=>{},[])
  const createProjectTrainset = useCallback(async ()=>{},[])
  const trainProject = useCallback(async ()=>{},[])
  const evaluateProject = useCallback(async ()=>{},[])
  const segmentProject = useCallback(async ()=>{},[])
  const createMotifVideos = useCallback(async ()=>{},[])
  const createCommunityMotifVideos = useCallback(async ()=>{},[])
  const createVisualization = useCallback(async ()=>{},[])
  const createGenerativeModel = useCallback(async ()=>{},[])

  const getAssets = useCallback(async ()=>{},[])

  const value = {
    projects,
    refresh,

    createProject,
    configureProject,
    deleteProject,

    alignProject,
    createProjectTrainset,
    trainProject,
    evaluateProject,
    segmentProject,
    createMotifVideos,
    createCommunityMotifVideos,
    createVisualization,
    createGenerativeModel,

    getAssets,
  }

  return (
    <ProjectsContext.Provider value={value}>
      {loadingPaths ? 
        <>Finding Projects on VAME projects path</> : 
          loadingProjects ? 
            <>Loading Projects</> :
            <>{children}</>
      }
    </ProjectsContext.Provider>
  );
};
