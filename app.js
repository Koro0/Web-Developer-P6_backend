const express = require('express');
const mongoose = require('mongoose');

mongoose
  .connect(
    'mongodb+srv://Koroo:xzeKMg1TUehmAvgR@cluster0.4yqb4.mongodb.net/test?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

module.exports = app;
