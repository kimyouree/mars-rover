let store = {
  user: { name: "Student" },
  apod: "",
  rovers: ["Curiosity", "Opportunity", "Spirit"],
  rovers_info: null,
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
            ${Greeting(store.user.name)}
          <div class="tabs is-centered is-large">
            <ul>
              <li>Rovers</li>
              <li class="is-active"><a>Curiosity</a></li>
              <li><a>Opportunity</a></li>
              <li><a>Spirit</a></li>
            </ul>
          </div>
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
            <section>
              ${manifestGallery(rovers_info)}
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
            <h1>Welcome, ${name}!</h1>
        `;
  }

  return `
        <h1>Hello!</h1>
    `;
};

// *** Example of a pure function that renders infomation requested from the backend
// *** TRANSIENT BUG: apod.date is `undefined` sometimes - why?
const ImageOfTheDay = (apod) => {
  const today = new Date();
  const photodate = new Date(apod.date);
  console.log(photodate.getDate(), today.getDate());

  console.log(photodate.getDate() === today.getDate());
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

const manifestGallery = (rovers_info) => {
  if (!rovers_info) {
    getManifests(store);
    console.log(store, " ==== rover_info inside if");
  }

  return `
    <h2>GALLERY</h2>
    <img src="${rovers_info.curiosity.curiosity_images.photos[0].img_src}" />
  `;
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
};

// Manifests API call
const getManifests = (state) => {
  let { rovers_info } = state;

  fetch(`http://localhost:3000/photos`)
    .then((res) => res.json())
    .then((rovers_info) => {
      return updateStore(store, { rovers_info: rovers_info });
    });
};
