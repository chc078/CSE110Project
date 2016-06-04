/**
 * Created by XavierWang on 16/6/1.
 */
var creator = angular.module("creation", ['angoose.client']);

creator.controller("template", function ($scope, User, $http) {
    var myName = document.getElementById('name').innerHTML;

    $scope.user = User.$get({'username': myName});

    console.log($scope.user);

    $scope.addRecipe = function() {

        //var ingreds = [];
        //ingreds.push({name: $scope., quantity: {type: Number}});
        console.log('in addRecipe');
        
        $scope.user.myCreation.push({
            name: $scope.title,
            ingredient: [{name: $scope.ing1, quantity: $scope.quant1},{name: $scope.ing2, quantity: $scope.quant2},{name: $scope.ing3, quantity: $scope.quant3},{name: $scope.ing4, quantity: $scope.quant4},{name: $scope.ing5, quantity: $scope.quant5}],
            comment: $scope.comment,
            steps: [{step: $scope.ste1},{step: $scope.ste2},{step: $scope.ste3},{step: $scope.ste4},{step: $scope.ste5}]
        });

        console.log($scope.user.myCreation);
        User.update({username: $scope.user.username},{"myCreation":$scope.user.myCreation});
        alert("Foodopia has saved and values your recipe!");
        /*
        $scope.itemName = '';
        $scope.itemShop = '';
        $scope.itemQuantity = '';
        
        success.style.display = 'block';
        var timer = setTimeout(function () {
            success.style.display = 'none';
        }, 2000);
        */
        
    };
    
});