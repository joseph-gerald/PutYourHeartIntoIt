const app = require('./server'); // Import the Express app instance
const router = require('./routes'); // Import the Express router with route handling

app.use('/', router);