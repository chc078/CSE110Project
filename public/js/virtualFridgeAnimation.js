/**
 * Created by XavierWang on 16/5/12.
 */
 
$(document).ready(function() {
    setTimeout(function() {
        var search_query=$("#Item_name").html();
        console.log(search_query);
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://api.yummly.com/v1/api/recipes?_app_id=f690d55a&_app_key=5a8f8f5fd0032df11eefecbe8dda2dbc&q="+ search_query+"&requirePictures=true", false);
        xhr.send();
        var responseString = JSON.parse(xhr.responseText);        
        getMatches(responseString.matches);

    }, 1000);
    
    /*
    
    */
    
});
function getMatches(arr) {
    console.log(arr);
    var out = "";
    var i;
    for(i = 0; i < arr.length; i++) {
        var url = arr[i].smallImageUrls[0];
        url=url.substring(0,url.length-2);
        url=url+"1000";
        
        out += '<div class="box">' + '<div class="boxInner">' + '<img id='+arr[i].id +' src=' + url +' onclick= "redirect(this)"'+'>'+
            '<div class="titleBox">' +arr[i].recipeName+ '</div>' +'</div>'+'</div>'
        
    }

    $("#what_can_I_cook").empty();
    $("#what_can_I_cook").html(out);

}

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