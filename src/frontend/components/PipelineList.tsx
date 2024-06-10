import styled from "styled-components";
import Pipeline from "../Pipeline";

const List = styled.ul`
  list-style: none;
  padding: 0;
`;

const ListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 10px;

  h3 {
    font-size: 18px;
    font-weight: bold;
    margin: 0;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  font-size: 14px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background: #181c24;
  color: white;
  cursor: pointer;
`;


const PipelineList = ({
    pipelines,
    onDelete,
    onEdit
}: {
    pipelines: Pipeline[],
    onDelete: (pipeline: any) => void,
    onEdit: (pipeline: any) => void
}) => {
    return (
    <List>
    {
    pipelines // Sort the pipelines by creation date
    .map((pipeline: any) => (
      <ListItem key={pipeline.path}>
        <div>
          <h3>{pipeline.configuration.Project}</h3>
          <small>{pipeline.path}</small>
        </div>
        <ButtonContainer>
          <Button onClick={() => {
            onEdit(pipeline)
          }}>Edit</Button>
          <Button onClick={() => {

            // Check to make sure user wants to delete the project
            if (!window.confirm(`Are you sure you want to delete project "${pipeline.configuration.Project}"?`)) return

            // Delete the project
            pipeline.delete()

            onDelete(pipeline)
          }}>Delete</Button>
        </ButtonContainer>
      </ListItem>
    ))}
  </List>
)
}

export default PipelineList;