require("dotenv").config();

const run = require("./run");
const http = require("http");
const configs = require("./config.json");

const accountId = configs.accountId;
const applicationIds = configs.applicationIds;
const timeRanges = configs.timeRanges;
const pages = configs.pages;

const getWsDebuggerUrl = async () => {
  return new Promise((resolve) => {
    http.get("http://127.0.0.1:9222/json/version", (res) => {
      res.addListener("data", (data) => {
        try {
          const result = JSON.parse(data.toString());
          const { webSocketDebuggerUrl } = result;
          resolve(webSocketDebuggerUrl);
        } catch (e) {
          console.error(e);
        }
      });
    });
  });
};

(async () => {
  let isFirstRun = true;
  const webSocketDebuggerUrl = await getWsDebuggerUrl();

  for (let applicationName of Object.keys(applicationIds)) {
    for (let timeRange of timeRanges) {
      const [start, end] = timeRange;

      await run({
        webSocketDebuggerUrl,
        accountId,
        applicationId: applicationIds[applicationName],
        applicationName,
        start,
        end,
        pages,
        isFirstRun,
      }).catch((e) => {
        console.log(e);
      });
      isFirstRun = false;
    }
  }
})();
