import net from "node:net";

const listener = net.createServer((connection) => {
  connection.on("data", (data) => {
    const command = data.toString().trim();

    if (!process.send) {
      throw new Error("Not spawned with an IPC channel");
    }

    switch (command) {
      case "stop":
        process.send("stop");
        break;
      case "pause":
        process.send("pause");
        break;
      case "resume":
        process.send("resume");
        break;
      case "ping":
        connection.end("pong narashite!\n");
        break;
      case "ping pong":
        connection.end("pong taiken shiyo!\n");
        break;
      case "ping pong narashite":
        connection.end("ping pong pong, girls ganbare!🍀\n");
        break;
    }

    connection.end();
  });
});

listener.listen("/tmp/scrast.sock");
