/*// Définition du schéma RiotData sans dépendance à Mongoose
const riotSchema = {
    summonerName: {
        type: String,
        required: true
    },
    region: {
        type: String,
        required: true
    },
    rank: {
        type: String
    },
    mmr: {
        type: Number // Champ pour stocker le MMR du joueur
    },
    champions: [{ type: String }],
    positions: [{ type: String }]
};

// Export du schéma RiotData
module.exports = riotSchema;*/