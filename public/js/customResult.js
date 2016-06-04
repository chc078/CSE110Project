/**
 * Created by XavierWang on 16/6/4.
 */
var shoppingList = angular.module("customSearch", ['angoose.client']);

shoppingList.controller("viewFridge", function ($scope, User, $http) {
    
    var myName = document.getElementById('name').innerHTML;

    $scope.user = User.$get({'username': myName});

    var item = User.find({username:myName},{"vfridge":1,"_id":0});

});
//end of controller