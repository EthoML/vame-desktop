import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCirclePlus, faFileImport, faGear, faTerminal } from '@fortawesome/free-solid-svg-icons';

import Tippy from '@tippyjs/react';

const NavbarHeader = styled(Link)`
    font-size: 24px;
    color: black;
    font-weight: bold;
    text-decoration: none;
`;

const NavbarContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  gap: 20px;
  font-size: 20px;
  padding: 20px 20px;
  background: whitesmoke;
`;

const NavbarSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
`;

const ControlButton = styled.button`
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

const Navbar: React.FC = () => {

    const navigate = useNavigate()

    return (
        <NavbarContainer>
            <NavbarSection>
                <NavbarHeader to="/">VAME Desktop</NavbarHeader>
            </NavbarSection>
            <NavbarSection>
                <Tippy content={<span>Load an external project</span>}>
                    <ControlButton onClick={async () => {

                        const fileInput = document.createElement('input')
                        fileInput.type = 'file'
                        fileInput.webkitdirectory = true
                        fileInput.click()

                        const promise = new Promise((resolve, reject) => {

                            fileInput.onchange = async (ev) => {

                                const files = Array.from(ev.target.files);
                                const configPath = files.length > 0 ? files.find(file => file.name === 'config.yaml')?.path : null
                                if (!configPath) {
                                    window.alert('No config.yaml file found in the selected directory. \n\nPlease select a valid VAME project.')
                                    return reject()
                                }

                                // const pipeline = new Pipeline(configPath)
                                // await pipeline.load()

                                // mainConsoleElement.innerHTML = '' // Clear the console
                                // app.set(pipeline)

                                resolve(configPath)
                            }
                        })

                        const project = await promise

                        navigate({
                            pathname: "/project",
                            search: `?project=${project}`
                        });
                    }}>
                        <FontAwesomeIcon icon={faFileImport} />
                    </ControlButton>
                </Tippy>
                <Link to="/create">
                    <Tippy content={<span>Create a new project</span>}>
                        <ControlButton>
                            <FontAwesomeIcon icon={faFileCirclePlus} />
                        </ControlButton>
                    </Tippy>
                </Link>
                <Link to="/settings">
                    <Tippy content={<span>Edit global settings</span>}>
                        <ControlButton>
                            <FontAwesomeIcon icon={faGear} />
                        </ControlButton>
                    </Tippy>
                </Link>
                <Link to="/terminal">
                    <Tippy content={<span>Open terminal view</span>}>
                        <ControlButton>
                            <FontAwesomeIcon icon={faTerminal} />
                        </ControlButton>
                    </Tippy>
                </Link>
            </NavbarSection>
        </NavbarContainer>
    );
}

export default Navbar;


