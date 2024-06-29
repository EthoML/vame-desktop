import React from "react";  
import styled from 'styled-components';

import { Link } from 'react-router-dom';


const SidebarContainer = styled.nav`
    background-color: #478dff;
    color: white;
    font-size: 20px;
    padding: 20px;
`;

const SidebarList = styled.ul`
    list-style: none;
    padding: 0;
`;

const SidebarListItem = styled.li`
    padding: 0;

    &:hover {
        background-color: white;
        border-radius: 8px;
    }
`;

const SidebarLink = styled(Link)`
    color: white;
    padding: 10px 30px;

    &:hover {
        color: #0096ff;
    }
`;
    
const Sidebar: React.FC = () => {
    return (
        <SidebarContainer>
            <SidebarList className="navbar-nav d-flex flex-column">
                <SidebarListItem><SidebarLink className="nav-link" to="/">Projects</SidebarLink></SidebarListItem>
                <SidebarListItem><SidebarLink className="nav-link" to="/settings">Settings</SidebarLink></SidebarListItem>
            </SidebarList>
        </SidebarContainer>
    );
};

export default Sidebar;