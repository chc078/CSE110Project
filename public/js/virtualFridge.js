var shoppingList = angular.module("root", []);

shoppingList.controller("index", ["$scope", function ($scope){
  
  $scope.itemName;
  $scope.itemShop;
  $scope.itemQuantity;
  $scope.itemPrice;
  
  var success = document.getElementById('successMessage');
  var error = document.getElementById('errorMessage');
  
  $scope.selection = [];
  
  $scope.list = [
    {name: 'Milk', shop:'06/30/2016', quantity: 1, checked: true},
    {name: 'Bread', shop:'06/30/2016', quantity: 1, checked: true},
    {name: 'Eggs', shop:'06/30/2016', quantity: 1, checked: true},
    {name: 'Chow Mein', shop:'06/30/2016', quantity: 1, checked: false},
    {name: 'Bacon', shop:'06/30/2016', quantity: 1, checked: false},
    {name: 'Yoghurt', shop:'06/30/2016', quantity: 6, checked: false},
    {name: 'Chocolate', shop:'06/30/2016', quantity: 6, checked: false}
  ];
  
  
  $scope.getTotal = function(){
    var total = 0;
    for(var i = 0; i < $scope.list.length; i++){
        total += $scope.list[i].price;
    }
    return total;
  };
    
  $scope.inventory = [
    {name: 'Milk', shop:'06/30/2016', quantity: 1, price: 2.65},
    {name: 'Bread', shop: '06/30/2016', quantity: 1, price: 2.15},
    {name: 'Eggs', shop: '06/30/2016', quantity: 1, price: 1.75},
  ];

  $scope.remove = function(item) { 
    var index = $scope.list.indexOf(item)
    $scope.list.splice(index, 1);     
  }
  
  $scope.removeInventory = function(item) { 
    var index = $scope.inventory.indexOf(item)
    $scope.inventory.splice(index, 1);     
  }
    
  $scope.clearAll = function(list){
  	var length = list.length;
     list.splice(0, length);
  };
    
    $scope.addItem = function() {
       if($scope.itemName && $scope.itemQuantity && $scope.itemShop){
	        $scope.list.push({name: $scope.itemName, shop: $scope.itemShop, quantity: $scope.itemQuantity, checked: false});
	
	        $scope.itemName = '';
	        $scope.itemShop = '';
	        $scope.itemQuantity = '';
	
	        success.style.display = 'block';
	        var timer = setTimeout(function(){
	          success.style.display = 'none';
	        }, 2000);
      }
    }
    
    $scope.add = function(item){
      var item = $scope.list.indexOf(item);
      $scope.inventory.push($scope.list[item]);
      $scope.list[item].checked = true;
    }
}]);