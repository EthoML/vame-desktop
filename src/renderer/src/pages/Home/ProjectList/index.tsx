import Button from "@renderer/components/Button";
import { ButtonContainer, List, ListItem } from "./styles";

interface Props {
  projects: Project[],
  onDelete: (project: Project) => void,
  onEdit: (project: Project) => void
}

const ProjectsList: React.FC<Props> = ({
    projects,
    onDelete,
    onEdit
}) => {

    return (
    <List>
    {projects.map((project) => (
      <ListItem key={project.config.project_path}>
        <div>
          <h3>{project.config.Project}</h3>
          <small>{project.config.project_path}</small>
        </div>
        <ButtonContainer>
          <Button onClick={() => {
            onEdit(project)
          }}>Edit</Button>
          <Button onClick={() => {

            // Check to make sure user wants to delete the project
            if (!window.confirm(`Are you sure you want to delete project "${project.config.Project}"?`)) return

            onDelete(project)
          }}>
            Delete
          </Button>
        </ButtonContainer>
      </ListItem>
    ))}
  </List>
)
}

export default ProjectsList;