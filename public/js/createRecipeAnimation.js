/**
 * Created by XavierWang on 16/5/12.
 */

$('#recipeIngredient').show();
$('#recipeProcedure').show();

$('#ingredientPlusButton').click(function(){
    $('#ingredientTable').append('<tr><td><input type="text" class="IngredientName"></td> ' +
                                    '<td><input type="text" class="IngredientQuantity"></td></tr>');

});

$('#ingredientMinusButton').click(function(){

    var count = $('#ingredientTable tr').length;
    if (count > 4) {
        $('#ingredientTable tr:last').remove();
    }

});

$('#procedurePlusButton').click(function(){
    $('#procedureTable').append('<tr><td><input type="text" class="procedure" placeholder="Additional Step: "></td></tr>');
});


$('#procedureMinusButton').click(function(){

    var rowCount = $('#procedureTable tr').length;
    if (rowCount > 4) {
        $('#procedureTable tr:last').remove();
    }

});


var shoppingList = angular.module("root", []);

shoppingList.controller("index", ["$scope", function ($scope){

  
}]);