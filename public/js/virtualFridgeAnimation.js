/**
 * Created by XavierWang on 16/5/12.
 */

$('#shopping-list').hide();
$('#inventory').hide();

$('#shopping-button').click(function(){
    $('#shopping-button').fadeOut(800);
    $('#inventory-button').fadeOut(800);
    $('#shopping-list').delay(800).fadeIn("slow");
});

$('#inventory-button').click(function(){
    $('#shopping-button').fadeOut(800);
    $('#inventory-button').fadeOut(800);
    $('#inventory').delay(800).fadeIn("slow");
});