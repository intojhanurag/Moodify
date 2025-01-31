const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
console.log(sequelize);  // This should log the Sequelize instance


// Define Visit Model
const Visit = sequelize.define('Visit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
});

module.exports = Visit;
