// AI Reference: GitHub Copilot (Claude Sonnet 4.6) used for scaffolding

// Tests for the geocode service (src/services/geocode.js).
// global.fetch is mocked so no real HTTP requests are made.

const { getCoordinates } = require('../services/geocode');

describe('getCoordinates', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns lat and lon as numbers for a valid zip code', async () => {
    // Scenario: Zippopotam.us responds with a valid place containing
    // latitude and longitude as strings (which is how the API returns them).
    // We verify they are parsed into numbers before being returned.
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        'post code': '24060',
        places: [{ latitude: '37.2296', longitude: '-80.4139' }],
      }),
    });

    const result = await getCoordinates('24060');

    expect(result).toEqual({ lat: 37.2296, lon: -80.4139 });
    expect(typeof result.lat).toBe('number');
    expect(typeof result.lon).toBe('number');
  });

  it('calls the correct Zippopotam.us URL for the given zip code', async () => {
    // Scenario: Confirm the service builds the URL with the zip code correctly
    // so a different zip code doesn't accidentally hit the wrong endpoint.
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        places: [{ latitude: '34.0901', longitude: '-118.4065' }],
      }),
    });

    await getCoordinates('90210');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.zippopotam.us/us/90210'
    );
  });

  it('throws a "not found" error when the API returns 404', async () => {
    // Scenario: The zip code doesn't exist in Zippopotam's database.
    // The error message must contain "not found" so the route can map it to a 404 response.
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    await expect(getCoordinates('00000')).rejects.toThrow(
      "Zip code '00000' not found"
    );
  });

  it('throws a generic error for other non-ok responses', async () => {
    // Scenario: The geocoding API is temporarily unavailable (e.g. 500 server error).
    // A descriptive error is thrown so the route can return a 500 to the client.
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(getCoordinates('24060')).rejects.toThrow(
      'Geocoding request failed with status 500'
    );
  });

  it('throws when fetch itself rejects (network failure)', async () => {
    // Scenario: No internet connection or DNS failure — fetch throws before
    // a response is ever received.
    global.fetch = jest.fn().mockRejectedValue(new Error('Network failure'));

    await expect(getCoordinates('24060')).rejects.toThrow('Network failure');
  });
});
