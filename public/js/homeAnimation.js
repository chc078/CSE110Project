/**
 * Created by XavierWang on 16/5/18.
 */
var LocalStrategy   = require('passport-local').Strategy;
var User = require('../models/user');
var bCrypt = require('bcrypt-nodejs');

