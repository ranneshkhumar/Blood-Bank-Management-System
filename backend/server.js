const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const bloodRoutes = require("./routes/bloodRoutes");
app.use("/api/blood", bloodRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() =>{
     console.log('✅ MongoDB Connected');
     console.log('📂 Connected to DB:', mongoose.connection.name);
  }
  
)
  .catch((err) => console.log('❌ MongoDB Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use("/api/donor", require("./routes/donorRoutes"));
app.use("/api/request", require("./routes/requestRoutes"));
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});