import alignVAMEProject from "./alignProjectVAMEProject"
import trainVAMEProject from "./trainVAMEProject"
import configureVAMEProject from "./configureVAMEProject"
import createVAMEProject from "./createVAMEProject"
import createVAMEProjectTrainset from "./createVAMEProjectTrainset"
import deleteVAMEProject from "./deleteProject"
import evaluateVAMEProject from "./evaluateVAMEProject copy"

export type IProjectContext = {
  projects: Project[]
  refresh: () => Promise<void>
  getProject: (path:string) => Project | undefined;
  getAssetsPath: (projectPath: string, asset: string, basePath?: string) => string 

  createProject: typeof createVAMEProject
  configureProject: typeof configureVAMEProject
  deleteProject: typeof deleteVAMEProject

  alignProject: typeof alignVAMEProject
  createProjectTrainset: typeof createVAMEProjectTrainset

  trainProject: typeof trainVAMEProject
  evaluateProject: typeof evaluateVAMEProject
}