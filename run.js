const puppeteer = require("puppeteer-core");
const fs = require("fs");

const configs = require("./config.json");
const selectors = configs.selectors;

const ARTIFACTS_DIR = "artifacts";

const ALL_SLASHES = /\//g;

const UNTIL_NETWORK_IDLE = { waitUntil: "networkidle0", timeout: 30000 };

const waitingTime = parseInt(process.env.FIXED_WAITING_TIME);
const limitedTransactionItems = process.env.TRANSACTION_LIMITED_ITEMS;

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
  const linkSelector = selectors.page.replace("${page}", text);
  const links = await page.$x(linkSelector);

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
  pages,
  isFirstRun
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

  const browserPages = await browser.pages();

  if (!browserPages.length) {
    throw new Error("You need to open your New Relic transaction page");
  }

  const browserPage = browserPages[0];

  /**
   * Go to the Overview page, wait some time and take the picture of the page\
   * Default will take Summary and Transactions pages
   */
  await browserPage.goto(overviewPage);
  
  /**
   * On first run wait extra time for newrelic to render
   */
  if (isFirstRun) {
    await browserPage.waitForTimeout(waitingTime);  
  }
  await browserPage.waitForTimeout(waitingTime);
  
  await browserPage.screenshot(genScreenshotPath("Summary"));
    
  // Take screenshot for other pages
  for (let index = 0; index < pages.length; index++) {
    await takeScreenshotIfExist(browserPage, genScreenshotPath, pages[index]);
  }

  await takeScreenshotIfExist(browserPage, genScreenshotPath, "Transactions");
  const transactionCount = await browserPage.$$(selectors.transactionItem);

  for (
    let index = 0;
    index < transactionCount.length && index < limitedTransactionItems;
    ++index
  ) {
    const transaction = transactionCount[index];
    console.warn(`Clicking transaction ${index}`);

    await Promise.all([
      transaction.click(),
      browserPage.waitForNavigation(UNTIL_NETWORK_IDLE),
    ]);

    const transactionName = await browserPage.$eval(
      selectors.transactionItemTitle,
      (element) => {
        return element.textContent.replace(/^\s+|\s+$/g, "");
      }
    );

    await browserPage.waitForTimeout(1000);
    console.warn(`> Taking a screenshot of ${transactionName}`);
    await browserPage.screenshot(
      genScreenshotPath("transactions" + transactionName)
    );
  }

  browser.disconnect();
};

module.exports = run;
