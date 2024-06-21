import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TerminalDiv } from './styles';
import { get } from '../../utils/requests';

interface TerminalProps {
  logName?: string;
  projectPath: string;
}

const LogComponent: React.FC<TerminalProps> = ({ logName,projectPath }) => {
  const logRef = useRef<HTMLUListElement>(null);
  const [logs, setLogs] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      let uri = "log"
      if (logName && projectPath) uri = `log/${logName}?project=${projectPath}`
      const url = encodeURI(uri)

      const logResponse = await get(url, { 'Content-Type': 'text/plain' })
      setLogs(logResponse as string);
    } catch {
      setLogs(logName ? `No log files found for: ${logName}` : `No log files found.`);
    }
  },[logName,projectPath])

  useEffect(() => {
    fetchLogs()
  }, []);

  useEffect(() => {
    logRef.current?.lastElementChild?.scrollIntoView()
  }, [logs]);


  if (!logs) return (<TerminalDiv id={logName ? `terminal-${logName}` : "terminal"}><li><span>Loading {logName} logs file...</span></li></TerminalDiv>)

  return (
    <TerminalDiv ref={logRef} id={logName ? `terminal-${logName}` : "terminal"}>
      {logs.split('\n').map((line, index) => (
        <li key={index}>
          <span>
            {line}
          </span>
        </li>
      ))}
    </TerminalDiv>
  );
};

export default LogComponent;
