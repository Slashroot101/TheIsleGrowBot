const { Sequelize, Model, DataTypes } = require('sequelize');
const {dbConnection} = require('../database');

class User extends Model {
    static associate(models){    
    }
}

User.init(
    {
        discordId: {
            type: DataTypes.STRING,
            unique: true,
        },
        steamId: {
            type: DataTypes.STRING,
            unique: true,
        },
    },
    {
        paranoid: true,
        sequelize: dbConnection,
        modelName: "User"
    },
);


module.exports = User;