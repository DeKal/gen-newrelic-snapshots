require("dotenv").config();

const run = require("./run");
const http = require("http");

const accountId = process.env.ACCOUNT_ID;

const aplicationIds = {
  "costa-live-id": process.env.COSTA_LIVE_ID,
  "costa-live-ph": process.env.COSTA_LIVE_PH,
  "costa-live-my": process.env.COSTA_LIVE_MY,
  "costa-live-sg": process.env.COSTA_LIVE_SG,
  "costa-live-hk": process.env.COSTA_LIVE_HK,
  "costa-live-tw": process.env.COSTA_LIVE_TW,

  "solr-live-id": process.env.SOLR_LIVE_ID,
  "solr-live-ph": process.env.SOLR_LIVE_PH,
  "solr-live-my": process.env.SOLR_LIVE_MY,
  "solr-live-sg": process.env.SOLR_LIVE_SG,
  "solr-live-hk": process.env.SOLR_LIVE_HK,
  "solr-live-tw": process.env.SOLR_LIVE_TW,
};

const timeRanges = [
  ["10 Nov 2020 21:00:00 GMT+0800", "11 Nov 2020 03:00:00 GMT+0800"],
];

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
  const webSocketDebuggerUrl = await getWsDebuggerUrl();

  for (let applicationName of Object.keys(aplicationIds)) {
    for (let timeRange of timeRanges) {
      const [start, end] = timeRange;

      await run({
        webSocketDebuggerUrl,
        accountId,
        applicationId: aplicationIds[applicationName],
        applicationName,
        start,
        end,
      }).catch((e) => {
        console.log(e)
      });
    }
  }
})();
