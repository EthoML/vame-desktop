import React, {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createCustomContext } from "@renderer/utils/createContext";
import { onConnected, onVAMEReady } from "@renderer/utils/vame";
import { get, post } from "@renderer/utils/requests";

import {
  type IProjectContext,
  type Project,
} from "./types";

import {
  createVAMEProject,
  deleteVAMEProject,
  preprocessingVAMEProject,
  preprocessingVisualization,
  createTrainsetVAMEProject,
  trainVAMEProject,
  evaluateVAMEProject,
  segmentVAMEProject,
  createMotifVideosVAMEProject,
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
  const hasLoadedOnce = useRef(false);
  if (!loadingPaths && !loadingProjects) hasLoadedOnce.current = true;

  const [projects, setProjects] = useState<Project[]>([])

  // deal with paths
  const [paths, setPaths] = useState<string[]>([]);

  const loadProjectsPaths = useCallback(async () => {
    try {
      setLoadingPaths(true);
      const projectsPath = await get<string[]>('projects')

      if (projectsPath.success) {
        setPaths(projectsPath.data)
      } else {
        throw new Error(projectsPath.error)
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
    if (!paths) {
      return
    }

    setLoadingProjects(true)
    const promisesProjects = paths.map(async (path) => {
      return await post<Omit<ProjectType, "creation_datetime">>('load', { project: path })
    })

    try {
      const data = await Promise.allSettled(promisesProjects)

      setProjects(data.map(icpResponse => {
        if (icpResponse.status === "fulfilled") {
          if (icpResponse.value.success) {
            const projectData = icpResponse.value.data;
            if (projectData.error) {
              // Keep the path
              return {
                error: projectData.error,
                config: { project_path: projectData.project },
              };
            }
            // creation_datetime comes straight from config.yaml.
            const creation_datetime = projectData.config.creation_datetime;
            const project = { ...projectData, creation_datetime };
            return project;
          }
        }
        return;
      }).filter(p => !!p) as Project[]);

    } catch (error) {
      window.alert("Something went wrong loading projects.")
    } finally {
      setLoadingProjects(false)
    }
  }, [paths])

  const refresh = useCallback(loadProjectsPaths, [])

  useEffect(() => {
    onConnected(loadProjectsPaths)
  }, [loadProjectsPaths])

  useEffect(() => {
    onVAMEReady(loadProjectsData)
  }, [loadProjectsData])

  const createProject = useCallback(async (params: Parameters<typeof createVAMEProject>[0]) => {
    const res = await createVAMEProject(params)
    await refresh()
    return res
  }, [])

  const deleteProject = useCallback(async (data: string) => {
    const res = await deleteVAMEProject(data)
    await refresh()
    return res
  }, [])

  const createTrainset = useCallback(async (data: Parameters<typeof createTrainsetVAMEProject>[0]) => {
    const res = await createTrainsetVAMEProject(data)
    await refresh()
    return res
  }, [])

  const train = useCallback(async (data: Parameters<typeof trainVAMEProject>[0]) => {
    const res = await trainVAMEProject(data)
    await refresh()
    return res
  }, [])

  const evaluate = useCallback(async (data: Parameters<typeof evaluateVAMEProject>[0]) => {
    const res = await evaluateVAMEProject(data)
    await refresh()
    return res
  }, [])

  const segment = useCallback(async (data: Parameters<typeof segmentVAMEProject>[0]) => {
    const res = await segmentVAMEProject(data)
    await refresh()
    return res
  }, [])

  const createMotifVideos = useCallback(async (data: Parameters<typeof createMotifVideosVAMEProject>[0]) => {
    const res = await createMotifVideosVAMEProject(data)
    await refresh()
    return res
  }, [])

  const communityAnalysis = useCallback(async (data: Parameters<typeof communityAnalysisVAMEProject>[0]) => {
    const res = await communityAnalysisVAMEProject(data)
    await refresh()
    return res
  }, [])

  const createCommunityVideos = useCallback(async (data: Parameters<typeof createCommunityVideosVAMEProject>[0]) => {
    const res = await createCommunityVideosVAMEProject(data)
    await refresh()
    return res
  }, [])

  const createMotifCommunityVideos = useCallback(async (data: Parameters<typeof createMotifVideosVAMEProject>[0]) => {
    const res = await createMotifVideosVAMEProject(data)
    await refresh()
    return res
  }, [])

  const runPreprocessing = useCallback(async (data: Parameters<typeof preprocessingVAMEProject>[0]) => {
    const res = await preprocessingVAMEProject(data)
    await refresh()
    return res
  }, [])

  const getPreprocessingVisualization = useCallback(async (data: Parameters<typeof preprocessingVisualization>[0]) => {
    const res = await preprocessingVisualization(data)
    return res
  }, [])

  const getProject = useCallback((path: string) => {
    return projects.find(p => p.config?.project_path === path)
  }, [projects])

  const value = {
    projects,
    refresh,
    getProject,
    createProject,
    deleteProject,
    runPreprocessing,
    getPreprocessingVisualization,
    createTrainset,
    train,
    evaluate,
    segment,
    createMotifVideos,
    communityAnalysis,
    createCommunityVideos,
    createMotifCommunityVideos,
  }

  // Only the first load may replace children: swapping them out on every
  // refresh() unmounted the whole app subtree and reset all component state.
  const showInitialPlaceholder = !hasLoadedOnce.current && (loadingPaths || loadingProjects);

  return (
    <ProjectsContext.Provider value={value}>
      {showInitialPlaceholder ? (
        <MainContainer>
          <strong>
            {loadingPaths
              ? 'Finding Projects on VAME projects path'
              : 'Loading Projects ...'}
          </strong>
        </MainContainer>
      ) : (
        <>{children}</>
      )}
    </ProjectsContext.Provider>
  );
};
