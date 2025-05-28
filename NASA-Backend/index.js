require('dotenv').config();

const database = require('./config/database');
database.connect()

// để sử dụng express
const express = require('express');
const app = express();
const port = process.env.PORT;


app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.listen(port, () => {
    console.log(`App listening on port ${port}.`);
});
