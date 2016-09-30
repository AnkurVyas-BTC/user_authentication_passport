let express = require('express');
let router = express.Router();
let passport = require('passport');
const RECORDS_PER_PAGE = 10;

require('../config/passport')(passport);

let models = require('../models/index');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/login', function(req, res, next) {
  res.render('login', {
    title: 'User Login',
    message: req.flash('loginMessage')
  });
});

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/users/profile', // redirect to the secure profile section
  failureRedirect: '/users/login', // redirect back to the signup page if there is an error
  failureFlash: true // allow flash messages
}));

router.get('/signup', function(req, res, next) {
  res.render('signup', {
    title: 'User SignUp',
    message: req.flash('signupMessage')
  });
});

// process the signup form
router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/users/profile', // redirect to the secure profile section
  failureRedirect: '/users/signup', // redirect back to the signup page if there is an error
  failureFlash: true // allow flash messages
}));

router.get('/profile', isLoggedIn, function(req, res, next) {
  res.render('profile', {
    title: 'User Profile',
    user: req.user
  });
});

router.get('/product/index', isLoggedIn, function(req, res, next) {
  let page = req.query.page || 1;
  let offset = (page - 1) * RECORDS_PER_PAGE;
  let sort_by = req.query.sort_by || 'createdAt';
  let sort_order = req.query.sort_order || 'DESC';
  req.user.countProducts().then(function(total_count) {
    req.user.getProducts({
      order: sort_by + ' ' + sort_order,
      offset: offset,
      limit: RECORDS_PER_PAGE
    }).then(function(products) {
      res.render('product/index', {
        title: 'Product List',
        user: req.user,
        products: products,
        total_pages: Math.ceil(total_count / RECORDS_PER_PAGE),
        sort_by: sort_by,
        sort_order: sort_order,
        current_page: page
      });
    });
  });
});

router.get('/product/index/ajax', isLoggedIn, function(req, res, next) {
  let page = req.query.page || 1;
  let offset = (page - 1) * RECORDS_PER_PAGE;
  let sort_by = req.query.sort_by || 'createdAt';
  let sort_order = req.query.sort_order || 'DESC';
  req.user.countProducts().then(function(total_count) {
    req.user.getProducts({
      order: sort_by + ' ' + sort_order,
      offset: offset,
      limit: RECORDS_PER_PAGE
    }).then(function(products) {
      res.app.render('product/_list_table', {
        title: 'Product List',
        user: req.user,
        products: products,
        total_pages: Math.ceil(total_count / RECORDS_PER_PAGE),
        current_page: page,
        layout: false,
        sort_by: sort_by,
        sort_order: sort_order
      }, function(err, html) {
        res.send(html);
      });
    });
  });
});

router.get('/product/new', isLoggedIn, function(req, res, next) {
  res.render('product/new', {
    title: 'Add new product'
  });
});

router.post('/product/create', isLoggedIn, function(req, res, next) {
  let newProduct = models.Product.build({
    title: req.body.title,
    price: req.body.price,
    category: req.body.category,
    UserId: req.user.id
  });
  newProduct.save().then(function(product) {
    res.redirect('/users/product/index');
  }).catch(function(error) {
    throw error;
  });
});

router.get('/product/:id/edit', isLoggedIn, function(req, res, next) {
  models.Product.findById(req.params.id).then(function(product) {
    res.render('product/edit', {
      title: 'Product Edit',
      user: req.user,
      product: product
    });
  });
});

router.post('/product/:id/update', isLoggedIn, function(req, res, next) {
  models.Product.update({
    title: req.body.title,
    price: req.body.price,
    category: req.body.category
  }, {
    where: {
      id: req.params.id
    }
  }).then(function(item) {
    res.redirect('/users/product/index');
  });
});

router.get('/product/:id/delete', isLoggedIn, function(req, res, next) {
  models.Product.destroy({
    where: {
      id: req.params.id
    }
  }).then(function(item) {
    res.redirect('/users/product/index');
  });
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

// route middleware to make sure
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}


module.exports = router;