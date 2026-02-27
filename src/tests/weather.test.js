// AI Reference: GitHub Copilot (Claude Sonnet 4.6) used for scaffolding

// Tests for the weather service (src/services/weather.js).
// global.fetch is mocked so no real HTTP requests are made.

const { getTemperature } = require('../services/weather');

describe('getTemperature', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns the temperature for Fahrenheit', async () => {
    // Scenario: Standard happy-path request in Fahrenheit.
    // Verifies the value from current_weather.temperature is returned correctly.
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        current_weather: { temperature: 43.2 },
      }),
    });

    const result = await getTemperature(37.23, -80.41, 'Fahrenheit');

    expect(result).toBe(43.2);
  });

  it('returns the temperature for Celsius', async () => {
    // Scenario: User requests Celsius — verifies the scale is passed through
    // correctly and the returned value is the one from the API.
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        current_weather: { temperature: 25.0 },
      }),
    });

    const result = await getTemperature(34.09, -118.41, 'Celsius');

    expect(result).toBe(25.0);
  });

  it('calls Open-Meteo with the correct URL including lowercase temperature_unit', async () => {
    // Scenario: Open-Meteo only accepts lowercase unit strings ("fahrenheit" / "celsius").
    // This test confirms the service lowercases the scale before building the URL.
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ current_weather: { temperature: 63 } }),
    });

    await getTemperature(41.85, -87.65, 'Fahrenheit');

    const calledUrl = global.fetch.mock.calls[0][0];
    expect(calledUrl).toContain('temperature_unit=fahrenheit');
    expect(calledUrl).toContain('latitude=41.85');
    expect(calledUrl).toContain('longitude=-87.65');
    expect(calledUrl).toContain('current_weather=true');
  });

  it('throws an error when the weather API returns a non-ok response', async () => {
    // Scenario: Open-Meteo returns a 500 server error.
    // The service should throw so the route can return a 500 to the client.
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(getTemperature(37.23, -80.41, 'Fahrenheit')).rejects.toThrow(
      'Weather request failed with status 500'
    );
  });

  it('throws when fetch itself rejects (network failure)', async () => {
    // Scenario: No internet connection — fetch never resolves.
    // Ensures the error propagates up correctly to the route handler.
    global.fetch = jest.fn().mockRejectedValue(new Error('Network failure'));

    await expect(getTemperature(37.23, -80.41, 'Fahrenheit')).rejects.toThrow(
      'Network failure'
    );
  });
});
