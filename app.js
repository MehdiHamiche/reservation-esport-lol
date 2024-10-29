var dotenv = require('dotenv');
dotenv.config();
var express = require('express');
var path = require('path');
//var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const mongoose = require('./config.js');
const cron = require('node-cron');
const scheduler = require('./scheduler');
mongoose.connect();

var riotRouter = require('./routes/riot.router.js');
var challongeRouter = require('./routes/challonge.router.js');

var app = express();

/*// Connexion à la base de données MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connexion à MongoDB réussie'))
  .catch(err => console.error('Erreur de connexion à MongoDB :', err));*/

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var corsOptions = {
	origin: '*',
}

app.use(cors(corsOptions));

app.use('/riot', riotRouter);
app.use('/challonge', challongeRouter);

// Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

cron.schedule('0 0 * * *', async () => {
  console.log('Running scheduled task...');
  await scheduler.deleteOldTournaments();
});

module.exports = app;

/// User.plugin(passportLocalMongoose); à mettre pour le passport ailleurs