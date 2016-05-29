var shoppingList = angular.module("root", ['angoose.client']);

shoppingList.controller("index", function ($scope, User, $http) {

  $scope.itemName;
  $scope.itemShop;
  $scope.itemQuantity;

  var success = document.getElementById('successMessage');
  var error = document.getElementById('errorMessage');
  var myName = document.getElementById('name').innerHTML;

  //$scope.selection = [];

  $scope.user = User.$get({'username': myName});

  $scope.remove = function(item) {
    var index = $scope.user.slist.indexOf(item);    //remove an item from shopping list
    $scope.user.slist.splice(index, 1);
    User.update({username: $scope.user.username},{"slist":$scope.user.slist});
  };

  $scope.removeInventory = function(item) {
    var index = $scope.user.vfridge.indexOf(item);   //remove an item from vfridge
    $scope.user.vfridge.splice(index, 1);
    User.update({username: $scope.user.username},{"vfridge":$scope.user.vfridge});
  };

  $scope.shoppingClearAll = function(list){
    var length = $scope.user.slist.length;    //clear shopping list
    $scope.user.slist.splice(0, length);
    User.update({username: $scope.user.username},{"slist":$scope.user.slist});
  };

  $scope.inventoryClearAll = function(list){
    var length = $scope.user.vfridge.length;    //clear shopping list
    $scope.user.vfridge.splice(0, length);
    User.update({username: $scope.user.username},{"vfridge":$scope.user.vfridge});
  };


  $scope.addItem = function() {
    if($scope.itemName && $scope.itemQuantity){

      $scope.user.slist.push({"name":$scope.itemName, "shop":$scope.itemShop, "quantity": $scope.itemQuantity, "checked": false});

      User.update({username: $scope.user.username},{"slist":$scope.user.slist});
      $scope.itemName = '';
      $scope.itemShop = '';
      $scope.itemQuantity = '';

      success.style.display = 'block';
      var timer = setTimeout(function () {
        success.style.display = 'none';
      }, 2000);
    }
  };
  //end of add item

  $scope.add = function(item){                      //add an item to vfridge
    var item = $scope.user.slist.indexOf(item);
    $scope.user.vfridge.push($scope.user.slist[item]);        //changed
    User.update({username: $scope.user.username},{"vfridge":$scope.user.vfridge});
    $scope.user.slist[item].checked = true;
    User.update({username: $scope.user.username},{"slist":$scope.user.slist});

  }

});
//end of controller