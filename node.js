const express = require("express");
const puppeteer = require("puppeteer");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static("public"));

app.get("/screenshot", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    await page.goto("https://fortnitetracker.com/leaderboards", {
      waitUntil: "networkidle2"
    });

    // Wait for leaderboard table
    await page.waitForSelector("table");

    const screenshotPath = path.join(__dirname, "leaderboard.png");

    // Option 1: Full page
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });

    // Option 2 (better): Only leaderboard
    /*
    const table = await page.$("table");
    await table.screenshot({ path: screenshotPath });
    */

    await browser.close();

    res.sendFile(screenshotPath);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error taking screenshot");
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
