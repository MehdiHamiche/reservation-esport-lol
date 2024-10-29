const mongoose = require('mongoose');
const { Schema } = mongoose

const tournamentSchema = new Schema({
    _id: {
        type: String
    },
    name: {
        type: String
    },
    url: {
        type: String
    },
    description: {
        type: String
    },
    tournament_type: {
        type: String
    },
    started_at: {
        type: Schema.Types.Mixed
    },
    completed_at: {
        type: Schema.Types.Mixed
    },
    state: {
        type: String
    },
    full_challonge_url: {
        type: String
    },
    live_image_url: {
        type: String
    },
    participants: {
        type: [{
            type: Object
        }],
        default: []
    },
    require_score_to_win: {
        type: Number,
        default: 5
    }
}, {
    timestamps: true
});

const Tournament = mongoose.model('Tournaments', tournamentSchema);

module.exports = Tournament;