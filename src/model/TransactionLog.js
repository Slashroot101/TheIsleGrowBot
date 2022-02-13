const { Sequelize, Model, DataTypes } = require('sequelize');
const { dbConnection } = require('../database');

class TransactionLog extends Model {
    static associate(models){

    }
}

exports.transactionTypeEnum = {
    normalGrow: 'Grow',
    apexGrow: 'ApexGrow',
    conversion: 'Conversion',
    balanceTransfer: 'Transfer',
};

TransactionLog.init(
    {
        transactionType: {
            type: DataTypes.ENUM(this.transactionTypeEnum.normalGrow, this.transactionTypeEnum.apexGrow, this.transactionTypeEnum.conversion),
        },
        spent: {
            type: DataTypes.INTEGER,
        },
    },
    {
		paranoid: true,
		sequelize: dbConnection,
		modelName: 'TransactionLog',
	},
);

module.exports = TransactionLog;