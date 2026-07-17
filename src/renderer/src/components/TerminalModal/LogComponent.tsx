import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TerminalDiv } from './styles';
import { get } from '../../utils/requests';

interface TerminalProps {
  logName?: string;
  projectPath: string;
}

const POLL_MS = 5000;

const LogComponent: React.FC<TerminalProps> = ({ logName, projectPath }) => {
  const logRef = useRef<HTMLUListElement>(null);
  const [logs, setLogs] = useState('');

  const fetchLogs = useCallback(async () => {
    let uri = "log"
    if (logName && projectPath) uri = `log/${logName}?project=${projectPath}`
    const url = encodeURI(uri)

    const logResponse = await get(url)
    if (logResponse.success){

      setLogs(logResponse.data as string);
    } else {
      setLogs(logName ? `No log files found for: ${logName}` : `No log files found.`);
    }
  }, [logName, projectPath])

  // Poll only while the terminal is actually on screen. Inactive pipeline tabs
  // stay mounted but `display:none`, so without this gate every log panel the
  // user ever opened would keep hitting /log once per second forever — even on
  // hidden tabs and long after the step finished. An IntersectionObserver
  // reports a `display:none` element as not intersecting, which lets us pause
  // the interval until the tab is shown again.
  useEffect(() => {
    const el = logRef.current;
    if (!el) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (intervalId !== null) return;
      fetchLogs(); // immediate refresh on (re)entry, then poll
      intervalId = setInterval(fetchLogs, POLL_MS);
    };
    const stop = () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start();
      else stop();
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      stop();
    };
  }, [fetchLogs]);

  useEffect(() => {
    logRef.current?.lastElementChild?.scrollIntoView()
  }, [logs]);

  return (
    <TerminalDiv ref={logRef} id={logName ? `terminal-${logName}` : "terminal"}>
      {!logs ? (
        <li><span>Loading {logName} logs file...</span></li>
      ) : (
        logs.split('\n').map((line, index) => (
          <li key={index}>
            <span>
              {line}
            </span>
          </li>
        ))
      )}
    </TerminalDiv>
  );
};

export default LogComponent;
