const express = require('express');
// Importation du package pour extraire l'objet JSON de la demande
const bodyParser = require('body-parser');
// Importation du package helmet pour sécuriser la requête http
const helmet = require('helmet');
// Importation du package nocache pour éviter la mise en cache dans le navigateur
const nocache = require('nocache');
// Importation du package mongoose pour accèder à la base de données
const mongoose = require('mongoose');
// Importation du routeur contenant les routes vers les sauces
const saucesRoutes = require('./routes/sauces');
// Importation du routeur contenant les middlewares d'authentification
const userRoutes = require('./routes/user');
// Importation qui donne accès au système de fichiers
const path = require('path');
// Importation du package qui protège contre les injections SQL
const mongoSanitize = require('express-mongo-sanitize');
// Importation du module qui prévient contre les attaques XSS
const xss = require('xss-clean');
// Importation du package gérant la connexion par cookie
const cookieSession = require('cookie-session');

// Connection au cluster MongoDB
mongoose.connect('mongodb+srv://dasyx:mzQyjOdjJNajPMqL@cluster0.ap1uo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

// Grâce à ces headers, on pourra accèder notre API depuis n'importe quelle origine, et envoyer différents types de requêtes
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// Sécurisation de la session et paramètrage du cookie de la session
app.use(cookieSession({
  name: 'session',
  secret: 'laVid@L0ca',
  cookie: {
    secure: true,
    httpOnly: true,
    domain: "http://localhost:3000/",
    maxAge: 60 * 60 * 1000 // 1 heure de validité
  }
}))

app.use(bodyParser.json());

app.use(xss());

// Afin de prévenir les attaques DDOS,
// On limitera le payload qu'un utilisateur pourra soumettre à l'API
app.use(express.json({ limit: '5kb' }));

app.use(helmet());

// Supprime la mise en cache du navigateur
app.use(nocache());

// Sanitization des données contre les attaques injections SQL
app.use(mongoSanitize());

// Ce middleware répondra aux requêtes envoyées à /images
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;