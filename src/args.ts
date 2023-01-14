import yargs from "yargs/yargs";

import ipc from "./ipc";
import { generateOutputFilename } from "./utils";

const parseArgs = async () => {
  const defaults = {
    inputFormat: "x11grab",
    videoCodec: "h264_nvenc",
    frameRate: 60,
    probeSize: "128M",
    threadQueueSize: "1024",
    selectRegion: false,
    windowId: "0",
    input: ":0.0",
    preset: "p7",
    tune: "lossless",
    videoProfile: "high444p",
    pixelFormat: "yuv444p",
    outputFormat: "matroska",
    replaceExisting: true,
    noMouse: false,
  };

  const parser = yargs(process.argv.slice(2))
    .options({
      i: {
        alias: "input",
        default: defaults.input,
      },
      r: {
        alias: "framerate",
        type: "number",
        default: defaults.frameRate,
      },
      s: {
        alias: "select-region",
        type: "boolean",
        default: defaults.selectRegion,
        describe:
          "If set, will be asked to select a region on the screen to be " +
          "recorded.",
      },
      w: {
        alias: "window-id",
        type: "string",
        default: defaults.windowId,
        describe:
          "The window to record. Default is the root window. Use " +
          "xwininfo to get the ID.",
      },
      N: {
        alias: "no-mouse",
        type: "boolean",
        default: defaults.noMouse,
      },
      P: {
        alias: "probesize",
        default: defaults.probeSize,
      },
      p: {
        alias: "preset",
        default: defaults.preset,
        choices: ["p1", "p2", "p3", "p4", "p5", "p6", "p7"],
      },
      t: {
        alias: "tune",
        default: defaults.tune,
        choices: ["hq", "ll", "ull", "lossless"],
      },
      R: {
        alias: "profile:v",
        default: defaults.videoProfile,
      },
      x: {
        alias: "pix_fmt",
        default: defaults.pixelFormat,
      },
      f: {
        alias: "output-format",
        default: defaults.outputFormat,
      },
      a: {
        alias: "alsa-audio",
        type: "string",
        describe:
          "One of the devices shown in `arecord -L`. Audio will be " +
          "enabled if set.",
      },
    })
    .command(
      "stop",
      "sends the stop signal to the currently running instance.",
      () => sendCommand("stop")
    )
    .command(
      "pause",
      "sends the pause signal to the currently running instance.",
      () => sendCommand("pause")
    )
    .command(
      "resume",
      "sends the resume signal to the currently running instance.",
      () => sendCommand("resume")
    )
    .alias("help", "h")
    .alias("version", "v")
    .strict();

  const {
    r: rate,
    i: input,
    a: alsaAudio,
    N: noMouse,
    s: selectRegion,
    w: windowId,
    P: probeSize,
    p: preset,
    t: tune,
    R: videoProfile,
    x: pixelFormat,
    f: outputFormat,
  } = await parser.argv;

  const videoInputArgs = [
    "-f",
    defaults.inputFormat,
    "-r",
    String(rate),
    "-probesize",
    probeSize,
    "-thread_queue_size",
    defaults.threadQueueSize,
    "-draw_mouse",
    noMouse ? "0" : "1",
    "-select_region",
    selectRegion ? "1" : "0",
    "-show_region",
    "1",
    "-window_id",
    windowId,
    "-i",
    input,
  ];

  const audioInputArgs = alsaAudio
    ? [
        "-f",
        "alsa",
        "-thread_queue_size",
        defaults.threadQueueSize,
        "-i",
        alsaAudio,
      ]
    : [];

  const audioOutputArgs = alsaAudio ? ["-c:a", "copy"] : [];
  const videoOutputArgs = [
    "-c:v",
    defaults.videoCodec,
    "-preset",
    preset,
    "-tune",
    tune,
    "-profile:v",
    videoProfile,
    "-pix_fmt",
    pixelFormat,
  ];

  const outputFile = generateOutputFilename();
  const args = [
    "-hide_banner",
    ...videoInputArgs,
    ...audioInputArgs,
    ...videoOutputArgs,
    ...audioOutputArgs,
    "-f",
    outputFormat,
    outputFile,
    defaults.replaceExisting ? "-y" : "-n",
  ];

  await runIpc();

  return args;
};

const runIpc = async () => {
  try {
    await ipc.start();
  } catch (error) {
    if (typeof error === "string" && error === "socket is active") {
      console.error("There is already an instance running");
      process.exit(1);
    }

    throw error;
  }
};

const sendCommand = async (command: string) => {
  try {
    await ipc.sendMessageToSocket(command);
    process.exit();
  } catch (error) {
    if (typeof error === "string" && error === "socket is inactive") {
      console.error("There is no instance running");
      process.exit(1);
    }

    throw error;
  }
};

export { parseArgs };
