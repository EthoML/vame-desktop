import styled from "styled-components";

export const Container = styled.button`
  font-size: 20px;
  cursor: pointer;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  color: white;
  background: #181c24;

  &[disabled] {
    opacity: 0.5;
  }
`;