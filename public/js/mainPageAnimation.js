/**
 * Created by XavierWang on 16/4/27.
 */
$('#login-button').click(function(){
    $('#login-button').fadeOut("slow",function(){
        $("#container").fadeIn();
        TweenMax.from("#container", .4, { scale: 0, ease:Sine.easeInOut});
        TweenMax.to("#container", .4, { scale: 1, ease:Sine.easeInOut});
    });
});

$(".close-btn").click(function(){
    TweenMax.from("#container", .4, { scale: 1, ease:Sine.easeInOut});
    TweenMax.to("#container", .4, { left:"0px", scale: 0, ease:Sine.easeInOut});
    $("#container, #forgotten-container, #signup-container").fadeOut(800, function(){
        $("#login-button").fadeIn(800);
    });
});

/* Forgotten Password */
$('#forgotten').click(function(){
    $("#container").fadeOut(function(){
        $("#forgotten-container").fadeIn();
    });
});
function getRecipe(id) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://api.yummly.com/v1/api/recipe/" + id + "?_app_id=f690d55a&_app_key=5a8f8f5fd0032df11eefecbe8dda2dbc", false);
    xhr.send();
    var responseString=JSON.parse(xhr.responseText);
    getNutrition(responseString);
    
}

$(".input-group").keypress(function(e) {
    var formData;
    //var unirest = require('unirest');
    if(e.which === 13) {
        formData = $(".input-group").find('input[name="name"]').val();
        console.log(formData);
        window.location.href = './searchResults.html' + '#' + formData;
    }
    
});

function getNutrition(arr){
    var nutrition = "";
    var i;
    var nutrition_vec = arr.nutritionEstimates;
    for(i = 0;i<nutrition_vec.length;i++){
        nutrition+=nutrition_vec[i].description+":"+nutrition_vec[i].value+" "+nutrition_vec[i].unit.pluralAbbreviation+"\n";
    }
    console.log(nutrition);
}
function getMatches(arr) {
    var out = "";
    var i;
    for(i = 0; i < arr.length; i++) {
        out += '<li>' + '<img src='+arr[i].smallImageUrls[0]+'>'+arr[i].recipeName+'<p hidden>' + arr[i].id+'</p></li><br>';
        
    }
    //$.redirect("./searchResults.html",{ result:out},"POST");    
}


function getRecipe(id) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://api.yummly.com/v1/api/recipe/" + id + "?_app_id=f690d55a&_app_key=5a8f8f5fd0032df11eefecbe8dda2dbc", false);
    xhr.send();
    var responseString=JSON.parse(xhr.responseText);
    getNutrition(responseString);

}

$(".input-group").keypress(function(e) {
    var formData;
    //var unirest = require('unirest');
    if(e.which === 13) {
        formData = $(".input-group").find('input[name="name"]').val();
        console.log(formData);
        window.location.href = 'searchResults' + '#' + formData;
    }

});

function getNutrition(arr){
    var nutrition = "";
    var i;
    var nutrition_vec = arr.nutritionEstimates;
    for(i = 0;i<nutrition_vec.length;i++){
        nutrition+=nutrition_vec[i].description+":"+nutrition_vec[i].value+" "+nutrition_vec[i].unit.pluralAbbreviation+"\n";
    }
    console.log(nutrition);
}

function getMatches(arr) {
    var out = "";
    var i;
    for(i = 0; i < arr.length; i++) {
        out += '<li>' + '<img src='+arr[i].smallImageUrls[0]+'>'+arr[i].recipeName+'<p hidden>' + arr[i].id+'</p></li><br>';
    }
}

$(document).click(function(){
    $("#message").fadeOut();
});

$(document).keypress(function(){
    $("#message").fadeOut();
});


$('#register').click(function(){
    $('#container').fadeOut("slow",function(){
        $("#signup-container").fadeIn();
    });
});

