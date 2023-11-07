const express = require('express');
const router = express.Router();
const errorController = require('./controllers/errorController');
const apiController = require('./controllers/apiController');
const spotifyController = require('./controllers/spotifyController');

// api logic
router.post('/fetch_code', apiController.fetchCode)
router.post('/ping', apiController.ping);
router.get('/callback', apiController.callback);

// spotify proxy
router.post('/spotify/proxy', spotifyController.proxy); // cors cringe

router.use((req, res, next) => {
    if (req.method === 'GET') {
        errorController.get404Page(req, res);
    } else {
        res.status(404).send("Could not find anything for \"" + req.path + "\"");
    }
});


module.exports = router;