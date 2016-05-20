/**
 * Created by XavierWang on 16/5/12.
 */
$('#back-button').hide();
$('#shopping-list').hide();
$('#inventory').hide();

$('#shopping-button').click(function(){
    $('#shopping-button').fadeOut(800);
    $('#inventory-button').fadeOut(800);
    $('#back-button').delay(800).fadeIn("slow");
    $('#shopping-list').delay(800).fadeIn("slow");
});

$('#inventory-button').click(function(){
    $('#shopping-button').fadeOut(800);
    $('#inventory-button').fadeOut(800);
    $('#back-button').delay(800).fadeIn("slow");
    $('#inventory').delay(800).fadeIn("slow");
});

$('#toFridge').click(function(){
    $('#shopping-list').fadeOut(800);
    $('#inventory').delay(800).fadeIn("slow");
});

$('#toShopping').click(function(){
    $('#inventory').fadeOut(800);
    $('#shopping-list').delay(800).fadeIn("slow");
});

$('#back-button').click(function(){
    $('#inventory').fadeOut(800);
    $('#shopping-list').fadeOut(800);
    $('#back-button').fadeOut(800);
    $('#shopping-button').delay(800).fadeIn("slow");
    $('#inventory-button').delay(800).fadeIn("slow");
});