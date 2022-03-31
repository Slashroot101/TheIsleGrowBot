const { Sequelize, Model, DataTypes } = require('sequelize');
const { dbConnection } = require('../database');

class Donation extends Model {
  static associate(models) {
    models.Donation.belongsTo(models.User);
  }
}

Donation.init(
  {
    fossilsGranted: {
      type: DataTypes.INTEGER,
    },
    donationAmount: {
      type: DataTypes.INTEGER,
    },
    paymentLinkId: {
      type: DataTypes.STRING,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
    }
  },
  {
    paranoid: true,
    sequelize: dbConnection,
    modelName: 'Donation',
  },
);

module.exports = Donation;