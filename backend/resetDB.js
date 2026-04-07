const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Drop the users collection
    await mongoose.connection.collection('users').drop();
    console.log('✅ Users collection dropped!');
    
    mongoose.disconnect();
  })
  .catch((err) => {
    console.log('Error:', err.message);
    mongoose.disconnect();
  });