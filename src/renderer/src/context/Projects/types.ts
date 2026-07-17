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

export type ProjectStates = {
  preprocessing: any;
  preprocessing_visualization: any;
  create_trainset: any;
  evaluate_model: any;
  train_model: any;
  segment_session: any;
  motif_videos: any;
  community: any;
  community_videos: any;
  generate_reports: any; // Added for report generation state
};

export interface Project {
  config?: any;
  assets?: any;
  videos?: string[];
  pes_paths?: string[];
  workflow?: any;
  states?: ProjectStates;
  creation_datetime?: string;
  last_modified?: string;
  error?: string;
}

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
