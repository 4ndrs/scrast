import path from "path";
import { fork } from "child_process";
import { connect } from "node:net";
import { existsSync, unlinkSync } from "fs";

import ffmpeg from "../ffmpeg";

import type { ChildProcess, Serializable } from "child_process";

let listener: ChildProcess;

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

/**
 * Checks if /tmp/scrast.sock exists, if it does and it is active throws
 * an error. The socket file will be removed if it is not active.
 */
const checkSocket = () =>
  new Promise<void>((resolve, reject) => {
    const socketFile = "/tmp/scrast.sock";

    if (existsSync(socketFile)) {
      const connection = connect(socketFile);

      connection.on("ready", () => {
        reject(new Error("socket is active"));
      });

      connection.on("error", () => resolve(unlinkSync(socketFile)));
    }
  });

export default { start, kill };
