// Import the axios library to facilitate HTTP requests to external APIs.
const axios = require('axios');

// Retrieve the Riot Games API key from environment variables, ensuring sensitive data is not hard-coded.
const RIOT_API_KEY = process.env.RIOT_API_KEY;

// Function to fetch a user's rank based on their Riot Games username and specified region.
async function getUserRankByRiotUsername(riotUsername, region) {
    // Build the base URL for the API request using the user's region.
    const baseURL = `https://${region}.api.riotgames.com/lol`;
    // Fetch summoner data using the username, necessary to get their unique ID.
    const summonerResponse = await axios.get(`${baseURL}/summoner/v4/summoners/by-name/${riotUsername}`, {
        headers: { "X-Riot-Token": RIOT_API_KEY }
    });

    const summonerId = summonerResponse.data.id;
    // Fetch the rank details using the summoner ID obtained.
    const ranksResponse = await axios.get(`${baseURL}/league/v4/entries/by-summoner/${summonerId}`, {
        headers: { "X-Riot-Token": RIOT_API_KEY }
    });

    return ranksResponse.data;
}

// Function to retrieve league details based on a specific league ID and region.
async function getLeagueDetailsByLeagueId(leagueId, region) {
    const baseURL = `https://${region}.api.riotgames.com/lol`;
    // Perform the API request to fetch league information.
    const leagueResponse = await axios.get(`${baseURL}/league/v4/leagues/${leagueId}`, {
        headers: { "X-Riot-Token": RIOT_API_KEY }
    });

    return leagueResponse.data;
}

// Function to fetch active and upcoming tournament information for a specified region.
async function getActiveUpcomingTournaments(region) {
    const baseURL = `https://${region}.api.riotgames.com/lol`;
    // Retrieve data on tournaments using the Clash API endpoint.
    const tournamentsResponse = await axios.get(`${baseURL}/clash/v1/tournaments`, {
        headers: { "X-Riot-Token": RIOT_API_KEY }
    });

    return tournamentsResponse.data;
}

// Function to get information about tournament participants based on a summoner ID and region.
async function getUsersInTournamentBySummonerId(summonerId, region) {
    const baseURL = `https://${region}.api.riotgames.com/lol`;

    // Fetch player information in tournaments by their summoner ID.
    const playersResponse = await axios.get(`${baseURL}/clash/v1/players/by-summoner/${summonerId}`, {
        headers: { "X-Riot-Token": RIOT_API_KEY }
    });

    const teamId = playersResponse.data?.[0]?.teamId;
    // Fetch team information using the team ID.
    const teamResponse = await axios.get(`${baseURL}/clash/v1/teams/${teamId}`, {
        headers: { "X-Riot-Token": RIOT_API_KEY }
    });
    // Fetch tournament details for the team.
    const tournamentResponse = await axios.get(`${baseURL}/clash/v1/tournaments/by-team/${teamId}`, {
        headers: { "X-Riot-Token": RIOT_API_KEY }
    });

    return { 
        ...teamResponse.data,
        tournamentDetails: tournamentResponse.data
    };
}

// Function to retrieve match history for a summoner based on their name and region.
async function getMatchHistoryBySummonerName(summonerName, originalRegion) {
    // Map the region to a routing value for the API request.
    const routingValue = mapRegionToRoutingValue(originalRegion);
    // Fetch summoner details to obtain the PUUID necessary for match history requests.
    const summonerResponse = await axios.get(`https://${originalRegion}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}`, {
        headers: { "X-Riot-Token": RIOT_API_KEY }
    });
    const puuid = summonerResponse.data.puuid;

    // Fetch a list of match IDs for the summoner.
    const matchIdsResponse = await axios.get(`https://${routingValue}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20`, {
        headers: { "X-Riot-Token": RIOT_API_KEY }
    });
    const matchIds = matchIdsResponse.data;

    // Fetch detailed match information for each match ID.
    const matchesDetails = await Promise.all(matchIds.map(async (matchId) => {
        const matchDetailResponse = await axios.get(`https://${routingValue}.api.riotgames.com/lol/match/v5/matches/${matchId}`, {
            headers: { "X-Riot-Token": RIOT_API_KEY }
        });
        return matchDetailResponse.data;
    }));

    return matchesDetails;
}

