import express from "express";
import fetch from "node-fetch";
import cheerio from "cheerio";

const app = express();

app.get("/leaderboard", async (req, res) => {
  const url = "https://showdown.fortnite.com/en-US/creator-leaderboard";

  const response = await fetch(url);
  const html = await response.text();

  const $ = cheerio.load(html);

  const leaderboard = [];

  $(".leaderboard-row").each((i, el) => {
    const rank = parseInt($(el).find(".rank").text());
    const points = parseInt($(el).find(".points").text());

    leaderboard.push({ rank, points });
  });

  res.json(leaderboard);
});

app.listen(3000, () => console.log("Server running on port 3000"));