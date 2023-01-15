# scrast

Command line utility to record the screen. It uses ffmpeg internally, with x11grab and nvenc.

The name comes from **scr**eenc**ast**, and was entirely inspired by [scrot](https://github.com/resurrecting-open-source-projects/scrot).

## Installation

The project is available in the npm registry, and can be installed with npm:
```console
# npm -g install scrast
````

## Usage


[usage_preview.webm](https://user-images.githubusercontent.com/31898900/212485750-fd9ff290-e4a6-4c8a-b250-0e5246a49824.webm)


The short preview video above shows the usage of the ```--windowId``` and ```--selectRegion``` option flags, plus the commands available to communicate with the instance doing the recording. The ```get_window_id``` is an alias to ```xwininfo | sed -n "s/^.*id: \(\w*\).*$/\1/p"``` that I have added to my shell for convenience.

All of the available options/commands can be requested using the ```--help``` flag:

```console
$ scrast --help
Command line utility to record the screen

Usage:

scrast [options]  starts an instance with the specified options
scrast [command]  sends the specified command to the running instance

Commands:
  scrast stop    sends the stop command
  scrast pause   sends the pause command
  scrast resume  sends the resume command
  scrast info    sends the info command

ptions:
  -h, --help          Show help                                        [boolean]
  -v, --version       Show version number                              [boolean]
  -i, --input                                                  [default: ":0.0"]
  -r, --framerate                                         [number] [default: 60]
  -s, --selectRegion  If set, will be asked to select a region on the screen to
                      be recorded                     [boolean] [default: false]
  -w, --windowId      The window to record. Default is the root window. Use
                      xwininfo to get the ID             [string] [default: "0"]
  -N, --noMouse                                       [boolean] [default: false]
  -P, --probesize                                              [default: "128M"]
  -p, --preset
             [choices: "p1", "p2", "p3", "p4", "p5", "p6", "p7"] [default: "p7"]
  -t, --tune      [choices: "hq", "ll", "ull", "lossless"] [default: "lossless"]
  -R, --videoProfile                                       [default: "high444p"]
  -x, --pixelFormat                                         [default: "yuv444p"]
  -f, --outputFormat                                       [default: "matroska"]
  -a, --alsaAudio     One of the devices shown in `arecord -L`. Audio will be
                      enabled if set                                    [string]
  -I, --noIpc         Disables the IPC. Useful for running multiple instances.
                      Commands will not work when this flag is set
                                                      [boolean] [default: false]
  -E, --noNvenc       Escape hatch. If set, no nvenc flags will be used, and
                      anything passed to this flag will be parsed and set as
                      ffmpeg's output flags. Useful for experimenting with
                      ffmpeg, and for systems that do not have nvenc support.
                      Must be used with '='.
                      e.g.: -E='-c:v libx264 -preset ultrafast'         [string]
```

Running the utility without any options or commands will record the whole screen by default. Picking a window with ```--windowId``` will record only the selected window and overlaid windows (or transient windows like the context menu) will not be recorded. Here is the video recorded in the preview above with the ```--windowId``` option flag:


[1673717680349787.webm](https://user-images.githubusercontent.com/31898900/212487300-1938ca84-2eb7-458e-8092-b27d29318ead.webm)


As it can be seen, the picture moved around in the preview video is not shown in the final file. This does not happen with ```--selectRegion```, or when picking the root window.

Communication with the recording instance can happen through IPC (the one the commands use), or with signals, sent with ```pkill```/```kill``` command line utilities, or the keyboard directly (<kbd>CTRL</kbd>+<kbd>C</kbd>). The signals used are ```SIGTERM```, ```SIGINT```, ```SIGTSTP```, and ```SIGCONT```.

The commands ```info```, ```stop```, ```pause```, and ```resume```  use the IPC with a socket named ```/tmp/scrast.sock``` to communicate with the running instance. It is even possible to use the socket directly to send commands (or sing the [Wakaba Girl's opening theme](https://youtu.be/ItjFLbYDvo0)), for example with netcat:

![ping](https://user-images.githubusercontent.com/31898900/212488992-116d8473-4d96-401a-876d-5fdfa87db976.gif)


IPC can be disabled using the ```--noIpc``` flag, which makes the commands stop working, leaving only signals for communication.

## No NVENC

There is an option flag called ```--noNvenc``` which completely removes all the nvenc encoder flags sent to the ffmpeg process, and parses whatever gets assigned to this flag. This is useful for system that do not have NVENC support, and allows for using software encoding with the libx264 encoder for example.
```
$ scrast --noNvenc='-c:v libx264 -preset ultrafast' --alsaAudio pulse
```

## A Note on Pause & Resume

The current implementation of pause & resume is extremely experimental, and will not work as intended most of the times. It just sends the ```SIGTSTP```, and ```SIGCONT``` signals to the ffmpeg process.


## Building

To build the project, execute the following commands:
```console
$ npm ci
$ npm run build
```
