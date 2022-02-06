const { Sequelize, Model, DataTypes } = require('sequelize');
const {dbConnection} = require('../database');

class GrowDinoRequest extends Model {
    static associate(models){

    }
}

GrowDinoRequest.init(
    {
        growStatus: {
            type: DataTypes.ENUM,
            defaultValue: '',
        }
    }, 
    {
        paranoid: true,
        sequelize: dbConnection,
        modelName: "DinoGrowRequest",
    }
);

module.exports = GrowDinoRequest;