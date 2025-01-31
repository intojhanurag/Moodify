const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');



// Define Song Model
const Song = sequelize.define('Song', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.TEXT,
    unique: true,
    allowNull: false,
  },
  song_data: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

console.log(sequelize);  // This should log the Sequelize instance


module.exports = Song;
