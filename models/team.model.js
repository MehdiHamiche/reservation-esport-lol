const mongoose = require('mongoose');
const { Schema } = mongoose

const teamSchema = new Schema({
    team_name: {
        type: String
    },
    user_ids: [{
        type: String
    }],
    tournament_id: {
        type: String,
        ref: 'Tournaments'
    }
}, {
    timestamps: true
});

const Team = mongoose.model('Teams', teamSchema);

module.exports = Team;
