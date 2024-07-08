
export function runChildProcess(exec: string, path?: string[]) {
  let stdoutChunks = [], stderrChunks = [];
  const spawn = require("child_process").spawn

  const child = spawn(exec, path, {
    env: {
      PATH: process.env.PATH
    }
  });

  child.on('exit', (code) =>
    console.log(`[${exec}]: Process exited with code ${code}`)
  );

  child.stdout.on('data', (data) => {
    console.log(`[${exec}]:`, data.toString());
    stdoutChunks = stdoutChunks.concat(data);
  });

  child.stderr.on('data', (data) => {
    console.log(`[${exec} error]:`, data.toString());
    stderrChunks = stderrChunks.concat(data);
  });

  return child
}