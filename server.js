const express = require("express");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

app.get("/screenshot", async (req, res) => {
  let browser;

  try {
    const url =
      req.query.url || "https://fortnitetracker.com/leaderboards";

    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000
    });

    // wait extra time for JS content
    await new Promise(resolve => setTimeout(resolve, 3000));

    // try to close cookie popup (best effort)
    try {
      const buttons = await page.$$("button");
      for (let btn of buttons) {
        const text = await page.evaluate(el => el.innerText, btn);
        if (text.toLowerCase().includes("accept")) {
          await btn.click();
          break;
        }
      }
    } catch (e) {}

    const fileName = `screenshot-${Date.now()}.png`;
    const screenshotPath = path.join(__dirname, fileName);

    // try to capture leaderboard table
    const table = await page.$("table");

    if (table) {
      await table.screenshot({ path: screenshotPath });
    } else {
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });
    }

    await browser.close();

    // send as download
    res.download(screenshotPath, "leaderboard.png", () => {
      fs.unlinkSync(screenshotPath); // delete after sending
    });

  } catch (err) {
    if (browser) await browser.close();
    console.error(err);
    res.status(500).send("Error taking screenshot");
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
