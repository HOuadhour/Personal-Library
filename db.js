const { MongoClient } = require("mongodb");
require("dotenv").config();

const DB = process.env.MONGO_URI;

module.exports = (async function () {
  return await MongoClient.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 50,
  });
})();
