const fetchMovies = require('./fetchMovies');

// Events format info: https://www.inngest.com/docs/event-format-and-structure
async function run({ event }) {
  // Your logic goes here.
  return fetchMovies()
    .then((_) => ({
      status: 200,
      body: `Received "${event.name}" event`,
    }))
    .catch((er) => ({
      status: 500,
      body: `Received "${event.name}" event. Error: ${er}}`,
    }));
}

module.exports = { run };
