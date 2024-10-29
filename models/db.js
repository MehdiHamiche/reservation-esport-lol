/*const config = require("../config");
const mongoose = require("mongoose");

// Récupérer l'URL de connexion à MongoDB en fonction de l'environnement
const url = config.mongoURL[process.env.NODE_ENV || "local"];

// Options de connexion à MongoDB
const options = {};

// Connexion à MongoDB
mongoose.connect(url, options);

// Événements de connexion MongoDB
mongoose.connection.on("connecting", () => {
    console.log("Connecting to MongoDB...");
});

mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error);
});

mongoose.connection.on("disconnected", () => {
    console.log("Disconnected from MongoDB.");
});

mongoose.connection.on("reconnected", () => {
    console.log("Reconnected to MongoDB.");
});

mongoose.connection.on("connected", () => {
    console.log("Connected to MongoDB.");
});

// Exporter la connexion à la base de données
module.exports = mongoose.connection;*/