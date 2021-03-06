// config/passport.js

// load all the things we need
let LocalStrategy   = require('passport-local').Strategy;

// load up the user model
let models = require('../models/index');


// expose this function to our app using module.exports
module.exports = function(passport) {

  // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        models.User.findById(id).then(function(user) {
          return done(null, user);
        }).catch(function(error) {
          return done(error);
        });
    });

  // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
    // find a user whose email is the same as the forms email
    // we are checking to see if the user trying to login already exists

      models.User.findOne({ where: { email: email } }).then(function(user) {
        if(user){
          return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
        } else {
          let newUser = models.User.build({ email: email });
          newUser.password = newUser.generateHash(password);
          newUser.save().then(function(user) {
            return done(null, newUser);
          }).catch(function(error) {
            return done(error);
          });
        }

      }).catch(function(error) {
        return done(error);
      });

    }));


    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

      models.User.findOne({ where: { email: email } }).then(function(user) {
        if (!user)
          return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

        if (!user.validPassword(password)){
          return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
        }
        else{
          return done(null, user);
        }

      }).catch(function(error) {
        return done(error);
      });
    }));

};
