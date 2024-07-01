import { spawn } from "child_process";

export function runChildProcess(process: string, path?: string[]) {
  let stdoutChunks = [], stderrChunks = [];
  const child = spawn(process, path);

  child.on('exit', (code) =>
    console.log('Process exited with code', code)
  );

  child.stdout.on('data', (data) => {
    console.log(`[${process}]:`, data.toString());
    stdoutChunks = stdoutChunks.concat(data);
  });

  child.stderr.on('data', (data) => {
    console.log(`[${process} error]:`, data.toString());
    stderrChunks = stderrChunks.concat(data);
  });

  child.once("exit", (data) => {
    console.log(`[${process}]: ${data?.toString()}`)
  })

  return child
}