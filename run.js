const puppeteer = require("puppeteer-core");
const fs = require("fs");

const ARTIFACTS_DIR = "artifacts";

const ALL_SLASHES = /\//g;

const UNTIL_NETWORK_IDLE = { waitUntil: "networkidle0", timeout: 30000 };

const waitingTime = parseInt(process.env.FIXED_WAITING_TIME);

const makeGenScreenshotPath = ({ applicationName, start, end }) => {
  if (!fs.existsSync(ARTIFACTS_DIR)) {
    fs.mkdirSync(ARTIFACTS_DIR);
  }

  const dir = ARTIFACTS_DIR + "/" + start + " > " + end;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const subDir = dir + "/" + applicationName + "/";
  if (!fs.existsSync(subDir)) {
    fs.mkdirSync(subDir);
  }

  return (name) => ({
    path: subDir + name.replace(ALL_SLASHES, ".") + ".png",
    fullPage: true,
  });
};

const makeGenNewRelicPage = (accountId, applicationId, start, end) => (
  page = ""
) =>
  `https://rpm.newrelic.com/accounts/${accountId}/applications/${applicationId}${page}?tw%5Bend%5D=${end}&tw%5Bstart%5D=${start}`;

const toTimestamp = (dateStr) => Math.floor(new Date(dateStr) / 1000);

const takeScreenshotIfExist = async (page, genScreenshotPath, text) => {
  const links = await page.$x(`//a/*[contains(text(), '${text}')]/..`);

  if (!links.length) {
    return;
  }

  await Promise.all([
    links[0].click(),
    page.waitForNavigation(UNTIL_NETWORK_IDLE),
  ]);

  await page.waitForTimeout(waitingTime);

  console.warn(`Taking a screenshot of page: ${text}`);
  return await page.screenshot(genScreenshotPath(text));
};

const run = async ({
  webSocketDebuggerUrl,
  accountId,
  applicationId,
  applicationName,
  start,
  end,
}) => {
  const genRelicPage = makeGenNewRelicPage(
    accountId,
    applicationId,
    toTimestamp(start),
    toTimestamp(end)
  );
  const genScreenshotPath = makeGenScreenshotPath({
    applicationName,
    start,
    end,
  });
  const overviewPage = genRelicPage();

  console.warn(
    `Visiting NR accountId = ${accountId}, applicationId = ${applicationId} (${applicationName}), start = ${start}, end = ${end}`
  );
  console.warn(overviewPage);

  let browser;
  try {
    browser = await puppeteer.connect({
      /**
       * Start your Chrome in debugging mode, and get ws endpoint
       * "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary" --remote-debugging-port=9222
       */
      browserWSEndpoint: webSocketDebuggerUrl,
      defaultViewport: {
        width: parseInt(process.env.VIEW_PORT_WIDTH),
        height: parseInt(process.env.VIEW_PORT_HEIGHT),
      },
    });
  } catch (error) {
    console.warn(`Can't connect to your browser: ${error.message}`);
    process.exit(1);
  }

  const pages = await browser.pages();

  if (!pages.length) {
    throw new Error("You need to open your New Relic transaction page");
  }

  const page = pages[0];

  /**
   * Go to the Overview page, wait some time and take the picture of the page
   */
  await page.goto(overviewPage);
  await page.waitForTimeout(waitingTime);
  await page.screenshot(genScreenshotPath("Summary"));

  await takeScreenshotIfExist(page, genScreenshotPath, "Go runtime");
  await takeScreenshotIfExist(page, genScreenshotPath, "Solr caches");
  await takeScreenshotIfExist(page, genScreenshotPath, "Solr updates");
  await takeScreenshotIfExist(page, genScreenshotPath, "JVMs");
  await takeScreenshotIfExist(page, genScreenshotPath, "Errors");

  await takeScreenshotIfExist(page, genScreenshotPath, "Transactions");

  const transactionCount = await page.$$('[class$="bar-item"]');

  for (let index = 0; index < transactionCount.length; ++index) {
    const transaction = transactionCount[index];
    console.warn(`Clicking transaction ${index}`);

    await Promise.all([
      transaction.click(),
      page.waitForNavigation(UNTIL_NETWORK_IDLE),
    ]);

    const transactionName = await page.$eval(
      ".TransactionDetailedDrilldown-header-title",
      (element) => {
        return element.textContent.replace(/^\s+|\s+$/g, "");
      }
    );

    await page.waitForTimeout(1000);
    console.warn(`> Taking a screenshot of ${transactionName}`);
    await page.screenshot(genScreenshotPath("transactions" + transactionName));
  }

  browser.disconnect();
};

module.exports = run;
