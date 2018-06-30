const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const socketController = require('./src/lib/socket');
require('dotenv').load();

const app = express();

const port = process.env.PORT || 3001;

app.use(morgan('dev'));

mongoose.connect(process.env.DB_URL, { autoIndex: false });

app.use(express.static("build"));

const server = app.listen(port, () => console.log(`App listening on port ${port}`));

socketController(server);
