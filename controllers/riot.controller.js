// Import services related to the Riot API to use in the function implementations.
const riotServices = require('../services/riot.services');

// Function to get the rank of a user by their Riot username and region.
async function getUserRank(req, res) {
    try {
        const { riotUsername, region } = req.params; // Extracts username and region from the request parameters.
        const rank = await riotServices.getUserRankByRiotUsername(riotUsername, region);
        res.status(200).json({ success: true, data: rank });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error retrieving user rank');
    }
}

// Function to get league details based on a league ID and region.
async function getLeagueDetails(req, res) {
    try {
        const { leagueId, region } = req.params;
        const details = await riotServices.getLeagueDetailsByLeagueId(leagueId, region);
        res.status(200).json({ success: true, data: details });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error retrieving league details');
    }
}

// Function to get a list of active and upcoming tournaments for a given region.
async function getActiveUpcomingTournaments(req, res) {
    try {
        const { region } = req.params;
        const tournaments = await riotServices.getActiveUpcomingTournaments(region);
        res.status(200).json({ success: true, data: tournaments });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error retrieving tournaments');
    }
}

// Function to get a list of users participating in a tournament based on a summoner ID and region.
async function getUsersInTournament(req, res) {
    try {
        const { summonerId, region } = req.params;
        const response = await riotServices.getUsersInTournamentBySummonerId(summonerId, region);
        res.status(200).json({ success: true, data: response });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error retrieving users in tournament');
    }
}

// Function to retrieve match history for a given user by their Riot username and region.
async function getMatchHistory(req, res) {
    const { riotUsername, region } = req.params;
    try {
        const matches = await riotServices.getMatchHistoryBySummonerName(riotUsername, region);
        res.json(matches);
    } catch (error) {
        console.error('Error retrieving match history:', error);
        res.status(500).send('Error retrieving match history');
    }
}

// Function to compare two teams by calculating and comparing their average scores.
async function compareTeams(req, res) {
    const { team1Usernames, team2Usernames, region } = req.body; // Get team usernames and region from request body.
    try {
        const team1Score = await calculateTeamAverageScore(team1Usernames, region);
        const team2Score = await calculateTeamAverageScore(team2Usernames, region);
        res.json({
            team1Score: team1Score,
            team2Score: team2Score
            // Additional logic could be added here to estimate chances based on scores.
        });
    } catch (error) {
        console.error('Error comparing teams:', error);
        res.status(500).send('Error comparing teams');
    }
}

// Function to register a tournament provider with a callback URL in a specific region.
async function registerTournamentProvider(req, res) {
    const urlCallback = req.body.url; // Ensure client sends this data.
    const region = req.params.region;
    try {
        const providerId = await riotServices.registerProvider(urlCallback, region);
        res.json({ providerId });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering provider.');
    }
}

// Function to register a tournament with a given provider ID and name in a specific region.
async function registerTournament(req, res) {
    const { providerId, tournamentName } = req.body; // Ensure these details are provided by the client.
    const region = req.params.region; // Or obtain the region in another way if necessary.
    try {
        const tournamentId = await riotServices.registerTournament(providerId, tournamentName, region);
        res.json({ tournamentId });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering tournament.');
    }
}

// Function to generate tournament codes for match setup.
async function generateTournament(req, res) {
    const { tournamentId, teamSize, mapType, pickType, spectatorType, region, count } = req.body; // Collect all necessary parameters from request body.
    try {
        const codes = await riotServices.generateTournamentCodes(tournamentId, teamSize, mapType, pickType, spectatorType, region, count);
        res.json(codes);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating tournament codes.');
    }
}

// Export all functions to make them available for use in other parts of the application.
module.exports = { getUserRank, getLeagueDetails, getActiveUpcomingTournaments, getUsersInTournament, getMatchHistory, compareTeams, registerTournamentProvider, registerTournament, generateTournament };