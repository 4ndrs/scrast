import { ChildProcessWithoutNullStreams, spawn } from "child_process";

import { setStore } from "./store";
import { getSeconds } from "./utils";

let process: ChildProcessWithoutNullStreams | null;

const run = (args: Array<string>) => {
  if (process) {
    throw new Error("Process is assigned");
  }

  process = spawn("ffmpeg", args);
  process.on("spawn", handleSpawn);
  process.on("close", handleClose);
  process.on("error", handleError);
  process.stderr.on("data", (data) => updateSizeAndSeconds(data.toString()));
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

const handleSpawn = () => {
  setStore((current) => ({ ...current, status: "recording" }));
};

const handleClose = () => {
  process = null;
  setStore((current) => ({ ...current, status: "stopped" }));
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
    size: Number(size),
    seconds: getSeconds(time),
  };
};

const isError = (error: unknown): error is NodeJS.ErrnoException =>
  error instanceof Error;

export default { run, onClose };
