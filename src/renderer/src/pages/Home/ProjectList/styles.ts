import styled from "styled-components";

export const List = styled.ul`
  list-style: none;
  padding: 0;
`;

export const ListItem = styled.li`
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

export const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
`;
