// Example request:
//   GET https://api.open-meteo.com/v1/forecast
//         ?latitude=37.2296
//         &longitude=-80.4139
//         &current_weather=true
//         &temperature_unit=fahrenheit

/**
 * Fetches the current temperature for given coordinates.
 * @param {number} latt - lattitude
 * @param {number} long - longitude
 * @param {string} unit - Unit of mesurement "Fahrenheit" or "Celsius"
 * @returns {Promise<number>} - The current temperature
 * @throws {Error} if the weather request fails
 */
async function getTemperature(latt, long, unit) {
  // Open-Meteo expects lowercase unit strings: "fahrenheit" or "celsius"
  const temperatureUnit = unit.toLowerCase();

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latt}&longitude=${long}` +
    `&current_weather=true` +
    `&temperature_unit=${temperatureUnit}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Weather request failed with status ${response.status}`);
  }

  const data = await response.json();

  return data.current_weather.temperature;
}

module.exports = { getTemperature };
