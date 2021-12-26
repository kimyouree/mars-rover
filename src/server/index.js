require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", express.static(path.join(__dirname, "../public")));

// your API calls
// ** NEXT:
// 1. ON-LOAD: fetch most recent images from each rover
// 2. how can we get the daily photo AND the gallery images in ONE GET request?
// 3. how to query Curiosity, Opportunity, Spirit?
// Curiosity: max_date: "2021-12-16"
// Opportunity: max_date: "2018-06-11"
// Spirit: max_date: "2010-03-21"
app.get("/photos", async (req, res) => {
  try {
    // *** NEXT: clean up reassignment lines:
    // 1. make 2 GET calls:
    //    a. to manifest,
    //    b. most recent photos by max_date
    // 2. find out how to chain fetch calls
    let curiosity_manifest = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/manifests/Curiosity/?api_key=${process.env.API_KEY}`
    ).then((res) => {
      max_date = res.photo_manifest.max_date;
      return max_date.json();
    });
    let opportunity_manifest = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/manifests/Opportunity/?api_key=${process.env.API_KEY}`
    ).then((res) => {
      return res.json();
    });
    let spirit_manifest = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/manifests/Spirit/?api_key=${process.env.API_KEY}`
    ).then((res) => {
      return res.json();
    });

    // manifest = {
    //   curiosity_images: curiosity_images,
    //   opportunity_images: opportunity_images["photo_manifest"],
    //   spirit_images: spirit_images["photo_manifest"],
    // };
    // manifest.curiosity_images.photos = manifest.curiosity_images.photos.slice(
    //   0,
    //   5
    // );
    // manifest.opportunity_images.photos =
    //   manifest.opportunity_images.photos.slice(0, 5);
    // manifest.spirit_images.photos = manifest.spirit_images.photos.slice(0, 5);
    // res.send(manifest);
  } catch (err) {
    console.log("error:", err);
  }
});

app.get("/apod", async (req, res) => {
  try {
    let image = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`
    ).then((res) => res.json());
    res.send({ image });
  } catch (err) {
    console.log("error:", err);
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

// BUGS SQUASHED

// BUG: response was `undefined` bc return keyword was missing
