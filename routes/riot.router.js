// Import the Express framework and the Riot controller.
const express = require('express');
const riotController = require('../controllers/riot.controller');

// Create an Express router object to define routes.
const router = express.Router();

// GET

// Define a GET route for retrieving a user's rank from the Riot Games API.
// It expects a username and region as URL parameters.
router.get('/user-rank/:riotUsername/:region', riotController.getUserRank);

// Define a GET route for retrieving league details from the Riot Games API.
// It expects a league ID and region as URL parameters.
router.get('/league-details/:leagueId/:region', riotController.getLeagueDetails);

// Define a GET route for retrieving active and upcoming tournaments in a specific region.
router.get('/tournaments/:region', riotController.getActiveUpcomingTournaments);

// Define a GET route for retrieving users participating in a specific tournament.
// It expects a summoner ID and region as URL parameters.
router.get('/users-in-tournament/:summonerId/:region', riotController.getUsersInTournament);

// Define a GET route for retrieving the match history of a user.
// This includes the champions played and positions. It expects a username and region as URL parameters.
router.get('/match-history/:riotUsername/:region', riotController.getMatchHistory); 


// POST

// Define a POST route to register a new tournament provider with the Riot Games API.
// It expects a region as a URL parameter.
router.post('/register-provider/:region', riotController.registerTournamentProvider);

// Define a POST route to register a new tournament within a specified region.
router.post('/register-tournament/:region', riotController.registerTournament);

// Define a POST route for generating tournament codes, which are used to create matches in the tournament.
router.post('/generate-tournament-codes', riotController.generateTournament);


// Export the router to be used by other parts of the application.
module.exports = router;