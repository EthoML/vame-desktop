import styled from 'styled-components';

export const DashboardContainer = styled.div`
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100vh;
  width: 100vw;

  & > *:nth-child(2) {
    display: flex;
    flex-direction: column;
    overflow-y: hidden;
  }
`;