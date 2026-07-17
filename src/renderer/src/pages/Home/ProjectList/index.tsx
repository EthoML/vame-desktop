import Button from "@renderer/components/Button";
import { ErrorNote } from "@renderer/components/StepStatus";
import { formatDatetime } from "@renderer/utils/date";
import {
  ButtonContainer,
  MetaCell,
  Muted,
  NameCell,
  Row,
  Table,
  Thead,
  VersionCell,
} from "./styles";

interface Props {
  projects: ProjectType[],
  onDelete: (project: ProjectType) => void,
  onEdit: (project: ProjectType) => void
}

const ProjectsList: React.FC<Props> = ({
  projects,
  onDelete,
  onEdit
}) => {

  // Most recently modified first; projects with no timestamp sink to the bottom.
  const sortedProjects = [...projects].sort((a, b) => {
    const ta = a.last_modified ? Date.parse(a.last_modified) : 0;
    const tb = b.last_modified ? Date.parse(b.last_modified) : 0;
    return tb - ta;
  });

  return (
    <Table>
      <Thead>
        <tr>
          <th>Project</th>
          <th>VAME version</th>
          <th>Created</th>
          <th>Modified</th>
          <th>Actions</th>
        </tr>
      </Thead>
      <tbody>
        {sortedProjects.map((project) => {
          const config = project.config;
          const created = formatDatetime(config?.creation_datetime);
          const modified = formatDatetime(project.last_modified ?? "");
          const label = config?.project_name ?? (project.error ? "Unloadable project" : "Unknown project");

          return (
            <Row key={config?.project_path ?? config?.project_name}>
              <NameCell>
                <div>
                  <strong>{label}</strong>
                  <small>{config?.project_path}</small>
                  {project.error && <ErrorNote>{project.error}</ErrorNote>}
                </div>
              </NameCell>
              <VersionCell>{config?.vame_version ?? <Muted>—</Muted>}</VersionCell>
              <MetaCell>{created || <Muted>—</Muted>}</MetaCell>
              <MetaCell>{modified || <Muted>—</Muted>}</MetaCell>
              <td>
                <ButtonContainer>
                  <Button
                    variant="primary"
                    onClick={() => onEdit(project)}
                    disabled={!!project.error}
                    title={project.error ? "This project cannot be opened." : undefined}
                  >
                    Open
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      // Confirm before destroying a project on disk.
                      if (!window.confirm(`Are you sure you want to delete project "${label}"?`)) return
                      onDelete(project)
                    }}
                  >
                    Delete
                  </Button>
                </ButtonContainer>
              </td>
            </Row>
          )
        })}
      </tbody>
    </Table>
  )
}

export default ProjectsList;
