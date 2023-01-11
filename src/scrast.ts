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
};

const parseArgs = async () => {
  const defaults = {
    inputFormat: "x11grab",
    videoCodec: "h264_nvenc",
    resolution: "2560x1440",
    frameRate: 60,
    probeSize: "128M",
    input: ":0.0",
    preset: "p7",
    tune: "lossless",
    videoProfile: "high444p",
    pixelFormat: "yuv444p",
    outputFormat: "matroska",
    replaceExisting: true,
  };

  const parser = yargs(process.argv.slice(2))
    .options({
      r: {
        type: "number",
        default: defaults.frameRate,
      },
      s: {
        default: defaults.resolution,
      },
      i: {
        default: defaults.input,
      },
      probeSize: {
        default: defaults.probeSize,
      },
      preset: {
        default: defaults.preset,
      },
      tune: {
        default: defaults.tune,
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
      y: {
        type: "boolean",
        default: defaults.replaceExisting,
      },
    })
    .strict();

  const {
    r: rate,
    s: resolution,
    i: input,
    probeSize,
    preset,
    tune,
    videoProfile,
    pixelFormat,
    outputFormat,
    y: replaceExisting,
  } = await parser.argv;

  const outputFile = generateOutputFilename();

  const args = [
    "-f",
    defaults.inputFormat,
    "-s",
    resolution,
    "-r",
    String(rate),
    "-probesize",
    probeSize,
    "-i",
    input,
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
    "-f",
    outputFormat,
    outputFile,
    replaceExisting ? "-y" : "-n",
  ];

  return args;
};

export { main };
