const express = require('express');
const favoriteRouter = express.Router();
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

favoriteRouter
  .route('/')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
      .populate('user')
      .populate('campsites')
      .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id }).then((favorite) => {
      if (favorite) {
        req.body.forEach((fav) => {
          if (!favorite.campsites.includes(fav)) {
            favorite.campsites.push(fav);
          }
        });
        favorite
          .save()
          .then((favorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
          })
          .catch((err) => next(err));
      } else {
        Favorite.create({ user: req.user._id })
          .then((favorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
          })
          .catch((err) => next(err));
      }
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
      .then((favorite) => {
        res.statusCode = 200;
        if (favorite) {
          res.setHeader('Content-Type', 'application/json');
          res.json(favorite);
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.end('You do not have any favorites to delete.');
        }
      })
      .catch((err) => next(err));
  });

favoriteRouter
  .route('/:campsiteId')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/:campsiteId');
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id }).then((favorite) => {
      if (favorite) {
        if (!favorite.campsites.includes(req.params.campsiteId)) {
          favorite.campsites.push(req.params.campsiteId);
          favorite
            .save()
            .then((favorite) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorite);
            })
            .catch((err) => next(err));
        } else {
          res.setHeader('Content-Type', 'text/plain');
          res.end('That campsite is already a favorite!');
        }
      } else {
        Favorite.create({
          user: req.user._id,
          campsites: [req.params.campsiteId],
        })
          .then((favorite) => {
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
          })
          .catch((err) => next(err));
      }
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/:campsiteId');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id }).then((favorite) => {
      if (favorite) {
        const index = favorite.campsites.indexOf(req.params.campsiteId);
        if (index >= 0) {
          favorite.campsites.splice(index, 1);
        }
        favorite
          .save()
          .then((favorite) => {
            console.log('Favorite Campsite Deleted!', favorite);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
          })
          .catch((err) => next(err));
      } else {
        res.setHeader('Content-Type', 'text/plain');
        res.end('You do not have any favorites to delete.');
      }
    });
  });
module.exports = favoriteRouter;
