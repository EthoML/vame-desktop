import {
  createVAMEProject,
  deleteVAMEProject,
  configureVAMEProject,
  alignVAMEProject,
  createTrainsetVAMEProject,
  trainVAMEProject,
  evaluateVAMEProject,
  segmentVAMEProject,
  createMotifVideosVAMEProject,
  createUMAPVisualizationVAMEProject,
  communityAnalysisVAMEProject,
  createCommunityVideosVAMEProject,
} from "./api"

export type IProjectContext = {
  projects: Project[]
  recentProjects: Project[]
  refresh: () => Promise<void>
  getProject: (path: string) => Project | undefined;
  getAssetsPath: (projectPath: string, asset: string, basePath?: string) => string | undefined

  createProject: typeof createVAMEProject
  deleteProject: typeof deleteVAMEProject
  configureProject: typeof configureVAMEProject

  align: typeof alignVAMEProject
  createTrainset: typeof createTrainsetVAMEProject

  train: typeof trainVAMEProject
  evaluate: typeof evaluateVAMEProject

  segment: typeof segmentVAMEProject
  createMotifVideos: typeof createMotifVideosVAMEProject
  
  communityAnalysis: typeof communityAnalysisVAMEProject
  createCommunityVideos: typeof createCommunityVideosVAMEProject

  createUMAPVisualization: typeof createUMAPVisualizationVAMEProject

}