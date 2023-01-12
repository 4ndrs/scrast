import yargs from "yargs/yargs";

import ffmpeg from "./ffmpeg";
import screen from "./screen";

import { StoreEmitter } from "./store";
import { generateOutputFilename } from "./utils";

const main = async () => {
  const args = await parseArgs();

  StoreEmitter.on("store_update", screen.update);

  ffmpeg.run(args);
  ffmpeg.onClose(screen.end);

  process.on("uncaughtException", handleUncaughtException);
};

const handleUncaughtException = (error: Error) => {
  screen.printError(error.message);
  process.exit(1);
};

const parseArgs = async () => {
  const defaults = {
    inputFormat: "x11grab",
    videoCodec: "h264_nvenc",
    resolution: "2560x1440",
    frameRate: 60,
    probeSize: "128M",
    threadQueueSize: "1024",
    selectRegion: false,
    input: ":0.0",
    preset: "p7",
    tune: "lossless",
    videoProfile: "high444p",
    pixelFormat: "yuv444p",
    outputFormat: "matroska",
    doNotReplaceExisting: false,
  };

  const parser = yargs(process.argv.slice(2))
    .options({
      r: {
        alias: "inputFrameRate",
        type: "number",
        default: defaults.frameRate,
      },
      s: {
        alias: "inputSize",
        default: defaults.resolution,
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
        default: false,
        describe:
          "If set, will be asked to select a region on the screen to be " +
          "recorded.",
      },
      n: {
        alias: "doNotReplaceExisting",
        type: "boolean",
        default: defaults.doNotReplaceExisting,
      },
    })
    .strict();

  const {
    r: rate,
    s: resolution,
    i: input,
    alsaAudio,
    selectRegion,
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
    "-s",
    resolution,
    "-r",
    String(rate),
    "-probesize",
    probeSize,
    "-thread_queue_size",
    defaults.threadQueueSize,
    "-select_region",
    selectRegion ? "1" : "0",
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

export { main };
