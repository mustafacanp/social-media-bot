const puppeteer = require('puppeteer');

// Timeout limit for the page.waitForSelector function
// See on log as 'Find Data'
const TIMEOUT = 5000;

// We will get this input from the user
// Test URL: "https://twitter.com/elonmusk/status/1294917318405836802", Expected Output: "Post Content: We must pass The Great Filter"
// Test URL: "https://www.facebook.com/TheElonmusk/posts/3692368240776048", Expected Output: "One hundred years of American Innovation."
const input = "https://www.facebook.com/TheElonmusk/posts/3692368240776048";

const websites = {
    facebook: {
        selector: "[data-testid='post_message']"
    },
    twitter: {
        selector: "[data-testid='tweet'] ~ div div:first-child div:first-child"
    }
};

const getWebsite = url => {
    if (url.includes("facebook.com")) {
        return "facebook";
    } else if (url.includes("twitter.com")) {
        return "twitter";
    } else {
        return null;
    }
}

const getPostContent = async () => {
    const website = websites[getWebsite(input)];
    if(!website) {
        return false;
    }

    const startTime1 = new Date();
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(input);
    end(startTime1, "Open Page");

    try {
        const startTime2 = new Date();
        const element = await page.waitForSelector(website.selector, {timeout: TIMEOUT});
        end(startTime2, "Find Data");
        const text = await (await element.getProperty('textContent')).jsonValue();
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
    end(startTime);

    text ? 
        console.log(`Post Content: ${text}`) :
        console.log("Not found...");
})();


function end(startTime, message="Total Time") {
    endTime = new Date();
    const timeDiff = endTime - startTime;
    const seconds = Math.round(timeDiff);
    console.log(`${message}: ${seconds} ms`);
}
