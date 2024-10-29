// Import the Express framework and the Challonge controller.
const express = require('express');
const challongeController = require('../controllers/challonge.controller');

// Create an Express router object to define routes.
const router = express.Router();


// Define a POST route for creating a new tournament. This is handled by the createTournament method in the challongeController.
router.post('/create-tournament', challongeController.createTournament);

// Define a POST route for adding a participant to a tournament. This functionality is managed by the addParticipant method in the challongeController.
router.post('/add-participant', challongeController.addParticipant);

// Define a POST route for starting an existing tournament. The startTournament method in the challongeController handles this action.
router.post('/start-tournament', challongeController.startTournament);

// Define a POST route for adding a user to a team within a tournament, managed by the addUserInTeam method in the challongeController.
router.post('/add-user-in-team', challongeController.addUserInTeam);


// Define a GET route to retrieve the list of matches for a specific tournament by its ID. This is handled by the getMatchList method in the challongeController.
router.get('/tournament/:tournamentId/matches', challongeController.getMatchList);

// Define a POST route for submitting the score of a match, handled by the addMatchScore method in the challongeController.
router.post('/add-match-score', challongeController.addMatchScore);

// Define a GET route to retrieve tournaments based on their status (e.g., upcoming, ongoing, completed). This is managed by the getTournamentsByStatus method in the challongeController.
router.get('/tournaments/:status', challongeController.getTournamentsByStatus);

// Define a GET route to retrieve all tournaments, managed by the getAllTournaments method in the challongeController.
router.get('/all-tournaments', challongeController.getAllTournaments);


// Export the router to be used by other parts of the application.
module.exports = router;