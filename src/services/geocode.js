//Example request: GET https://api.zippopotam.us/us/12345

/**
 * Converts a US zip code into geographic coordinates.
 * @param {string} zipCode - A 5-digit US zip code
 * @returns {Promise<{ lat: number, lon: number }>}
 * @throws {Error} if the zip code is not found or the request fails
 */
async function getCoordinates(zipCode) {
  //Zip code should go here
  const url = `https://api.zippopotam.us/us/${zipCode}`;

  const response = await fetch(url);

  if (response.status === 404) {
    throw new Error(`Zip code '${zipCode}' not found`);
  }
  if (!response.ok) {
    throw new Error(`Geocoding request failed with status ${response.status}`);
  }

  const data = await response.json();

  return {
    lat: parseFloat(data.places[0].latitude),
    lon: parseFloat(data.places[0].longitude),
  };
}

module.exports = { getCoordinates };
