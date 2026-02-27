const express = require('express');
const locationsRouter = require('./routes/locations');

const app = express();

app.use('/locations', locationsRouter);

if (require.main === module) {
  app.listen(8080, () => {
    console.log(`Weather API running at http://localhost:8080`);
  });
}

module.exports = app;
