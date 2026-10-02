const mongoose = require('mongoose');

const connectDB = async (retries = 5, delay = 3000) => {
  for (let i = 1; i <= retries; i++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${i}/${retries} failed: ${error.message}`);
      if (i < retries) {
        console.log(`Retrying in ${delay / 1000}s...`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        console.error('CRITICAL: Could not connect to MongoDB. Please ensure MongoDB is running (port 27017).');
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;