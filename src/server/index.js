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
app.get("/photos", async (req, res) => {
  try {
    // *** FUTURE: is there a cleaner way to do this? seems wordy
    // would this be better in a loop - instead of hardcoding each rover's name per call?
    // maybe a function that takes in the name of the rover, resulting in something like
    // {
    //   curiosity: {
    //     manifest: manifest
    //     photos: photos
    //   },
    //   ...
    // }
    let curiosity_manifest = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/manifests/Curiosity/?api_key=${process.env.API_KEY}`
    )
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        return json["photo_manifest"];
      });
    let curiosity_images = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/Curiosity/photos?earth_date=${curiosity_manifest["max_date"]}&api_key=${process.env.API_KEY}`
    )
      .then((res) => {
        return res.json();
      })
      .then((json) => json["photos"]);

    let opportunity_manifest = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/manifests/Opportunity/?api_key=${process.env.API_KEY}`
    )
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        return json["photo_manifest"];
      });

    let opportunity_images = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/Opportunity/photos?earth_date=${opportunity_manifest["max_date"]}&api_key=${process.env.API_KEY}`
    )
      .then((res) => res.json())
      .then((json) => json["photos"]);

    let spirit_manifest = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/manifests/Spirit/?api_key=${process.env.API_KEY}`
    )
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        return json["photo_manifest"];
      });

    let spirit_images = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/Spirit/photos?earth_date=${spirit_manifest["max_date"]}&api_key=${process.env.API_KEY}`
    )
      .then((res) => res.json())
      .then((json) => json["photos"]);

    rovers_info = {
      curiosity: {
        curiosity_manifest,
        curiosity_images,
      },
      opportunity: {
        opportunity_manifest,
        opportunity_images,
      },
      spirit: {
        spirit_manifest,
        spirit_images,
      },
    };
    res.send(rovers_info);
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
// PROBLEM: making a concise set of GET requests;
//    1. is it a good idea to:
//        put the fetching-logic in a separate function
//        that is then passed the rover names `curiosity`, `opportunity` and `spirit`?
