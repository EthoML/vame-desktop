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
} from "./api"

/**
 * A row in the projects list. A project that failed to load carries only
 * `error` and `config.project_path`, so everything is optional
 */
export type Project = Partial<Omit<ProjectType, "config">> & {
  config?: Partial<ProjectType["config"]>;
};

export type IProjectContext = {
  projects: Project[]
  refresh: () => Promise<void>
  getProject: (path: string) => Project | undefined;

  createProject: typeof createVAMEProject
  deleteProject: typeof deleteVAMEProject

  runPreprocessing: typeof preprocessingVAMEProject
  getPreprocessingVisualization: typeof preprocessingVisualization

  createTrainset: typeof createTrainsetVAMEProject

  train: typeof trainVAMEProject
  evaluate: typeof evaluateVAMEProject

  segment: typeof segmentVAMEProject
  createMotifVideos: typeof createMotifVideosVAMEProject

  communityAnalysis: typeof communityAnalysisVAMEProject
  createCommunityVideos: typeof createCommunityVideosVAMEProject
}
