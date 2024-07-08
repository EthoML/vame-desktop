import { ButtonHTMLAttributes } from "react";
import styled from "styled-components";

export const TabsContainer = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
  overflow: hidden;
`;

export const TabList = styled.div`
  display: flex;
  overflow-x: auto;
  white-space: nowrap;
  border-bottom: 1px solid #ccc;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none; /* Hide scrollbar for webkit browsers */
  }
`;

export const TabContent = styled.div`
  display: flex;
  position: relative;
  overflow: auto;
`;

interface TabPaneProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  $active: boolean;
}

export const TabPane = styled.div<TabPaneProps>`
  display: ${(props) => (props.$active ? 'block' : 'none')};
  width: 100%;
  height: 100%;
`;

interface TabButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  $active: boolean;
  $complete?: boolean;
}

export const TabButton = styled.button<TabButtonProps>`
  padding: 10px 20px;
  cursor: pointer;
  border: none;
  background: none;
  font-size: 16px;
  outline: none;
  transition: background-color 0.3s;
  border-bottom: ${(props) => (props.$active ? '2px solid #007bff' : 'none')};
  font-weight: ${(props) => (props.$active ? 'bold' : 'normal')};
  flex-shrink: 0;
  flex-grow: 1;
  color: #000;

  &:hover {
    background-color: #f0f0f0;
  }

  &:disabled {
    pointer-events: none;
  }

  ${(props) =>
    props.$complete
      ? `&:after {
    margin-left: 10px;
    content: '✓';
    color: #28a745;
  }`
      : ''}
`;

export const PaddedTab = styled.div`
  padding: 20px;
`;

export const GridTab = styled.div`
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 20px;
  height: 100%;
`;

export const PaddedBottomRow = styled.div`
  padding: 20px;
  padding-top: 0px;
`;
