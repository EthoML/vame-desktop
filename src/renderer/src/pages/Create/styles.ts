import styled from "styled-components";

export const PaddedContainer = styled.div`
  padding: 25px 50px;
  min-height: 0; /* shrink within Dashboard's 1fr row instead of overflowing it */
  overflow-y: auto; /* scroll the form when the window is too short to fit it */
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  position: relative;
`;

export const FormOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;
