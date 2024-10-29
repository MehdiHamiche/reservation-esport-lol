const mongoose = require('mongoose');


// Exit application on error
mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
  process.exit(-1);
});

// print mongoose logs in dev env
mongoose.set('debug', true);


/**
 * Connect to mongo db
 *
 * @returns {object} Mongoose connection
 * @public
 */
exports.connect = () => {
  mongoose.connect(
    process.env.MONGO_URI
  ).then(()=>{
    console.log("Database sucessfully connected !");
}).catch(err=>console.warn(err));
  return mongoose.connection;
};







/*const config = {};

config.https = {
    keypath: "...",
    cerfPath: "...",
};

config.cors = {
    local: "mongoDB://localhost:27017/riot-db",
    prod: "",
};

config.rateLimit = {
    local: {
        max: 100, // Nombre maximal de requêtes par intervalle
        windowMs: 60 * 60 * 1000, // Intervalle en millisecondes (ici, 1 heure)
    },
    prod: {
        // Configurations de limitation des taux pour la production
    },
};

config.mongoURL = {
    local: "mongoDB://localhost:27017/riot-db",
    prod: "",
};

module.exports = config;*/