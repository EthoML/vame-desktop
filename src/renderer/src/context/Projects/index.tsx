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

import {
  createVAMEProject,
  deleteVAMEProject,
  configureVAMEProject,
  alignVAMEProject,
  createTrainsetVAMEProject,
  trainVAMEProject,
  evaluateVAMEProject,
  segmentVAMEProject,
  createMotifVideosVAMEProject, createUMAPVisualizationVAMEProject,
  communityAnalysisVAMEProject,
  createCommunityVideosVAMEProject,
} from "./api";
import { MainContainer } from "@renderer/components/Container";

export const [ProjectsContext, useProjects] = createCustomContext<IProjectContext>("Projects Context");

export const ProjectsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Loadings
  const [loadingProjects, setLoadingProjects] = useState<boolean>(true);
  const [loadingPaths, setLoadingPaths] = useState<boolean>(true);

  const [projects, setProjects] = useState<Project[]>([])
  const [recentProjects, setRecentProjects] = useState<Project[]>([])

  // deal with paths
  const [paths, setPaths] = useState<string[]>([]);
  const [recentPaths, setRecentPaths] = useState<string[]>([]);

  // deal with recent projects paths

  const loadProjectsPaths = useCallback(async () => {
    try {
      setLoadingPaths(true);
      const projectsPath = await get<string[]>('projects')
      const recentProjectsPath = await get<string[]>('/projects/recent')

      if (projectsPath.success && recentProjectsPath.success) {
        setPaths(projectsPath.data)
        setRecentPaths(recentProjectsPath.data)
      } else {
        if(!projectsPath.success){
          throw new Error(projectsPath.error)
        } else if (!recentProjectsPath.success){
          throw new Error(recentProjectsPath.error)
        }
      }
    } catch (e) {
      if (e instanceof Error) {
        window.alert(e.message)
      }
    } finally {
      setLoadingPaths(false)
    }
  }, [])

  const loadProjectsData = useCallback(async () => {
    if (!paths || !recentPaths) {
      return
    }

    setLoadingProjects(true)
    const promisesProjects = paths.map(async (path) => {
      return await post<Omit<Project, "created_at">>('load', { project: path })
    })

    const promisesRecents = recentPaths.map(async (path) => {
      return await post<Omit<Project, "created_at">>('load', { project: path })
    })
    try {
      const data = await Promise.allSettled(promisesProjects)
      const data2 = await Promise.allSettled(promisesRecents)

      setProjects(data.map(icpResponse => {
        if (icpResponse.status === "fulfilled") {
          if (icpResponse.value.success) {
            const { Project, project_path } = icpResponse.value.data.config
            const created_at = new Date(project_path.split(`${Project}-`)[1]).toLocaleDateString()
            const project = { ...icpResponse.value.data, created_at }
            return project
          }
        }
        return
      }).filter(p => !!p) as Project[])

      setRecentProjects(data2.map(icpResponse => {
        if (icpResponse.status === "fulfilled") {
          if (icpResponse.value.success) {
            const { Project, project_path } = icpResponse.value.data.config
            const created_at = new Date(project_path.split(`${Project}-`)[1]).toLocaleDateString()
            const project = { ...icpResponse.value.data, created_at }
            return project
          }
        }
        return
      }).filter(p => !!p) as Project[])

    } catch (error) {
      window.alert("Something went wrong loading projects.")
    } finally {
      setLoadingProjects(false)
    }
  }, [paths,recentPaths])

  const refresh = useCallback(loadProjectsPaths, [])

  useEffect(() => {
    onConnected(loadProjectsPaths)
  }, [loadProjectsPaths])

  useEffect(() => {
    onVAMEReady(loadProjectsData)
  }, [loadProjectsData])

  const createProject = useCallback(async (params) => {
    const res = await createVAMEProject(params)
    await refresh()
    return res
  }, [])

  const deleteProject = useCallback(async (data: string) => {
    const res = await deleteVAMEProject(data)
    await refresh()
    return res
  }, [])

  const configureProject = useCallback(async (data) => {
    const res = await configureVAMEProject(data)
    await refresh()
    return res
  }, [])

  const align = useCallback(async (data) => {
    const res = await alignVAMEProject(data)
    await refresh()
    return res
  }, [])

  const createTrainset = useCallback(async (data) => {
    const res = await createTrainsetVAMEProject(data)
    await refresh()
    return res
  }, [])

  const train = useCallback(async (data) => {
    const res = await trainVAMEProject(data)
    await refresh()
    return res
  }, [])

  const evaluate = useCallback(async (data) => {
    const res = await evaluateVAMEProject(data)
    await refresh()
    return res
  }, [])

  const segment = useCallback(async (data) => {
    const res = await segmentVAMEProject(data)
    await refresh()
    return res
  }, [])

  const createMotifVideos = useCallback(async (data) => {
    console.log(data)
    const res = await createMotifVideosVAMEProject(data)
    await refresh()
    return res
  }, [])

  const communityAnalysis = useCallback(async (data) => {
    const res = await communityAnalysisVAMEProject(data)
    await refresh()
    return res
  }, [])

  const createCommunityVideos = useCallback(async (data) => {
    const res = await createCommunityVideosVAMEProject(data)
    await refresh()
    return res
  }, [])

  const createMotifCommunityVideos = useCallback(async (data) => {
    const res = await createMotifVideosVAMEProject(data)
    await refresh()
    return res
  }, [])

  const createUMAPVisualization = useCallback(async (data) => {
    const res = await createUMAPVisualizationVAMEProject(data)
    await refresh()
    return res
  }, [])

  const getProject = useCallback((path: string) => {
    return projects.find(p => p.config.project_path === path)
  }, [projects])

  const getAssetsPath = useCallback((projectPath: string, asset: string, basePath = 'files') => {
    const project = getProject(projectPath)

    if (!project) {
      console.error("Cant find project")
      return
    }

    const { Project, project_path } = project.config

    const fullProjectDirectory = `${Project}${project_path.split(Project).slice(1).join(Project)}`

    return new URL(`${basePath}/${fullProjectDirectory}/${asset}`, "http://localhost:8641").href
  }, [getProject])


  const value = {
    projects,
    recentProjects,
    refresh,
    getProject,
    getAssetsPath,

    createProject,
    deleteProject,

    configureProject,

    align,
    createTrainset,

    train,
    evaluate,

    segment,

    createMotifVideos,

    communityAnalysis,

    createCommunityVideos,

    createMotifCommunityVideos,

    createUMAPVisualization
  }

  return (
    <ProjectsContext.Provider value={value}>
      {loadingPaths ?
        <MainContainer><strong>Finding Projects on VAME projects path</strong></MainContainer> :
        loadingProjects ?
          <MainContainer><strong>Loading Projects ...</strong></MainContainer> :
          <>{children}</>
      }
    </ProjectsContext.Provider>
  );
};
