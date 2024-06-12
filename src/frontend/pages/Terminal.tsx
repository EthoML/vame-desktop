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

const commonersLogPluginOutput = Symbol('logPluginOutput')

const logFunctions = ["log", "warn", "error"]

const messages = [];

const ogMethods = {}
logFunctions.forEach((method) => {
  ogMethods[method] = console[method]

  console[method] = (...args) => {
    if (args[0] === commonersLogPluginOutput) return
      else ogMethods[method](...args)
  }

})

commoners.ready.then(() => {
  commoners.plugins.log.subscribe(({ method, args }) => {
    console[method](commonersLogPluginOutput, ...args)
  })
})

const Terminal: React.FC = () => {

  const [currentMessages, setCurrentMessages] = useState(messages);

  useEffect(() =>{
    setCurrentMessages([...messages])
  }, []);

  logFunctions.forEach((method) => {

    console[method] = (...args) => {

      // Intercept log from Electron
      if (args[0] === commonersLogPluginOutput) {
        messages.push({ method, args: args.slice(1) })
        setCurrentMessages([...messages])
      } 
      
      // Normal log
      else ogMethods[method](...args)
    }

  })


  return (
    <TerminalDiv id="terminal">
      {currentMessages.map(({ method, args }, index) => (
        <li key={index}>
          <span className={method}>
            {args.join(' ')}
          </span>
        </li>
      ))}
    </TerminalDiv>
  );
};

export default Terminal;
