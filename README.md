# Weather API

A REST API that returns the current temperature for a given US zip code.

## Getting Started

```bash
npm install
npm start
```

The server will be available at `http://localhost:8080`.

## Usage

```
GET /locations/{zip-code}
GET /locations/{zip-code}?scale=Celsius
```

| Parameter | Required | Values | Default |
|---|---|---|---|
| `zip-code` | Yes | 5-digit US zip | — |
| `scale` | No | `Fahrenheit`, `Celsius` | `Fahrenheit` |

**Example:**
```
GET /locations/24060
→ { "temperature": 43, "scale": "Fahrenheit" }

GET /locations/90210?scale=Celsius
→ { "temperature": 25, "scale": "Celsius" }
```

## Running Tests

```bash
npm test                  # run all tests
npm test -- --coverage    # run tests with line coverage report
```

## Design Rationale

### API Selection

I started looking at free APIs that provide temperature/weather data and saw that Open-Meteo was popular. It appeared at the top of Google results for “free weather API.” Other APIs were also free, but they required an API key—meaning an environment file would be needed for others to use the app properly. Since Open-Meteo does not require a key, I could implement it directly without worrying about it not working on someone else’s device due to a missing API key.

A problem arose when using Open-Meteo: it requires longitude and latitude in order to work, but the challenge required a ZIP code as input. So, I decided to use another API to convert the ZIP code into coordinates. That’s how I found Zippopotam.us.

### Architecture Decisions

- `locations.js` is under `routes` since it handles HTTP requests: reading params, validating input, and sending responses.
- `geocode.js` and `weather.js` handle external API calls: building URLs, fetching data, and parsing responses.
  - Notably, this keeps API changes separate. For example, if Open-Meteo changes its API, then only `weather.js` would need to be edited—not the route.
- `geocode.js` and `weather.js` are separate since each file should have its own dedicated behavior. This helps with documentation, independent testing, and making changes to one service with minimal effects on the other.

### Testing Approach

For testing, you should use mocks, since sending live calls is unnecessary. Real temperatures change constantly, so live API calls would make tests unreliable. Also, the API could be down, or you could hit rate limits.

The tests are split into three files, matching the project structure:

- **`geocode.test.js`** — tests `getCoordinates` in isolation: correct URL construction, `lat`/`lon` parsed as numbers, and proper errors thrown for 404 and 500 responses from Zippopotam.us
- **`weather.test.js`** — tests `getTemperature` in isolation: correct URL with lowercase `temperature_unit`, value returned from the API, and errors propagated on failure
- **`locations.test.js`** — tests the full route end-to-end using Supertest with both services mocked: happy paths for Fahrenheit and Celsius, input validation (400s), ZIP not found (404), and unexpected failures (500)

## External Resources

### APIs
- **[Open-Meteo](https://open-meteo.com/)** — free weather API, no key required, returns temperature in Fahrenheit or Celsius natively
- **[Zippopotam.us](https://api.zippopotam.us/)** — free zip code geocoding API, no key required, returns lat/lon for US zip codes

### Libraries
- **[Express](https://expressjs.com/)** — web framework for Node.js
- **[Jest](https://jestjs.io/)** — test runner
- **[Supertest](https://github.com/ladjs/supertest)** — HTTP assertion library for testing Express apps without a live server
- **[Prettier](https://prettier.io/)** — code formatter
- **[ESLint](https://eslint.org/)** — linter

### AI Tools
- **GitHub Copilot (Claude Sonnet 4.6)** — used to scaffold test cases, explain external API documentatio, implement format prettier, and generte README layout. 
