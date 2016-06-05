/**
 * Created by XavierWang on 16/5/12.
 */

$('#back-button').hide();
$('#shopping-list').hide();
$('#inventory').hide();
$('#name').hide();

$('#shopping-button').click(function(){
    $('#shopping-button').fadeOut(100);
    $('#inventory-button').fadeOut(100);
    $('#back-button').delay(100).fadeIn("slow");
    $('#shopping-list').delay(100).fadeIn("slow");
});

$('#inventory-button').click(function(){
    $('#shopping-button').fadeOut(100);
    $('#inventory-button').fadeOut(100);
    $('#back-button').delay(100).fadeIn("slow");
    $('#inventory').delay(100).fadeIn("slow");
});

$('#toFridge').click(function(){
    $('#shopping-list').fadeOut(100);
    $('#inventory').delay(100).fadeIn("slow");
});

$('#toShopping').click(function(){
    $('#inventory').fadeOut(100);
    $('#shopping-list').delay(100).fadeIn("slow");
});

$('#back-button').click(function(){
    $('#inventory').fadeOut(100);
    $('#shopping-list').fadeOut(100);
    $('#back-button').fadeOut(100);
    $('#shopping-button').delay(100).fadeIn("slow");
    $('#inventory-button').delay(100).fadeIn("slow");
});