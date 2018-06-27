const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const socketController = require('./src/lib/socket');
const config = require('./src/config');

const app = express();

const port = process.env.PORT || 3001;

app.use(morgan('dev'));

mongoose.connect(config.localDbUrl, { autoIndex: false });

app.use(express.static("build"));

const server = app.listen(port, () => console.log(`App listening on port ${port}`));

socketController(server);
