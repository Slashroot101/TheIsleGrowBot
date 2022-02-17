const { Sequelize, Model, DataTypes } = require('sequelize');
const { dbConnection } = require('../database');

class DinoVault extends Model {
    static associate(models) {

    }
}

DinoVault.init(
    {
        dinoDisplayName: {
            type: DataTypes.STRING,
        },
        savedName: {
            type: DataTypes.STRING,
        },
        savedLocation: {
            type: DataTypes.STRING,
        },
        dinoJson: {
            type: DataTypes.STRING,
        },
    },
    {
        paranoid: true,
        sequelize: dbConnection,
        modelName: 'DinoVault',
    }
);

module.exports = DinoVault;