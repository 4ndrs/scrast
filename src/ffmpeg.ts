import { ChildProcessWithoutNullStreams, spawn } from "child_process";

import { setStore } from "./store";
import { getSeconds } from "./utils";

import type { Status } from "./types";

let process: ChildProcessWithoutNullStreams | null;
let errorBuffer = "";

type Type = Exclude<Status, "stopping" | "stopped" | "paused">;
type Options = { updateStore: boolean; type: Type };

const OPTIONS: Options = { updateStore: true, type: "recording" };

const run = (args: Array<string>, options = OPTIONS) => {
  if (process) {
    throw new Error("Process is assigned");
  }

  process = spawn("ffmpeg", args);

  process.on("close", handleClose);
  process.on("error", handleError);
  process.stderr.on("data", (data) => (errorBuffer += data.toString()));

  if (options.updateStore) {
    process.on("spawn", () => updateStatus(options.type));
    process.on("close", () => updateStatus("stopped"));
    process.stderr.on("data", (data) => updateSizeAndSeconds(data.toString()));
  }
};

type KillOptions = { updateStore: boolean };

const kill = (options: KillOptions = { updateStore: true }) => {
  if (!process) {
    return;
  }

  if (options.updateStore) {
    updateStatus("stopping");
  }

  process.kill("SIGTERM");
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

export default { run, kill, onClose };
