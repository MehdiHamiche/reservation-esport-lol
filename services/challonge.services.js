// Import the axios library for making HTTP requests and import local Mongoose models for Teams and Tournaments.
const axios = require('axios');
const Team = require('../models/team.model');
const Tournament = require('../models/tournament.model');

// Setup environment variables for Challonge API access.
const CHALLONGE_API_KEY = process.env.CHALLONGE_API_KEY;
const CHALLONGE_USERNAME = process.env.CHALLONGE_USERNAME;

// Create a customized axios instance with base URL for Challonge API and default parameters including the API key.
const challongeAxios = axios.create({
    baseURL: 'https://api.challonge.com/v1',
    params: {
        api_key: CHALLONGE_API_KEY,
    },
});

// Function to create a tournament on Challonge with provided tournament details.
async function createTournament(tournamentDetails) {
    try {
        // Make a POST request to create a new tournament with specified details.
        const response = await challongeAxios.post('/tournaments.json', {
            tournament: tournamentDetails
        });
        return response.data; // Return the data from the response.
    } catch (error) {
        console.error('Error during tournament creation:', error.response?.data || error.message);
        throw error; // Rethrow to handle it later.
    }
}

// Function to add a participant to a tournament on Challonge by tournament ID and participant name.
async function addParticipant(tournamentId, participantName) {
    try {
        // Post request to add a new participant to the specific tournament.
        const response = await challongeAxios.post(`/tournaments/${tournamentId}/participants.json`, {
            participant: { name: participantName }
        });
        return response.data;
    } catch (error) {
        console.error('Error adding a participant:', error.response?.data || error.message);
        throw error;
    }
}

// Function to start a tournament on Challonge using its ID.
async function startTournament(tournamentId) {
    try {
        // Post request to start the tournament.
        const response = await challongeAxios.post(`/tournaments/${tournamentId}/start.json`);
        return response.data;
    } catch (error) {
        console.error('Error starting the tournament:', error.response?.data || error.message);
        throw error;
    }
}

// Function to add a user to a team, handling scenarios like creating a new team or updating an existing one.
async function addUserInTeam(data) {
    try {
        const team = await Team.findOne({ tournament_id: data.tournamentId });
        if (team === null) {
            // Create a new team if it does not exist.
            const tournamentData = new Team({
                team_name: data.teamName,
                tournament_id: data.tournamentId,
                user_ids: [data.userId]
            });
            await tournamentData.save();
        } else {
            // Validate if team is not full or user already in team.
            if (team.user_ids.length >= 5) throw { message: 'The team is already full.' };
            if (team.user_ids.includes(data.userId)) throw { message: 'User already in team.' };

            // Add user to the team.
            await team.updateOne(
                { $push: { user_ids: data.userId } }
            );
        }
        return 'Data updated in database';
    } catch (error) {
        console.error('Error adding user to team:', error.response?.data || error.message);
        throw error;
    }
}

// Function to retrieve the match list for a specific tournament from Challonge.
async function getMatchList(tournamentId) {
    try {
        const response = await challongeAxios.get(`/tournaments/${tournamentId}/matches.json`);
        return response.data;
    } catch (error) {
        console.error('Error retrieving match list:', error.response?.data || error.message);
        throw error;
    }
}

// Function to add scores for a match in a tournament, handling complex scoring and status updates.
async function addMatchScore(tournamentId, matchId, scores) {
    try {
        // Validate that scores are provided.
        if (scores.length === 0) {
            throw new Error('Scores must be provided');
        }
        const scoresCSV = scores.join('-'); // Convert scores to a format accepted by the API.
        const response = await challongeAxios.put(`/tournaments/${tournamentId}/matches/${matchId}.json`, {
            match: { scores_csv: scoresCSV }
        });

        console.log(response.data.match.state); // Log the match state.

        // Handle the completion status of the match.
        if (response.data.match.state == 'complete') {
            return { message: 'The match is already finished' };
        } else {
            const tournament = await Tournament.findById(tournamentId);
            if (!tournament) {
                return { message: 'Tournament not found' };
            }

            // Check if any participant's total score meets the winning requirement.
            const requireScoreToWin = tournament.require_score_to_win;
            const participants = tournament.participants;
            const totalScores = scores.reduce((acc, score, index) => {
                acc[participants[index].id] = (acc[participants[index].id] || 0) + score;
                return acc;
            }, {});

            for (const participant of participants) {
                if (totalScores[participant.id] >= requireScoreToWin) {
                    tournament.state = 'finished';
                    await tournament.save();

                    // Update the match with the winner's information.
                    const player1Vote = participant.id === response.data.match.player1_id ? (response.data.match.player1_votes != null ? response.data.match.player1_votes + 5 : 5) : 0;
                    const player2Vote = participant.id === response.data.match.player2_id ? (response.data.match.player2_votes != null ? response.data.match.player2_votes + 5 : 5) : 0;
                      
                    const finalResponse = await challongeAxios.put(`/tournaments/${tournamentId}/matches/${matchId}.json`, {
                        match: {
                            scores_csv: scoresCSV,
                            winner_id: participant.id,
                            player1_votes: player1Vote,
                            player2_votes: player2Vote
                        }
                    });
                    finalResponse.state = 'finished';
                    return finalResponse.data;
                }
            }

            return response.data; // Return the response data if no participant has won yet.
        }
        
    } catch (error) {
        console.error('Error adding match score:', error.response?.data || error.message);
        throw error;
    }
}

// Function to retrieve tournaments filtered by their current status.
async function getTournamentsByStatus(status) {
    try {
        const tournaments = await Tournament.find({ state: status });
        return tournaments;
    } catch (error) {
        throw new Error('Error retrieving tournaments by status.');
    }
}

// Function to retrieve all tournaments.
async function getAllTournaments() {
    try {
        const tournaments = await Tournament.find({});
        return tournaments;
    } catch (error) {
        throw new Error('Error retrieving all tournaments.');
    }
}

// Export all functions to make them available for use in other parts of the application.
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