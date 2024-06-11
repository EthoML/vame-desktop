import styled from "styled-components";

export const CenteredFullscreenDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

export const PaddedTab = styled.div`
    padding: 20px;
`;

export const GridTab = styled.div`
    display: grid;
    grid-template-rows: 1fr auto;
    gap: 20px;
    height: 100%;
`

export const PaddedBottomRow = styled.div`
    padding: 20px;
    padding-top: 0px
`

// Video Players
export const Videos = styled.div`
    display: flex;
    padding: 20px;
    gap: 25px;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
`

export const VideoContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
`