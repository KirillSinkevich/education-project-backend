require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth-routes');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authMiddleware = require("./middleware/auth-middleware");
const { AUTH_DB_URL, PORT } = process.env;
const errorMiddleware = require('./middleware/error-middleware');

const app = express();

var whitelist = ['http://localhost:4300', 'undefined'/** other domains if any */ ]
var corsOptions = {
  credentials: true,
  origin: function(origin, callback) {
    callback(null, true)
    // if (whitelist.indexOf(origin) !== -1) {
    //   callback(null, true)
    // } else {
    //   callback(new Error('Not allowed by CORS'))
    // }
  }
}

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

// routes
// app.get('*', authMiddleware.checkUser);
app.use('/api', authRoutes);
app.use(errorMiddleware);

const init = async () => {
  try {
    await mongoose.connect(AUTH_DB_URL, {useNewUrlParser: true, useUnifiedTopology: true})
      .then((result) => app.listen(PORT))
      .catch((err) => console.log(err));
  } catch (e) {
    console.log(e);
  }
}

init();
