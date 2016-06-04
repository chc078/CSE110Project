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
    var index = $scope.user.vfridge.indexOf(item);
    var left = $scope.user.vfridge[index].quantity - 1;
    if ( left > 0) {
      $scope.user.vfridge[index].quantity = $scope.user.vfridge[index].quantity - 1;
      User.update({username: $scope.user.username}, {"vfridge": $scope.user.vfridge});
    }
    else {
      $scope.user.vfridge.splice(index, 1);
      User.update({username: $scope.user.username}, {"vfridge": $scope.user.vfridge});
    }

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
  var item = User.find({username:myName},{"vfridge":1,"_id":0});
  console.log(item);

  console.log(item.vfridge);
  //var arr_from_json = JSON.parse( item );
  //console.log(arr_from_json);
});
//end of controller