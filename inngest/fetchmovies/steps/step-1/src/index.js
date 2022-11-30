const fetchMovies = require('./fetchMovies');

// Events format info: https://www.inngest.com/docs/event-format-and-structure
async function run({ event }) {
  // Your logic goes here.
  return fetchMovies()
    .then((status) => ({
      status: 200,
      body: `${status}`,
    }))
    .catch((status) => ({
      status: 500,
      body: `${status}`,
    }));
}

module.exports = { run };
