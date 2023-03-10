import { spawn } from "child_process";

import { setStore } from "./store";
import { getSeconds } from "./utils";

import type { ChildProcessWithoutNullStreams } from "child_process";
import type { Status } from "./types";

let process: ChildProcessWithoutNullStreams | null;
let errorBuffer = "";

const run = (args: Array<string>) => {
  if (process) {
    throw new Error("Process is assigned");
  }

  process = spawn("ffmpeg", args);

  process.on("close", handleClose);
  process.on("error", handleError);
  process.stderr.on("data", (data) => (errorBuffer += data.toString()));

  process.on("spawn", () => updateStatus("recording"));
  process.on("close", () => updateStatus("stopped"));
  process.stderr.on("data", (data) => updateSizeAndSeconds(data.toString()));
};

const kill = () => {
  if (!process) {
    return;
  }

  if (process.killed) {
    process.kill("SIGCONT");
  }

  updateStatus("stopping");
  process.kill("SIGINT");
};

const pause = () => {
  if (!process) {
    return;
  }

  process.kill("SIGTSTP");
  updateStatus("paused");
};

const resume = () => {
  if (!process) {
    return;
  }

  updateStatus("recording");
  process.kill("SIGCONT");
};

const onClose = (callback: () => void) => {
  if (!process) {
    return;
  }

  process.on("close", callback);
};

const updateSizeAndSeconds = (stderr: string) => {
  const result = parseSizeAndTime(stderr);

  if (!result) {
    return;
  }

  const { size, seconds } = result;
  setStore((current) => ({ ...current, seconds, size }));
};

const updateStatus = (status: Status) => {
  setStore((current) => ({ ...current, status }));
};

const handleClose = (code: number, signal: NodeJS.Signals) => {
  const buffer = errorBuffer;

  errorBuffer = "";
  process = null;

  if (signal !== null) {
    console.error(`\nffmpeg closed with signal ${signal}, code ${code}`);
  }

  if (signal === null && ![0, 255].includes(code)) {
    throw new Error(
      `Abnormal termination of ffmpeg, dumping error buffer:\n\n${buffer}`
    );
  }
};

const handleError = (error: unknown) => {
  if (!isError(error)) {
    return;
  }

  if (error.code === "ENOENT") {
    throw new Error("ffmpeg binary not found");
  }

  throw error;
};

const parseSizeAndTime = (line: string) => {
  const regex = /(?<size>[0-9]+)kB\s+time=(?<time>\d{2,}:\d{2}:\d{2}.\d{2})/;
  const match = line.match(regex)?.groups;

  if (!match) {
    return;
  }

  const { size, time } = match;

  return {
    size: Number(size) * 1024,
    seconds: getSeconds(time),
  };
};

const isError = (error: unknown): error is NodeJS.ErrnoException =>
  error instanceof Error;

export default { run, kill, pause, resume, onClose };
