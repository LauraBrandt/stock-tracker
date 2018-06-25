const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const socketController = require('./src/lib/socket');

const app = express();

const port = process.env.PORT || 3001;

app.use(morgan('dev'));

mongoose.connect('mongodb://localhost:27017/stock-tracker', { autoIndex: false });

app.use(express.static("build"));

const server = app.listen(port, () => console.log(`App listening on port ${port}`));

socketController(server);
