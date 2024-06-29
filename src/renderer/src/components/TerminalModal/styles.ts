import styled from 'styled-components';

export const BaseModalBackground = styled.div`
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 30;
  background-color: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
`

export const TerminalContainer = styled.div`
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 80%;
  height: 80%;
  max-width: 80%;
  max-height: 80%;
`;

export const TerminalDiv = styled.ul`

  width: 100%;

  margin: 0;
  scroll-behavior: smooth;

  list-style: none;
  
  padding: 10px;
  overflow: hidden;
  background-color: #181c24;
  overflow-y: auto !important;
  color: white;

  font-family: monospace;
  font-size: 12px;

  li {
    padding: 5px;
  }
  
`;
