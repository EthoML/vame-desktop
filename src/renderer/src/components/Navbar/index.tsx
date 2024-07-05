import React, { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCirclePlus, faFileImport, faGear, faHome } from '@fortawesome/free-solid-svg-icons';

import Tippy from '@tippyjs/react';
import { NavbarButton, NavbarContainer, NavbarHeader, NavbarSection } from './styles';

const Navbar: React.FC = () => {

    const navigate = useNavigate()

    const upload = useCallback(async () => {
        const fileInput = document.createElement('input')
        fileInput.type = 'file'
        fileInput.webkitdirectory = true
        fileInput.click()

        const promise = new Promise((resolve, reject) => {
            fileInput.onchange = async (ev) => {
                // @ts-ignore
                const files = Array.from(ev.target.files);
                // @ts-ignore
                const configPath = files.length > 0 ? files.find((file) => file.name === 'config.yaml')?.path : null
                if (!configPath) {
                    const mainError = "No config.yaml file found in the selected directory."
                    window.alert(`${mainError} \n\nPlease select a valid VAME project.`)
                    return reject(mainError)
                }

                resolve(configPath)
            }
        })

        const project = await promise

        navigate({
            pathname: "/project",
            search: `?path=${project}`
        });
    },[])

    return (
        <NavbarContainer>
            <NavbarSection>
                <NavbarHeader to="/">VAME Desktop</NavbarHeader>
            </NavbarSection>
            <NavbarSection>
                <Link to="/">
                    <Tippy content={<span>Home page</span>}>
                        <NavbarButton>
                            <FontAwesomeIcon icon={faHome} />
                        </NavbarButton>
                    </Tippy>
                </Link>
                <Link to="/create">
                    <Tippy content={<span>Create a new project</span>}>
                        <NavbarButton>
                            <FontAwesomeIcon icon={faFileCirclePlus} />
                        </NavbarButton>
                    </Tippy>
                </Link>
                <Tippy content={<span>Load an external project</span>}>
                    <NavbarButton onClick={upload}>
                        <FontAwesomeIcon icon={faFileImport} />
                    </NavbarButton>
                </Tippy>
                <Link to="/settings">
                    <Tippy content={<span>Edit global settings</span>}>
                        <NavbarButton>
                            <FontAwesomeIcon icon={faGear} />
                        </NavbarButton>
                    </Tippy>
                </Link>
            </NavbarSection>
        </NavbarContainer>
    );
}

export default Navbar;


