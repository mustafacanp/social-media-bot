const puppeteer = require("puppeteer");

// Timeout limit for the page.waitForSelector function
// See on log as 'Find Data'
const TIMEOUT = 5000;

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("Error");
  process.exit(1);
}

const inputUrl = args[0];
// const inputUrl = "https://twitter.com/elonmusk/status/1294917318405836802"; // We must pass The Great Filter
// const inputUrl = "https://www.facebook.com/TheElonmusk/posts/3692368240776048"; // One hundred years of American Innovation.

const querySelectors = {
  facebook: {
    selector: "[data-testid='post_message']",
  },
  twitter: {
    selector: "[data-testid='tweet'] div:nth-child(3) span",
  },
};

const getApplication = (url) => {
  if (url.includes("facebook.com")) {
    return "facebook";
  } else if (url.includes("twitter.com")) {
    return "twitter";
  } else {
    return null;
  }
};

const getPostContent = async () => {
  const app = querySelectors[getApplication(inputUrl)];
  if (!app) {
    return false;
  }

  const startTime1 = new Date();
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(inputUrl);
  logTiming(startTime1, "Open Page");

  try {
    const element = await page.waitForSelector(app.selector, {
      timeout: TIMEOUT,
    });
    const text = await (await element.getProperty("textContent")).jsonValue();
    return text;
  } catch (e) {
    if (e instanceof puppeteer.errors.TimeoutError) {
      return false;
    }
  }

  await browser.close();
};

(async () => {
  const startTime = new Date();
  const text = await getPostContent();
  logTiming(startTime);

  text ? console.log(`Post Content: ${text}`) : console.log("Not found...");
  process.exit(1);
})();

function logTiming(startTime, message = "Total Time") {
  endTime = new Date();
  const timeDiff = endTime - startTime;
  const seconds = Math.round(timeDiff);
  console.log(`${message}: ${seconds} ms`);
}
