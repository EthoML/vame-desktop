import styled from "styled-components";

export const ProjectHeader = styled.header`
  height: 100%;
  width: 100%;
  padding: 20px 30px;
  overflow: visible;
`

export const ProjectInformation = styled.div`
  display: flex;
  gap: 15px;
  padding: 10px;

`;

export const CenteredFullscreenDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

export const ProjectInformationCapsule = styled.div`
  display: flex;
  align-items: center;
  margin: 0;
  background: #f4f4f4;
  padding: 5px 10px;
  border-radius: 10px;
`;

export const HeaderButtonContainer = styled.div`
  display: flex;
  gap: 10px;
`;

export const HeaderButton = styled.button`
  font-size: 14px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background: #181c24;
  color: white;
  cursor: pointer;
`;