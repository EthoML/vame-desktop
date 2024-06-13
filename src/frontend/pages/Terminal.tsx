import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { onReady } from '../commoners';
import { get } from '../utils/requests';

const TerminalDiv = styled.ul`

  list-style: none;
  
  padding: 50px;
  background-color: #181c24;
  overflow-y: auto !important;
  color: white;

  font-family: monospace;
  font-size: 12px;

  li {
    padding: 5px;
  }
  
`;


const Terminal: React.FC = () => {

  const [ currentText, setCurrentText ] = useState('');

  useEffect(() =>{
    onReady(() => {
      get('log', { 'Content-Type': 'text/plain' }).then(text => setCurrentText(text))
    })
  }, []);


  console.log(currentText)

  if (!currentText) return <TerminalDiv id="terminal"><li><span>Loading log file...</span></li></TerminalDiv>

  return (
    <TerminalDiv id="terminal">
      {currentText.split('\n').map((line, index) => (
        <li key={index}>
          <span>
            {line}
          </span>
        </li>
    ))}
    </TerminalDiv>
  );
};

export default Terminal;
