/**
 * Created by XavierWang on 16/5/28.
 */
var alwaysInFridge = angular.module("profile", ['angoose.client']);

alwaysInFridge.controller("basic", function ($scope, User, $http) {
    
    var myName = document.getElementById('name').innerHTML;
    $scope.user = User.$get({username: myName});

    $scope.remove = function(item) {
        var index = $scope.user.myCreation.indexOf(item);    //remove an item from shopping list
        $scope.user.myCreation.splice(index, 1);
        User.update({username: $scope.user.username},{"myCreation":$scope.user.myCreation});
    };
    
});

alwaysInFridge.controller("habit", function ($scope, User, $http) {
    $scope.itemName;
    $scope.itemQuantity;

    var success = document.getElementById('successMessage');
    var error = document.getElementById('errorMessage');
    var myName = document.getElementById('name').innerHTML;


    $scope.user = User.$get({username: myName});

    console.log($scope.user);

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

            for (var key in $scope.user.always) {
                var found = false;
                var inList = false;
                var have = 0;
                var slistIndex = -1;
                for (var i in $scope.user.vfridge) {
                    if ($scope.user.vfridge[i].name == $scope.user.always[key].name){
                        found = true;
                        have = have + $scope.user.vfridge[i].quantity;
                    }
                }
                for (var j in $scope.user.slist) {
                    if ($scope.user.slist[j].name == $scope.user.always[key].name && $scope.user.slist[j].checked == false){
                        found = true;
                        inList = true;
                        slistIndex = j;
                    }
                }
                if (found == false) {
                    $scope.user.slist.push({"name": $scope.user.always[key].name, "quantity": $scope.user.always[key].quantity, "checked": false});
                    User.update({username: $scope.user.username},{"slist":$scope.user.slist});
                }
                else if ( have < $scope.user.always[key].quantity) {
                    if (inList) {
                        $scope.user.slist.splice(slistIndex, 1);
                        User.update({username: $scope.user.username}, {"slist": $scope.user.slist});
                    }
                    //alert($scope.user.always[key].quantity-have);
                    $scope.user.slist.push({"name": $scope.user.always[key].name, "quantity": $scope.user.always[key].quantity - have, "checked": false});
                    User.update({username: $scope.user.username},{"slist":$scope.user.slist});
                }
            }
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

alwaysInFridge.controller("allergy", function ($scope, User, $http){

    var myName = document.getElementById('name').innerHTML;

    $scope.user = User.$get({username: myName});

    var allergy = User.find({username: myName},{allergy:1, _id:0});

    //console.log(allergy.$$state.value);
    console.log(allergy);

    //initilized all the arrays to false
    $scope.user.allergyDairy = [{"name": "Dairy", "checked": false}];
    $scope.user.allergyEgg  =  [{"name": "Egg", "checked": false}];
    $scope.user.allergyGluten = [{"name": "Gluten", "checked": false}];
    $scope.user.allergyPeanut = [{"name": "Peanut", "checked": false}];
    $scope.user.allergySeafood = [{"name": "Seafood", "checked": false}];
    $scope.user.allergySesame = [{"name": "Sesame", "checked": false}];
    $scope.user.allergySoy = [{"name": "Soy", "checked": false}];
    $scope.user.allergySulfite = [{"name": "Sulfite", "checked": false}];
    $scope.user.allergyTreeNut = [{"name": "Tree Nut", "checked": false}];
    $scope.user.allergyWheat = [{"name": "Wheat", "checked": false}];


    $scope.stateChangedDairy = function (qId) {
        User.update({username: $scope.user.username}, {$pull: {"allergy":{"name":"Dairy"}}});
        if ($scope.answersDairy[qId]) {
            $scope.user.allergyDairy = [];
            $scope.user.allergyDairy.push({"name": "Dairy", "checked": true});
        }
        else {
            $scope.user.allergyDairy = [];
            $scope.user.allergyDairy.push({"name": "Dairy", "checked": false});
        }
    };

    $scope.stateChangedEgg = function (qId) {
        User.update({username: $scope.user.username}, {$pull: {"allergy":{"name":"Egg"}}});

        if ($scope.answersEgg[qId]) {
            $scope.user.allergyEgg = [];
            $scope.user.allergyEgg.push({"name": "Egg", "checked": true});
        }
        else {
            $scope.user.allergyEgg = [];
            $scope.user.allergyEgg.push({"name": "Egg", "checked": false});
        }
    };

    $scope.stateChangedGluten = function (qId) {
        User.update({username: $scope.user.username}, {$pull: {"allergy":{"name":"Gluten"}}});

        if ($scope.answersGluten[qId]) {
            $scope.user.allergyGluten = [];
            $scope.user.allergyGluten.push({"name": "Gluten", "checked": true});
        }
        else {
            $scope.user.allergyGluten = [];
            $scope.user.allergyGluten.push({"name": "Gluten", "checked": false});
        }
    };

    $scope.stateChangedPeanut = function (qId) {
        User.update({username: $scope.user.username}, {$pull: {"allergy":{"name":"Peanut"}}});

        if ($scope.answersPeanut[qId]) {
            $scope.user.allergyPeanut = [];
            $scope.user.allergyPeanut.push({"name": "Peanut", "checked": true});
        }
        else {
            $scope.user.allergyPeanut = [];
            $scope.user.allergyPeanut.push({"name": "Peanut", "checked": false});
        }
    };

    $scope.stateChangedSeafood = function (qId) {
        User.update({username: $scope.user.username}, {$pull: {"allergy":{"name":"Seafood"}}});

        if ($scope.answersSeafood[qId]) {
            $scope.user.allergySeafood = [];
            $scope.user.allergySeafood.push({"name": "Seafood", "checked": true});
        }
        else {
            $scope.user.allergySeafood = [];
            $scope.user.allergySeafood.push({"name": "Seafood", "checked": false});
        }
    };

    $scope.stateChangedSesame = function (qId) {
        User.update({username: $scope.user.username}, {$pull: {"allergy":{"name":"Sesame"}}});

        if ($scope.answersSesame[qId]) {
            $scope.user.allergySesame = [];
            $scope.user.allergySesame.push({"name": "Sesame", "checked": true});
        }
        else {
            $scope.user.allergySesame = [];
            $scope.user.allergySesame.push({"name": "Sesame", "checked": false});
        }
    };

    $scope.stateChangedSoy = function (qId) {
        User.update({username: $scope.user.username}, {$pull: {"allergy":{"name":"Soy"}}});

        if ($scope.answersSoy[qId]) {
            $scope.user.allergySoy = [];
            $scope.user.allergySoy.push({"name": "Soy", "checked": true});
        }
        else {
            $scope.user.allergySoy = [];
            $scope.user.allergySoy.push({"name": "Soy", "checked": false});
        }
    };

    $scope.stateChangedSulfite = function (qId) {
        User.update({username: $scope.user.username}, {$pull: {"allergy":{"name":"Sulfite"}}});

        if ($scope.answersSulfite[qId]) {
            $scope.user.allergySulfite = [];
            $scope.user.allergySulfite.push({"name": "Sulfite", "checked": true});
        }
        else {
            $scope.user.allergySulfite = [];
            $scope.user.allergySulfite.push({"name": "Sulfite", "checked": false});
        }
    };

    $scope.stateChangedTreeNut = function (qId) {
        User.update({username: $scope.user.username}, {$pull: {"allergy":{"name":"TreeNut"}}});

        if ($scope.answersTreeNut[qId]) {
            $scope.user.allergyTreeNut = [];
            $scope.user.allergyTreeNut.push({"name": "Tree Nut", "checked": true});
        }
        else {
            $scope.user.allergyTreeNut = [];
            $scope.user.allergyTreeNut.push({"name": "Tree Nut", "checked": false});
        }
    };

    $scope.stateChangedWheat = function (qId) {
        User.update({username: $scope.user.username}, {$pull: {"allergy":{"name":"Wheat"}}});

        if ($scope.answersWheat[qId]) {
            $scope.user.allergyWheat = [];
            $scope.user.allergyWheat.push({"name": "Wheat", "checked": true});
        }
        else {
            $scope.user.allergyWheat = [];
            $scope.user.allergyWheat.push({"name": "Wheat", "checked": false});
        }
    };

    $scope.GetPush = function() {
        alert('Foodopia remembers your allergy now!');
        $scope.user.allergy = $scope.user.allergyDairy.concat($scope.user.allergyEgg,     $scope.user.allergyGluten,
            $scope.user.allergyPeanut,  $scope.user.allergySeafood,
            $scope.user.allergySesame,  $scope.user.allergySoy,
            $scope.user.allergySulfite, $scope.user.allergyTreeNut, $scope.user.allergyWheat);
        User.update({username: $scope.user.username}, {"allergy": $scope.user.allergy});

    };

});