const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3018;
const router = require('./routes');

app.use(express.json());
app.use("/api", router);
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;
