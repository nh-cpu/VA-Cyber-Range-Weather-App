// Route: GET /locations/:zipCode

const express = require('express');
const { getCoordinates } = require('../services/geocode');
const { getTemperature } = require('../services/weather');

const router = express.Router();

const VALID_SCALES = ['Fahrenheit', 'Celsius'];
// Success response (200):
//   { "temperature": 43, "scale": "Fahrenheit" }
//
// Error responses:
//   400 -- invalid zip code format or unrecognized scale value
//   404 -- zip code not found
//   500 -- upstream API failure

router.get('/:zipCode', async (req, res) => {
  const { zipCode } = req.params;

  // Check that Zip code is exactly 5 digits
  if (!/^\d{5}$/.test(zipCode)) {
    return res
      .status(400)
      .json({ error: 'Invalid zip code format. Must be 5 digits.' });
  }

  // Set Fahrenheit as the default scale if not provided
  const scale = req.query.scale ?? 'Fahrenheit';

  if (!VALID_SCALES.includes(scale)) {
    return res
      .status(400)
      .json({ error: "Invalid scale. Use 'Fahrenheit' or 'Celsius'." });
  }

  try {
    const { lat, lon } = await getCoordinates(zipCode);
    const temperature = await getTemperature(lat, lon, scale);

    return res.status(200).json({ temperature, scale });
  } catch (err) {
    if (err.message.includes('not found')) {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Failed to retrieve weather data.' });
  }
});

module.exports = router;