// Function to calculate the average rank score for a team of players based on their usernames and region.
async function calculateTeamAverageScore(playerUsernames, region) {
    let totalScore = 0;
    for (const username of playerUsernames) {
        const ranks = await getUserRankByRiotUsername(username, region);
        if (ranks.length > 0) {
            const { tier, rank } = ranks[0];
            totalScore += calculateRankScore(tier, rank);
        }
    }
    return totalScore / playerUsernames.length;
}

// Function to register a tournament provider with Riot's API using a callback URL and region.
async function registerProvider(urlCallback, region) {
    const baseURL = `https://${region}.api.riotgames.com/lol/tournament/v5/providers`;
    try {
        const response = await axios.post(baseURL, {
            region: region.toUpperCase(),
            url: urlCallback
        }, {
            headers: { "X-Riot-Token": RIOT_API_KEY }
        });
        return response.data;
    } catch (error) {
        console.error('Error during provider registration:', error.response.data);
        throw error;
    }
}

// Function to register a tournament using a provider ID and tournament name within a specific region.
async function registerTournament(providerId, tournamentName, region) {
    const baseURL = `https://${region}.api.riotgames.com/lol/tournament/v5/tournaments`;
    try {
        const response = await axios.post(baseURL, {
            name: tournamentName,
            providerId: providerId
        }, {
            headers: { "X-Riot-Token": RIOT_API_KEY }
        });
        return response.data;
    } catch (error) {
        console.error('Error during tournament registration:', error.response.data);
        throw error;
    }
}

// Function to generate tournament codes for a specified tournament ID, team size, map type, pick type, and spectator settings.
async function generateTournamentCodes(tournamentId, teamSize, mapType, pickType, spectatorType, region, count = 1) {
    const baseURL = `https://${region}.api.riotgames.com/lol/tournament/v5/codes`;
    try {
        const response = await axios.post(baseURL, {
            tournamentId: tournamentId,
            count: count,
            teamSize: teamSize,
            mapType: mapType,
            pickType: pickType,
            spectatorType: spectatorType
        }, {
            headers: { "X-Riot-Token": RIOT_API_KEY }
        });
        return response.data;
    } catch (error) {
        console.error('Error generating tournament codes:', error.response.data);
        throw error;
    }
}

// Helper function to map a given region to its corresponding routing value for Riot's API endpoints.
function mapRegionToRoutingValue(region) {
    const regionMappings = {
        'na': 'AMERICAS',
        'br': 'AMERICAS',
        'lan': 'AMERICAS',
        'las': 'AMERICAS',
        'kr': 'ASIA',
        'jp': 'ASIA',
        'eune': 'EUROPE',
        'euw': 'EUROPE',
        'tr': 'EUROPE',
        'ru': 'EUROPE',
        'oce': 'SEA',
        // Additional mappings can be added as needed.
    };
    return regionMappings[region.toLowerCase()] || 'EUROPE'; // Default to 'EUROPE' if no mapping exists.
}

// Function to calculate a score for a player based on their rank tier and division.
function calculateRankScore(tier, division) {
    const tierScores = {
        'IRON': 1,
        'BRONZE': 2,
        'SILVER': 3,
        'GOLD': 4,
        'PLATINUM': 5,
        'DIAMOND': 6,
        'MASTER': 7,
        'GRANDMASTER': 8,
        'CHALLENGER': 9
    };
    const divisionScores = { 'IV': 0, 'III': 1, 'II': 2, 'I': 3 };

    // Calculate and return the score based on tier and division scores.
    return (tierScores[tier] || 0) * 4 + (divisionScores[division] || 0);
}

// Export all functions to make them available for use elsewhere in the application.
module.exports = {
    getUserRankByRiotUsername,
    getLeagueDetailsByLeagueId,
    getActiveUpcomingTournaments,
    getUsersInTournamentBySummonerId,
    getMatchHistoryBySummonerName,
    calculateTeamAverageScore,
    registerProvider,
    registerTournament,
    generateTournamentCodes,
    mapRegionToRoutingValue,
    calculateRankScore
};
