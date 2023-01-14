import net from "node:net";

const listener = net.createServer((connection) => {
  connection.on("data", (data) => {
    const command = data.toString().trim();

    if (!process.send) {
      throw new Error("Not spawned with an IPC channel");
    }

    switch (command) {
      case "stop":
        process.send(command);
        connection.end();
        break;
      case "pause":
        process.send(command);
        connection.end();
        break;
      case "resume":
        process.send(command);
        connection.end();
        break;
      case "info":
        process.send(command);
        process.on("message", (message) => connection.end(`${message}\n`));
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
      default:
        connection.end();
    }
  });
});

listener.listen("/tmp/scrast.sock");
