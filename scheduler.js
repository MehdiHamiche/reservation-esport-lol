const cron = require('node-cron');
const Tournament = require('./models/tournament.model');


async function deleteOldTournaments() {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // One week ago
    try {
        // Find tournaments finished one week ago
        const tournamentsToDelete = await Tournament.find({
            completed_at: { $lte: oneWeekAgo },
            state: 'finished'
        });
        // Delete the tournaments
        await Promise.all(tournamentsToDelete.map(tournament => tournament.delete()));
        console.log('Old tournaments deleted successfully.');
    } catch (error) {
        console.error('Error deleting old tournaments:', error);
    }
}

// Schedule the task to run every day at a specific time (e.g., midnight)
cron.schedule('0 0 * * *', async () => {
    console.log('Running scheduled task...');
    await deleteOldTournaments();
});