// Import Challonge services and Tournament model for database operations.
const challongeServices = require('../services/challonge.services');
const Tournament = require('../models/tournament.model');

// The expected structure of the request body for creating tournaments, detailing expected fields.
async function createTournament(req, res) {
    try {
        // Extracts tournament details from the request body.
        const tournamentDetails = req.body;
        // Creates a tournament using the Challonge API and assigns a new state based on the response.
        const { tournament } = await challongeServices.createTournament(tournamentDetails);
        tournament.state = tournament.state == 'pending' ? 'to_be_started' : 'ongoing';
        // Saves the tournament data to the MongoDB database.
        const tournamentData = new Tournament({
            ...tournament,
            _id: tournament.id
        });
        await tournamentData.save();
        res.json(tournament);
    } catch (error) {
        res.status(500).send('Error during tournament creation.');
    }
}

async function addParticipant(req, res) {
    try {
        // Extracts tournament ID and participant name from the request body.
        const { tournamentId, participantName } = req.body;
        // Adds a participant to the specified tournament using the Challonge API.
        const { participant } = await challongeServices.addParticipant(tournamentId, participantName);
        // Updates the tournament document in MongoDB to include the new participant.
        await Tournament.findByIdAndUpdate(tournamentId,
            { $push: { participants: participant } },
            { new: true }
        );
        res.json(participant);
    } catch (error) {
        res.status(500).send('Error adding a participant.');
    }
}

async function startTournament(req, res) {
    try {
        // Retrieves the tournament ID from the request body.
        const { tournamentId } = req.body;
        // Starts the tournament using the Challonge API and updates its state.
        const tournamentData = await challongeServices.startTournament(tournamentId);
        tournamentData.tournament.state = 'ongoing';
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return res.status(404).send('Tournament not found.');
        }
        tournament.state = 'ongoing';
        await tournament.save();
        res.json(tournamentData);
    } catch (error) {
        res.status(500).send('Error starting the tournament.');
    }
}

async function addUserInTeam(req, res) {
    try {
        // Adds a user to a team within a tournament, handling the logic via Challonge services.
        const data = await challongeServices.addUserInTeam(req.body);
        res.json(data);
    } catch (error) {
        res.status(500).send('Error during the operation: ' + error.message);
    }
}

async function getMatchList(req, res) {
    try {
        // Retrieves the tournament ID from URL parameters.
        const { tournamentId } = req.params;
        // Fetches a list of matches for the tournament using the Challonge API.
        const matchList = await challongeServices.getMatchList(tournamentId);
        res.json(matchList);
    } catch (error) {
        res.status(500).send('Error retrieving the match list.');
    }
}

async function addMatchScore(req, res) {
    try {
        // Retrieves tournament ID, match ID, and scores from the request body.
        const { tournamentId, matchId, scores } = req.body;
        // Adds a match score using the Challonge API.
        const data = await challongeServices.addMatchScore(tournamentId, matchId, scores);
        res.json(data);
    } catch (error) {
        res.status(500).send('Error adding match score.');
    }
}

async function getTournamentsByStatus(req, res) {
    try {
        // Retrieves the status from URL parameters.
        const { status } = req.params;
        // Fetches tournaments by status using the Challonge API.
        const tournaments = await challongeServices.getTournamentsByStatus(status);
        res.json(tournaments);
    } catch (error) {
        res.status(500).send('Error retrieving tournaments by status.');
    }
}

async function getAllTournaments(req, res) {
    try {
        // Fetches all tournaments using the Challonge API.
        const tournaments = await challongeServices.getAllTournaments();
        res.json(tournaments);
    } catch (error) {
        res.status(500).send('Error retrieving all tournaments.');
    }
}

// Exports all the defined functions for use in other parts of the application.
module.exports = {
    createTournament,
    addParticipant,
    startTournament,
    addUserInTeam,
    getMatchList,
    addMatchScore,
    getTournamentsByStatus,
    getAllTournaments
};
