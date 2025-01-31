const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

// Load environment variables from .env file


// Initialize Sequelize with the database connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',  // Change this depending on your database
  logging: false,       // Disable logging for cleaner output
});

console.log("✅ Loading .env file...");
console.log("📌 DATABASE_URL:", process.env.DATABASE_URL || "❌ Not Found!");

console.log(sequelize);  // This should log the Sequelize instance


const Song = require('../models/song');
const Visit = require('../models/visit');


const connectDb = async () => {
  try {
    await sequelize.authenticate(); // Test connection
    console.log('Database connected successfully!');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

const syncDb = async () => {
  try {
    await sequelize.sync(); 
    console.log("✅ Database synced!");
  } catch (error) {
    console.error("❌ Error syncing database:", error);
  }
};

connectDb();
syncDb();
// Export the sequelize instance for models to use
module.exports = { sequelize,Song,Visit, connectDb };