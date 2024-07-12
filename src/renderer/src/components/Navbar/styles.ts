import styled from "styled-components";
import { Link } from "react-router-dom";

export const NavbarHeader = styled(Link)`
    font-size: 24px;
    color: black;
    font-weight: bold;
    text-decoration: none;
`;

export const NavbarContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  gap: 20px;
  font-size: 20px;
  padding: 20px 20px;
  background: whitesmoke;
`;

export const NavbarSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
`;

export const NavbarButton = styled.button`
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
