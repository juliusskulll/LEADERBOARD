const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from 'public'
app.use(express.static('public'));

// Ensure screenshots folder exists
const screenshotDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir);

// Endpoint to take screenshot
app.get('/screenshot/:username', async (req, res) => {
  const username = req.params.username;

  try {
    const url = `https://fortnitetracker.com/profile/all/${encodeURIComponent(username)}`;
    const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: 'networkidle2' });

    const screenshotPath = path.join(screenshotDir, `${username}.png`);
    await page.screenshot({ path: screenshotPath });
    await browser.close();

    res.sendFile(screenshotPath);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error taking screenshot');
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
