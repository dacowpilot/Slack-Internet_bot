const axios = require("axios");
require("dotenv").config();
const { performance } = require("perf_hooks");

const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

app.command("/internet_bot-ping", async ({ command, ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `Pong!\nLatency: ${latency}ms` });
});

app.command("/internet_bot-help", async ({ ack, respond }) => {
  await ack();
  await respond({
    text:
`Available Commands:
/internet_bot-ping - bot latency test
/internet_bot-download - checks download speed
/internet_bot-help - list of commands
/internet_bot-hello - says hi`
  });
});

app.command("/internet_bot-download", async ({ ack, respond }) => {
  await ack();

  await respond("Testing download speed...");

  try {
    const downloadSize = 10 * 1024 * 1024; // 10 MB
    const downloadStart = performance.now();

    await axios.get(
      `https://speed.cloudflare.com/__down?bytes=${downloadSize}`,
      {
        responseType: "arraybuffer",
        timeout: 30000
      }
    );

    const downloadSeconds = (performance.now() - downloadStart) / 1000;
    const downloadMbps =
      (downloadSize * 8) / downloadSeconds / 1_000_000;

    await respond(`Download Speed: *${downloadMbps.toFixed(2)} Mbps*`);

  } catch (error) {
    console.error(error);
    await respond("❌ Speed test failed.");
  }
});

app.command("/internet_bot-hello", async ({ ack, respond, command }) => {
  await ack();

  await respond(`👋 Hello, ${command.user_name}!`);
});

(async () => {
  await app.start();
  console.log("bot is running!");
})();