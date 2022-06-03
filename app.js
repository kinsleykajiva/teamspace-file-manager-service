const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
require('dotenv').config();
const indexRouter = require('./routes/index');
const filesuploads = require('./routes/filesuploads');
var bodyParser = require('body-parser');


const app = express();
app.use(cors())
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/', indexRouter);
app.use('/files', filesuploads);
const port = process.env.PORT;

app.set('port', port);

const server = http.createServer(app);



server.listen(port);


