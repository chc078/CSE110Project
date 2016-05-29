/**
 * Created by XavierWang on 16/5/28.
 */
var alwaysInFridge = angular.module("profile", ['angoose.client']);

alwaysInFridge.controller("habit", function ($scope, User, $http) {
    $scope.itemName;
    $scope.itemQuantity;

    var success = document.getElementById('successMessage');
    var error = document.getElementById('errorMessage');
    var myName = document.getElementById('name').innerHTML;


    $scope.user = User.$get({username: myName});

    console.log($scope.user);

    $http({
        method: 'POST',
        url: '/profile'
    }).then(function successCallback(response) {
        console.log("Delete successfully");
    }, function errorCallback(response) {
        console.log("FAILURE");
    });

    $scope.remove = function(item) {
        var index = $scope.user.always.indexOf(item);    //remove an item from shopping list
        $scope.user.always.splice(index, 1);
        User.update({username: $scope.user.username},{"always":$scope.user.always});
    };
    $scope.clearAll = function(item) {
        var length = $scope.user.always.length;    //clear shopping list
        $scope.user.always.splice(0, length);
        User.update({username: $scope.user.username},{"always":$scope.user.always});
    };
    $scope.addItem = function() {
        if($scope.itemName && $scope.itemQuantity) {
            $scope.user.always.push({"name": $scope.itemName, "quantity": $scope.itemQuantity});
            //database update here
            User.update({username: $scope.user.username},{"always":$scope.user.always});
            $scope.itemName = '';
            $scope.itemQuantity = '';
            success.style.display = 'block';
            var timer = setTimeout(function () {
                success.style.display = 'none';
            },2000);
        }
    };
});