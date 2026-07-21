import { useEffect, useState } from "react";
import { getProjectStateVAMEProject } from "../../../context/Projects/api/getProjectStateVAMEProject";

const TERMINAL = ["success", "failed", "aborted", "not_found"];
const POLL_MS = 3000;

type StepPoll = { state: string | null; polling: boolean };

/** Live state while running, else the persisted one. */
export const stepDisplayState = (poll: StepPoll, persisted?: string | null) =>
  poll.polling ? poll.state : poll.state ?? persisted;

/**
 * Track a pipeline step that runs in a backend thread. Call `start()` after the
 * POST resolves; `onDone` fires once with the terminal state.
 */
export function useStepPolling(
  projectPath: string,
  stepKey: string,
  onDone?: (state: string | null) => void | Promise<void>
) {
  const [polling, setPolling] = useState(false);
  const [state, setState] = useState<string | null>(null);

  // Resume a run already in progress (navigated back, reloaded, second tab).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const states = await getProjectStateVAMEProject({ project: projectPath });
        const current = states.states?.[stepKey]?.execution_state || null;
        if (!cancelled && current === "running") {
          setState(current);
          setPolling(true);
        }
      } catch (err) {
        console.error(`Error reading ${stepKey} state on mount:`, err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectPath, stepKey]);

  useEffect(() => {
    if (!polling) return;
    let cancelled = false;

    const id = setInterval(async () => {
      try {
        const states = await getProjectStateVAMEProject({ project: projectPath });
        const next = states.states?.[stepKey]?.execution_state || null;
        if (cancelled) return;
        setState(next);
        if (TERMINAL.includes(next as string)) {
          setPolling(false);
          await onDone?.(next);
        }
      } catch (err) {
        console.error(`Error polling ${stepKey} state:`, err);
      }
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
    // onDone omitted: an inline closure would reset the interval each render.
  }, [polling, projectPath, stepKey]);

  return { state, polling, start: () => setPolling(true) };
}
