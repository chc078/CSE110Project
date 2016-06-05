var User = require('../models/user');
var FacebookStrategy = require('passport-facebook');

module.exports = function(passport){
    passport.use ('facebook', new FacebookStrategy({
        clientID: '474313119430098',
        clientSecret: '24a6ef63a0c1f3a168689ab93ede182c',
        callbackURL: "http://foodopia.herokuapp.com/auth/facebook/callback",
        profileFields: ['name', 'emails','displayName']
        },
  // facebook will send back the tokens and profile
        function(req, access_token, refresh_token, profile, done) {
    // asynchronous
        process.nextTick(function() {
     
      // find the user in the database based on their facebook id
        User.findOne({$or: [{'id' : profile.id }, {email: profile.emails[0].value}]}, function(err, user) {
 
        // if there is an error, stop everything and return that
        // ie an error connecting to the database
          if (err) 
            return done(err);
 
          // if the user is found, then log them in
           // user found, return that user
          if (!user)  
           {
            // if there is no user found with that facebook id, create them
            var newUser = new User();
            console.log('no user found, creating');
            // set all of the facebook information in our user model
            newUser.id = profile.id; // set the users facebook id                 
            newUser.access_token = access_token; // we will save the token that facebook provides to the user                    
            newUser.username  = profile.displayName;
            console.log(profile.displayName + " " + profile.id);
            newUser.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
            newUser.vfridge = [];
            newUser.slist = [];
            newUser.always=[];
            newUser.allergy = [
                            {name:"Dairy",   checked: false},
                            {name: "Egg",    checked: false},
                            {name: "Gluten", checked: false},
                            {name: "Peanut", checked: false},
                            {name: "Seafood",checked: false},
                            {name: "Sesame", checked: false},
                            {name: "Soy",    checked: false},
                            {name: "Sulfite",checked: false},
                            {name: "TreeNut",checked: false},
                            {name: "Wheat",  checked: false}
                        ];

               newUser.myCreation = [];

            // save our user to the database
            newUser.save(function(err) {
              if (err)
                throw err;
 
              // if successful, return the new user
              return done(null, newUser);
            });
         }
         if (user) {
          console.log('user found, logging in');
          return done(null, user);
          } 
      });
    });
    })
    );

}