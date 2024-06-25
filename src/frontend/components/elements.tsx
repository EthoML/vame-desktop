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
    padding-top: 0px;
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

export const Video = styled.video`
    max-height: 200px;
`

export const StyledHeaderDiv = styled.div`
    padding-bottom: 10px;
    margin-bottom: 20px;
    border-bottom: 1px solid rgba(210, 210, 210);

    display: flex;
    justify-content: space-between;
    align-items: center;


    h2 {
        font-size: 30px;
        font-weight: bold;
        margin: 0;
        padding: 0;
    }
  
`