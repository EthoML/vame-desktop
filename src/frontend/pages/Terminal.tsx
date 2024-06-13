import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

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


const Terminal: React.FC = ({
  text
}) => {

  const [currentText, setCurrentText] = useState(text);

  useEffect(() =>{
    setCurrentText(text)
  }, []);

  const messages = currentText.split('\n')

  return (
    <TerminalDiv id="terminal">
      {messages.map((line, index) => (
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
