const mongoose = require('mongoose');
const { roundAllPrices } = require('../utils/roundPrices');
require('dotenv').config({ path: '.env.development' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    return roundAllPrices();
  })
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
