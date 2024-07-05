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
} from "./types";
import createVAMEProject, { CreateProps } from "./createVAMEProject";
import configureVAMEProject from "./configureVAMEProject";
import deleteVAMEProject from "./deleteProject";
import alignVAMEProject from "./alignProjectVAMEProject";
import createVAMEProjectTrainset from "./createVAMEProjectTrainset";
import trainVAMEProject from "./trainVAMEProject";
import evaluateVAMEProject from "./evaluateVAMEProject copy";

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
      return await post<Omit<Project,"created_at">>('load', { project: path })
    })

    Promise.allSettled(promises).then(data => {
      setProjects(data.map(icpResponse => {
        if (icpResponse.status === "fulfilled") {
          if(icpResponse.value.success){
            const { Project, project_path } = icpResponse.value.data.config
            const created_at = new Date(project_path.split(`${Project}-`)[1]).toLocaleDateString()
            const project = {...icpResponse.value.data, created_at}
            return project
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

  const createProject = useCallback(async (params: CreateProps)=>{
    const res = await createVAMEProject(params)
    await refresh()
    return res
  },[])
  const configureProject = useCallback(async (data)=>{
    const res = await configureVAMEProject(data)
    await refresh()
    return res
  },[])

  const deleteProject = useCallback(async (data:string)=>{
    const res = await deleteVAMEProject(data)
    await refresh()
    return res
  },[])

  const alignProject = useCallback(async (data)=>{
    const res = await alignVAMEProject(data)
    await refresh()
    return res
  },[])

  const createProjectTrainset = useCallback(async (data)=>{
    const res = await createVAMEProjectTrainset(data)
    await refresh()
    return res
  },[])
  
  const trainProject = useCallback(async (data)=>{
    const res = await trainVAMEProject(data)
    await refresh()
    return res
  },[])
  const evaluateProject = useCallback(async (data)=>{
    const res = await evaluateVAMEProject(data)
    await refresh()
    return res
  },[])
  
  const segmentProject = useCallback(async ()=>{},[])
  const createMotifVideos = useCallback(async ()=>{},[])
  const createCommunityMotifVideos = useCallback(async ()=>{},[])
  const createVisualization = useCallback(async ()=>{},[])
  const createGenerativeModel = useCallback(async ()=>{},[])

  const getAssetsPath = useCallback((projectPath:string,asset: string, basePath = 'files') => {
      const project = getProject(projectPath)
      if(!project){
        throw new Error("cant find project")
      }

      const { Project, project_path } = project.config

      const fullProjectDirectory = `${Project}${project_path.split(Project).slice(1).join(Project)}`

      return new URL(`${basePath}/${fullProjectDirectory}/${asset}`, "http://0.0.0.0/").href
  },[])

  const getProject = useCallback((path:string)=>{
    return projects.find(p=>p.config.project_path === path)
  },[projects])

  const value = {
    projects,
    refresh,
    getProject,
    getAssetsPath,

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
