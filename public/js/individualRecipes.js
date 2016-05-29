$(document).ready(function () {

    //Elements from JSON replace with actual variable from JSON
    var pageURL = "http://www.pillsbury.com/recipes/ground-beef-tacos/7217b5cb-5bdc-4458-a6e4-844a39188b9c";
    var image = "https://upload.wikimedia.org/wikipedia/commons/7/73/001_Tacos_de_carnitas,_carne_asada_y_al_pastor.jpg";
    var name = "Tacos"
    
    $('#foodPage').attr('src', pageURL);
    $('#foodImage').attr('src', image);
    $('#ingredientList').append('<p>' + "Hello" + '</p>');
    $('#recipeName').html(name);

    $('.cookingButton').click(function () {
        
    });
});
