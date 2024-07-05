import configureVAMEProject from "./configureVAMEProject"
import createVAMEProject from "./createVAMEProject"
import deleteVAMEProject from "./deleteProject"

export type IProjectContext = {
  projects: Project[]
  refresh: () => Promise<void>
  getProject: (path:string) => Project | undefined;

  createProject: typeof createVAMEProject
  configureProject: typeof configureVAMEProject
  deleteProject: typeof deleteVAMEProject
}