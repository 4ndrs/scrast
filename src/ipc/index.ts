import path from "path";
import { fork } from "child_process";
import { connect } from "node:net";
import { unlinkSync } from "fs";

import ffmpeg from "../ffmpeg";

import type { ChildProcess, Serializable } from "child_process";

let listener: ChildProcess;
const SOCKETFILE = "/tmp/scrast.sock";

const start = async () => {
  await checkSocket();

  listener = fork(`${path.dirname(__filename)}/listener`);
  listener.on("message", handleMessage);
};

const kill = () => {
  if (!listener) {
    return;
  }

  listener.kill("SIGTERM");
};

const handleMessage = (message: Serializable) => {
  switch (message) {
    case "stop":
      ffmpeg.kill();
      kill();
      break;
    case "pause":
      ffmpeg.pause();
      break;
    case "resume":
      ffmpeg.resume();
      break;
  }
};

const sendMessageToSocket = (message: string) =>
  new Promise((resolve, reject) => {
    const connection = connect(SOCKETFILE);

    connection.on("ready", () => resolve(connection.write(message)));
    connection.on("error", () => reject("socket is inactive"));
  });

/**
 * Checks if /tmp/scrast.sock exists, if it does and it is active throws
 * an error. The socket file will be removed if it is not active.
 */
const checkSocket = () =>
  new Promise<void>((resolve, reject) => {
    const connection = connect(SOCKETFILE);

    connection.on("ready", () => reject("socket is active"));
    connection.on("error", () => resolve(unlinkSync(SOCKETFILE)));
  });

export default { start, kill, sendMessageToSocket };
