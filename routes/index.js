var express = require('express');
var router = express.Router();
var controller = require('../controllers')

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/list', function(req, res, next) {
 	controller.list(req, res, next);
});

router.post('/buy_chocolate', function(req, res, next) {
 	controller.buy_chocolate(req, res, next);
});

router.post('/fill_product_inventory', function(req, res, next) {
 	controller.list(req, res, next);
});

router.post('/transactions', function(req, res, next) {
 	controller.get_transactions(req, res, next);
});

module.exports = router;
