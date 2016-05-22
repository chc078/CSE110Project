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
    $("#container, #forgotten-container").fadeOut(800, function(){
        $("#login-button").fadeIn(800);
    });
});

/* Forgotten Password */
$('#forgotten').click(function(){
    $("#container").fadeOut(function(){
        $("#forgotten-container").fadeIn();
    });
});

$(".input-group").keypress(function(e) {
    var formData;
    if(e.which == 13) {
        formData = $(".input-group").find('input[name="name"]').val();
        console.log(formData);
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://api.yummly.com/v1/api/recipes?_app_id=f690d55a&_app_key=5a8f8f5fd0032df11eefecbe8dda2dbc&q="+formData, false);
        xhr.send();
        var responseString=JSON.parse(xhr.responseText);
        //ID can be used to GET the full recipe details.
        //&requirePictures=true  // return recipes with photos
        //console.log(responseString);
        getMatches(responseString.matches);
    }
    
});
function getMatches(arr) {
    var out = "";
    var i;
    for(i = 0; i < arr.length; i++) {
        out += '<li>' + arr[i].recipeName + '</li><br>';
        
    }
    console.log(document.getElementById("response"));
    
    document.open("~/views/SearchResults.jade"); //Replace??
	document.write("<html><body><p>Hello World!</p></body></html>");
	document.close();
    
    //document.getElementById("response").innerHTML = out;
    window.location.href = "../../views/searchResults.jade";
}
