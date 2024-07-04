import styled from "styled-components";

export const PaddedContainer = styled.div`
  padding: 25px 50px;
  overflow-y: auto !important;

  h2 {
    margin: 20px 0px;
  }
`;

export const ControlButton = styled.button`
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