/**
 * Created by XavierWang on 16/5/23.
 */
var Users = require('../models/user');

var user = {
    read: function(req, res, next) {
        res.json({type: "Read", id: req.params.id});
    },
    create: function(req, res, next) {
        res.send(req.body);
    },
    update: function(req, res, next) {
        res.json({type: "Update", id: req.params.id, body: req.body});
    },
    delete: function(req, res, next) {
        res.json({type: "Delete", id: req.params.id});
    },
    getAll: function(req, res, next) {
        Users.find(function(err, data){
            if(err) console.error;
            res.json(data)
        })
    }

};

module.exports = user;