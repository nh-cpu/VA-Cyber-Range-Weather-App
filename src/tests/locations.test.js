// AI Reference: GitHub Copilot (Claude Sonnet 4.6) used for scaffolding

// Uses supertest to make HTTP requests against the Express app without
// needing the server to actually be listening on a port.

const request = require('supertest');
const app = require('../../index');

jest.mock('../services/geocode');
jest.mock('../services/weather');

const { getCoordinates } = require('../services/geocode');
const { getTemperature } = require('../services/weather');

describe('GET /locations/:zipCode', () => {
  // Clear mock call history and return values between tests
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns temperature in Fahrenheit by default', async () => {
    // Scenario: A user hits /locations/24060 with no scale query param.
    // Fahrenheit should be used as the default and returned in the response body.
    getCoordinates.mockResolvedValue({ lat: 37.23, lon: -80.41 });
    getTemperature.mockResolvedValue(43);

    const res = await request(app).get('/locations/24060');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ temperature: 43, scale: 'Fahrenheit' });
    // Confirm the services were called with the right arguments
    expect(getCoordinates).toHaveBeenCalledWith('24060');
    expect(getTemperature).toHaveBeenCalledWith(37.23, -80.41, 'Fahrenheit');
  });

  it('returns temperature in Celsius when ?scale=Celsius', async () => {
    // Scenario: A user explicitly requests Celsius via the query string.
    // The scale should be passed through to getTemperature and reflected in the response.
    getCoordinates.mockResolvedValue({ lat: 34.09, lon: -118.41 });
    getTemperature.mockResolvedValue(25);

    const res = await request(app).get('/locations/90210?scale=Celsius');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ temperature: 25, scale: 'Celsius' });
    expect(getTemperature).toHaveBeenCalledWith(34.09, -118.41, 'Celsius');
  });

  it('returns 400 for an invalid zip code format', async () => {
    // Scenario: A user passes letters instead of digits for the zip code.
    // The route should reject it immediately with a 400 before calling any service.
    const res = await request(app).get('/locations/ABCDE');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    // Services should never be called when input is invalid
    expect(getCoordinates).not.toHaveBeenCalled();
  });

  it('returns 400 for an unrecognized scale value', async () => {
    // Scenario: A user passes an unsupported scale (e.g. 'Kelvin').
    // Only 'Fahrenheit' and 'Celsius' are valid — anything else should return 400.
    const res = await request(app).get('/locations/24060?scale=Kelvin');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(getCoordinates).not.toHaveBeenCalled();
  });

  it('returns 404 when the zip code is not found', async () => {
    // Scenario: The zip code is valid in format but doesn't exist in Zippopotam's database.
    // The geocode service throws a 'not found' error which should map to a 404 response.
    getCoordinates.mockRejectedValue(new Error("Zip code '00000' not found"));

    const res = await request(app).get('/locations/00000');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 500 on an unexpected service error', async () => {
    // Scenario: An unexpected error occurs in a service (e.g. network timeout, API down).
    // Any error that isn't 'not found' should return a generic 500 to avoid leaking internals.
    getCoordinates.mockRejectedValue(new Error('Network failure'));

    const res = await request(app).get('/locations/24060');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to retrieve weather data.' });
  });
});
