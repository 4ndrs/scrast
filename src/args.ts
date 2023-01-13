import yargs from "yargs/yargs";

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
    doNotReplaceExisting: false,
    noMouse: false,
  };

  const parser = yargs(process.argv.slice(2))
    .options({
      r: {
        alias: "inputFrameRate",
        type: "number",
        default: defaults.frameRate,
      },
      i: {
        alias: "input",
        default: defaults.input,
      },
      probeSize: {
        default: defaults.probeSize,
      },
      preset: {
        default: defaults.preset,
        choices: ["p1", "p2", "p3", "p4", "p5", "p6", "p7"],
      },
      tune: {
        default: defaults.tune,
        choices: ["hq", "ll", "ull", "lossless"],
      },
      videoProfile: {
        default: defaults.videoProfile,
      },
      pixelFormat: {
        default: defaults.pixelFormat,
      },
      outputFormat: {
        default: defaults.outputFormat,
      },
      alsaAudio: {
        type: "string",
        describe:
          "One of the devices shown in `arecord -L`. Audio will be " +
          "enabled if set.",
      },
      selectRegion: {
        type: "boolean",
        default: defaults.selectRegion,
        describe:
          "If set, will be asked to select a region on the screen to be " +
          "recorded.",
      },
      windowId: {
        type: "string",
        default: defaults.windowId,
        describe:
          "The window to record. Default is the root window. Use " +
          "xwininfo to get the ID.",
      },
      n: {
        alias: "doNotReplaceExisting",
        type: "boolean",
        default: defaults.doNotReplaceExisting,
      },
      noMouse: {
        type: "boolean",
        default: defaults.noMouse,
      },
    })
    .strict();

  const {
    r: rate,
    i: input,
    alsaAudio,
    noMouse,
    selectRegion,
    windowId,
    probeSize,
    preset,
    tune,
    videoProfile,
    pixelFormat,
    outputFormat,
    n: doNotReplaceExisting,
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
    doNotReplaceExisting ? "-n" : "-y",
  ];

  return args;
};

export { parseArgs };
