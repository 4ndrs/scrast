import { fork } from "child_process";
import { connect } from "node:net";
import { existsSync, unlinkSync } from "fs";

import ffmpeg from "../ffmpeg";
import { getStore } from "../store";
import { getHumanSize, getHumanTime } from "../utils";

import type { ChildProcess, Serializable } from "child_process";

let listener: ChildProcess;
const SOCKETFILE = "/tmp/scrast.sock";

const start = async () => {
  await checkSocket();

  listener = fork(`${__dirname}/listener`);
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
    case "info":
      listener.send(getInfo());
      break;
  }
};

const getInfo = () => {
  const { status, size, seconds } = getStore();

  return (
    `Status: ${status}\n` +
    `Elapsed: ${getHumanTime(seconds)}\n` +
    `Size: ${getHumanSize(size)}`
  );
};

const sendMessageToSocket = (message: string) =>
  new Promise<void | string>((resolve, reject) => {
    const connection = connect(SOCKETFILE);

    if (message === "info") {
      connection.write(message);
      connection.on("data", (data) => resolve(data.toString()));
    } else {
      connection.on("ready", () => {
        connection.write(message);
        resolve();
      });
    }

    connection.on("error", () => reject("socket is inactive"));
  });

/**
 * Checks if /tmp/scrast.sock exists, if it does and it is active throws
 * an error. The socket file will be removed if it is not active.
 */
const checkSocket = () =>
  new Promise<void>((resolve, reject) => {
    if (existsSync("/tmp/scrast.sock")) {
      const connection = connect(SOCKETFILE);

      connection.on("ready", () => reject("socket is active"));
      connection.on("error", () => resolve(unlinkSync(SOCKETFILE)));
    } else {
      resolve();
    }
  });

export default { start, kill, sendMessageToSocket };
