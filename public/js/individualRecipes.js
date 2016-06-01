$(document).ready(function () {

    var recipe_id = window.location.hash.substring(1);
    $(".search-container").find('input[name="name"]').val(recipe_id);
    console.log(recipe_id);
    if(recipe_id){
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://api.yummly.com/v1/api/recipe/"+recipe_id +"?_app_id=f690d55a&_app_key=5a8f8f5fd0032df11eefecbe8dda2dbc", false);
        xhr.send();
        var responseString = JSON.parse(xhr.responseText);
        //getMatches(responseString.matches);
        //getNutrition(response.matches);
        var pageURL = getUrl(responseString);
        var ingredient_arr = getIngredients(responseString);
        var image = getImage(responseString.images);
        var name = recipe_id;
    }
    else{
        var pageURL = "http://www.pillsbury.com/recipes/ground-beef-tacos/7217b5cb-5bdc-4458-a6e4-844a39188b9c";
        var image = "https://upload.wikimedia.org/wikipedia/commons/7/73/001_Tacos_de_carnitas,_carne_asada_y_al_pastor.jpg";
        var name = "Tacos"
    }

    //Pass url to pageURL
    $('#foodPage').attr('src', pageURL);

    //Pass recipe image to image

    $('#foodImage').attr('src', image);

    //Ingredients need to be passed
    for(var i=0;i<ingredient_arr.length;i++){
        $('#ingredientList').append('<p>' + ingredient_arr[i] + '</p><br>');
    }

    $('#recipeName').html(name);

    $('.cookingButton').click(function () {

    });
});

function getUrl(arr){
    return arr.source.sourceRecipeUrl;
}
function getIngredients(arr){
    return arr.ingredientLines;
}
function getImage(arr){
    //console.log("here" + arr.images.hostedLargeUrl);
    var img = arr[0].hostedLargeUrl;
    return img;
}