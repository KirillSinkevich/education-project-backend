const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth-routes');
const cookieParser = require('cookie-parser');
const {checkUser} = require("./middleware/auth-middleware");
const { AUTH_DB_URL, PORT } = process.env;

const app = express();

// middleware
app.use(express.json());
app.use(cookieParser());

// database connection
mongoose.connect(AUTH_DB_URL, {useNewUrlParser: true, useUnifiedTopology: true})
  .then((result) => app.listen(PORT))
  .catch((err) => console.log(err));

// routes
app.get('*', checkUser);
app.use(authRoutes);
