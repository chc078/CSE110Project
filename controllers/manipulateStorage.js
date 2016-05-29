/**
 * Created by XavierWang on 16/5/24.
 */
var async = require('async');
var User = require('../models/user');

exports.removeItem = function (req, username, res) {
    async.waterfall([
        function (done) {
            User.findOne({ 'username' :  username }
                
            ), function (err, user){
                if (!user){
                    console.log('no such user in database');
                    return res.redirect('/');
                }
                console.log('successfully finding user');
                return res.redirect('/storage')
            };
            
            /*
            User.findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpire: {$gt: Date.now()}
            }, function (err, user) {
                if (!user) {
                    req.flash('message','Password reset token is invalid or has expired.');
                    console.log('reset token not working or expired');
                    return res.redirect('/');
                }
                req.assert('confirm', 'Passwords must match').equals(req.body.password);
                var errors = req.validationErrors();
                if (!errors) {   //No errors were found.  Passed Validation!
                    user.password = bCrypt.hashSync(req.body.password, bCrypt.genSaltSync(10), null);
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpire = undefined;

                    user.save(function (err, user) {
                        if (err) throw err;
                        req.logIn(user, function (err) {
                            req.flash('message', 'Success, your password has been changed.');
                            console.log('password has been reset');
                            console.log(user.password);
                            done(err, user);
                        });
                    });

                }
                else {   //Display errors to user
                    req.flash('message', 'The two passwords must match');
                    res.redirect('/reset/'+ req.params.token);
                }
            });
            */
        }], function (err) {
        console.log('error in removeItem')
        res.redirect('/');
    });
};