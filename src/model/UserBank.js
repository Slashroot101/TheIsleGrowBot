const { Sequelize, Model, DataTypes } = require('sequelize');
const { dbConnection } = require("../database");

class UserBank extends Model {
    static assosciate(models){
        models.UserBank.belongsTo(models.User)
    }
}

UserBank.init(
    {
        balance: {
            type: DataTypes.INTEGER,
        },
    }, 
    {
        paranoid: true,
        sequelize: dbConnection,
        modelName: "UserBank",
    }
);


module.exports = UserBank;
