const dotenv = require("dotenv");

dotenv.config({ path: `${process.cwd()}/.${process.env.NODE_ENV.replace(" ", '')}.env`});

module.exports = {
    dbName: process.env.DB_NAME,
    dbUsername: process.env.DB_USERNAME,
    dbPassword: process.env.DB_PASSWORD,
    dbHost: process.env.DB_HOST,
};