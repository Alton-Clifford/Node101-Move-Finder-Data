const express = require("express");

const app = express();

const axios = require("axios").default;
const morgan = require("morgan");

//apply middleware
app.use(morgan("dev"));

//Homepage
app.get("/", async (req, res) => {
  // If no OMDB query params, show homepage
  if (!req.query.i && !req.query.t) {
    return res.send(`
      <h1>Welcome to the Movie Finder API</h1>
      <p>To search for a movie, affix the following query parameters to the URL:</p>
      <ul>
      <li><code>?i=IMDB_ID</code> &mdash; Search by IMDB ID (e.g. <code>?i=tt3896198</code>)</li>
      <p>OR</p>
      <li><code>?t=TITLE</code> &mdash; Search by movie title (e.g. <code>?t=baby%20driver</code>)</li>
      </ul>
      <p>Example (click me): <a href="/?t=Inception">/?t=Inception</a></p>
      `);
  }

  //Create cache
  let cache = {};
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const now = Date.now();

  function getCacheKey(query) {
    // Use the full query string as the cache key
    return JSON.stringify(query);
  }

  const cacheKey = getCacheKey(req.query);

  // Check cache
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < ONE_DAY) {
    return res.json(cache[cacheKey].data);
  }

  // Build OMDB API request
  try {
    const params = { ...req.query, apikey: "KEY_HERE" };
    const omdbRes = await axios.get("http://www.omdbapi.com/", { params });

    // Cache the response
    cache[cacheKey] = {
      data: omdbRes.data,
      timestamp: now,
    };

    res.json(omdbRes.data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch from OMDB" });
  }
});

module.exports = app;
