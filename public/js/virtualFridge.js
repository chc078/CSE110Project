var shoppingList = angular.module("root", ['angoose.client']);

shoppingList.controller("index", function ($scope, User, $http){

  $scope.itemName;
  $scope.itemShop;
  $scope.itemQuantity;
  
  var success = document.getElementById('successMessage');
  var error = document.getElementById('errorMessage');
  var myName = document.getElementById('name').innerHTML;
  
  //$scope.selection = [];

  $scope.user = User.$get({'username': myName});
  
  /*
  $scope.list = [
    {name: 'Milk', shop:'06/30/2016', quantity: 1, checked: true},
    {name: 'Bread', shop:'06/30/2016', quantity: 1, checked: true},
    {name: 'Eggs', shop:'06/30/2016', quantity: 1, checked: true},
    {name: 'Chow Mein', shop:'06/30/2016', quantity: 1, checked: false},
    {name: 'Bacon', shop:'06/30/2016', quantity: 1, checked: false},
    {name: 'Yogurt', shop:'06/30/2016', quantity: 6, checked: false},
    {name: 'Chocolate', shop:'06/30/2016', quantity: 6, checked: false}
  ];
  

  $scope.inventory = [
    {name: 'Milk', shop:'06/30/2016', quantity: 1, price: 2.65},
    {name: 'Bread', shop: '06/30/2016', quantity: 1, price: 2.15},
    {name: 'Eggs', shop: '06/30/2016', quantity: 1, price: 1.75},
  ];
  */
  /*
  $scope.remove = function(item) {
    //$http.post('/someUrl', data, config).then(successCallback, errorCallback);
    //var index = $scope.slist.indexOf(item);
    //$scope.list.splice(index, 1);
    User.update(
        { 'username': myName },
        { $pull: {'slist': item}}, false, true
    );


  };
  */

/*
    $http({
      method: 'POST',
      url: '/storage'
    }).then(function successCallback(response) {
      console.log("Delete successfully");
    }, function errorCallback(response) {
      console.log("FAILURE");
    });*/

  /*
  $scope.removeInventory = function(item) { 
    var index = $scope.inventory.indexOf(item)
    $scope.inventory.splice(index, 1);     
  }
    
  $scope.clearAll = function(list){
  	var length = list.length;
     list.splice(0, length);
  };
    */
  $scope.addItem = function() {
    if($scope.itemName && $scope.itemQuantity && $scope.itemShop){
      /*
      $scope.user.update({$pushAll: {name: $scope.itemName}},{upsert:true},function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully added");
        }
      });*/

      $scope.user.slist.push({"name":$scope.itemName, "shop":$scope.itemShop, "quantity": $scope.itemQuantity, "checked": false});
      var newUser = new User({
        username: $scope.user.username,
        password: $scope.user.password,
        email: $scope.user.email,
        slist: $scope.user.slist,
        vfridge: $scope.user.vfridge
      });
      console.log(newUser);
      newUser.save(function (err) {
        console.log(newUser);
        console.log('this fires after the `post` hook', err);
      });

      $scope.itemName = '';
      $scope.itemShop = '';
      $scope.itemQuantity = '';
	
      success.style.display = 'block';
      var timer = setTimeout(function(){
        success.style.display = 'none';
      }, 2000);
    }
  };
    /*
    $scope.add = function(item){
      var item = $scope.list.indexOf(item);
      $scope.inventory.push($scope.list[item]);
      $scope.list[item].checked = true;
    }
*/
});