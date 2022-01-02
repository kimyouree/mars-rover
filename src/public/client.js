let store = {
  user: { name: "Student" },
  apod: "",
  rovers: ["Curiosity", "Opportunity", "Spirit"],
  rovers_info: null,
  current_rover: null,
  current_image: null,
};

// add our markup to the page
const root = document.getElementById("root");

const updateStore = (store, newState) => {
  // newState = { apod: {...}}
  store = Object.assign(store, newState);
  render(root, store);
};

const render = async (root, state) => {
  root.innerHTML = App(state);
};

// create content
const App = (state) => {
  let { rovers, apod, rovers_info } = state;

  return `
        <header></header>
        <main>
        <section class="section">
          ${Greeting(store.user.name)}
          <h2 class="bold subtitle has-background-link-dark">Gallery</h2>
          
          <div class="tabs is-centered is-large">
            <ul>
              <li>Rovers</li>
              <li class="is-active"><a>Curiosity</a></li>
              <li><a>Opportunity</a></li>
              <li><a>Spirit</a></li>
            </ul>
          </div>
          ${manifestGallery(rovers_info)}
        </section>
          <section class="section">
            <h3 class="subtitle has-background-link-dark">Put things on the page!</h3>
            <p>Here is an example section.</p>
            <p>
                One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                but generally help with discoverability of relevant imagery.
            </p>
            ${ImageOfTheDay(apod)}
          </section>
        </main>
        <footer></footer>
    `;
};

// listening for load event because page should load before any JS is called
window.addEventListener("load", () => {
  render(root, store);
});

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
  if (name) {
    return `
            <h1 class="title">Welcome, ${name}!</h1>
        `;
  }

  return `
        <h1 class="title">Hello!</h1>
    `;
};

// *** Example of a pure function that renders infomation requested from the backend
// *** TRANSIENT BUG: apod.date is `undefined` sometimes - why?
const ImageOfTheDay = (apod) => {
  const today = new Date();
  const photodate = new Date(apod.date);
  // console.log(photodate.getDate(), today.getDate());

  // console.log(photodate.getDate() === today.getDate());
  if (!apod || apod.date === today.getDate()) {
    getImageOfTheDay(store);
  }

  // check if the photo of the day is actually type video!
  if (apod.media_type === "video") {
    return `
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `;
  } else {
    return `
            <img src="${apod.url}" height="350px" width="100%" />
            <p>${apod.explanation}</p>
        `;
  }
};

// *** NEXT: why is this taking so long?
const manifestGallery = (rovers_info) => {
  if (!rovers_info) {
    getManifests(store);
    return `<section class="section">Loading latest images...</section>`;
  } else {
    console.log(rovers_info, " === client rovers_info");
    // *** NEXT: hook up panel buttons to gallery images
    // *** need to figure out a way to separate
    const {
      curiosity: { curiosity_images },
      opportunity: { opportunity_images },
      spirit: { spirit_images },
    } = rovers_info;

    let truncated_images = [
      curiosity_images,
      opportunity_images,
      spirit_images,
    ].map((rover) => config_rover_images(rover));
    console.log(truncated_images, " ==== all_photos");

    let photos = truncated_images
      .map((rover_images) =>
        rover_images
      .map(
            (photo) => `
        <div class="card">
          <div class="card-image">
            <figure class="image is-4by3">
              <img src="${photo.img_src}" alt="Placeholder image" />
            </figure>
          </div>
        </div>`
          )
          .join("")
      )
      .join("");
    return photos;
  }
};

// ------------------------------------------------------  HELPER FUNCTIONS

// This caps the total photos per rover at 3 photos
// this is to handle the inconsistent number of phots per rover.
const config_rover_images = (rover_images) => {
  return rover_images.slice(-3);
};

// ------------------------------------------------------  API CALLS

// Apod API call
const getImageOfTheDay = (state) => {
  let { apod } = state;

  fetch(`http://localhost:3000/apod`)
    .then((res) => res.json())
    .then((apod) => {
      return updateStore(store, { apod: apod.image });
    });

  // return data;
};

// Photo gallery API call
const getManifests = (state) => {
  let { rovers_info } = state;

  fetch(`http://localhost:3000/photos`)
    .then((res) => res.json())
    .then((rovers_info) => {
      return updateStore(store, { rovers_info: rovers_info });
    });
};

// *** 1. PROBLEM SOLVED: `Unexpected comma using map()`
// template literals use the `toString()` method which
// by default joins the returned array (by map) with
// a `,`. To avoid this problem, you can use `join("")`

// *** FUTURE IMPROVEMENTS:
// separate functions into modules? or just the App to make it less scroll-y
// refactor to make functions pure
