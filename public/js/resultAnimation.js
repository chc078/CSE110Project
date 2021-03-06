
$( document ).ready(function() {
	var search_query = window.location.hash.substring(1);
	$(".search-container").find('input[name="name"]').val(search_query);
	console.log(search_query);
    if(search_query.length == 0){}
    else {
        if (search_query) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "http://api.yummly.com/v1/api/recipes?_app_id=f690d55a&_app_key=5a8f8f5fd0032df11eefecbe8dda2dbc&q=" + search_query + "&requirePictures=true&maxTotalTimeInSeconds=3600&nutrition.ENERC_KCAL.max=500", false);
            xhr.send();
            var responseString = JSON.parse(xhr.responseText);
            getMatches(responseString.matches);
        }
    }
	
});
$(".search-container").keypress(function(e) {
	
    if(e.which === 13) {
    	call_api();
    }
});
$("#get_result").click(function(){
	call_api();
});
$("#t_range").click(function(){
	var time = document.getElementById("t_range").value;
	$(".t-value").html(time);
});
$("#c-range").click(function(){
	var cal = document.getElementById("c-range").value;
	$(".c-value").html(cal);
});
$("#t_range").click(function(){
    var time = document.getElementById("t_range").value;
    $(".t-value").html(time);
    time = time * 60;
});
$("#c-range").click(function(){
    var cal = document.getElementById("c-range").value;
    $(".c-value").html(cal);
});
function call_api(){
    var formData;
    var Cusines="";
    var Courses="";
    var Calories="";
    var Time_cost="";


    var time = document.getElementById("t_range").value*60;
    var max_time_param="&maxTotalTimeInSeconds="+time;
    var calorie=document.getElementById("c-range").value;
    var max_calorie="&nutrition.ENERC_KCAL.max="+calorie;
    console.log(max_calorie);
    console.log(max_time_param);
    if(document.getElementById('c1').checked) {
        Cusines+="&allowedCuisine[]=cuisine^cuisine-chinese";
    }
    if(document.getElementById('c2').checked) {
        Cusines+="&allowedCuisine[]=cuisine^cuisine-mexican";
    }
    if(document.getElementById('c3').checked) {
        Cusines+="&allowedCuisine[]=cuisine^cuisine-thai";
    }
    if(document.getElementById('c4').checked) {
        Cusines+="&allowedCuisine[]=cuisine^cuisine-american";
    }
    if(document.getElementById('c5').checked) {
        Cusines+="&allowedCuisine[]=cuisine^cuisine-indian";
    }
    if(document.getElementById('c6').checked){
        Cusines+="&allowedCuisine[]=cuisine^cuisine-kid-friendly&allowedCuisine[]=cuisine^cuisine-italian&allowedCuisine[]=cuisine^cuisine-asian&allowedCuisine[]=cuisine^cuisine-southern&allowedCuisine[]=cuisine^cuisine-french&allowedCuisine[]=cuisine^cuisine-barbecue-bbq&allowedCuisine[]=cuisine^cuisine-greek&allowedCuisine[]=cuisine^cuisine-english&allowedCuisine[]=cuisine^cuisine-spanish&allowedCuisine[]=cuisine^cuisine-japanese";
    }
    if(document.getElementById('c7').checked) {
        Cusines+="&allowedCuisine[]=cuisine^cuisine-italian";
    }
    if(document.getElementById('c8').checked) {
        Cusines+="&allowedCuisine[]=cuisine^cuisine-english";
    }
    if(document.getElementById('c9').checked) {
        Cusines+="&allowedCuisine[]=cuisine^cuisine-french";
    }
    if(document.getElementById('c10').checked) {
        Cusines+="&allowedCuisine[]=cuisine^cuisine-japanese";
    }
    if(document.getElementById('c11').checked) {
        Cusines+="&allowedCuisine[]=cuisine^cuisine-greek";
    }





    //############################################
    if(document.getElementById('m1').checked) {
        Courses+="&allowedCourse[]=course^course-Appetizers";
    }
    if(document.getElementById('m2').checked) {
        Courses+="&allowedCourse[]=course^course-Breakfast%20and%20Brunch";
    }
    if(document.getElementById('m3').checked) {
        Courses+="&allowedCourse[]=course^course-Side%20Dishes"
    }
    if(document.getElementById('m4').checked) {
        Courses+="&allowedCourse[]=course^course-Main%20Dishes"
    }
    if(document.getElementById('m5').checked) {
        Courses+="&allowedCourse[]=course^course-Lunch"
    }
    if(document.getElementById('m6').checked) {
                                   //course^course-Salads
        Courses+="&allowedCourse[]=course^course-Salads"
    }
    if(document.getElementById('m7').checked) {
        Courses+="&allowedCourse[]=course^course-Desserts";
    }

    if(document.getElementById('m8').checked) {
        Courses+="&allowedCourse[]=course^course-Soups&allowedCourse[]=course^course-Beverages&allowedCourse[]=course^course-Condiments%20and%20Sauces&allowedCourse[]=course^course-Cocktails";
    }

	
	
	

	//############################################

    formData = $(".search-container").find('input[name="name"]').val();
    console.log(formData);
    console.log(Cusines);
    console.log(Courses);

    var xhr = new XMLHttpRequest();
    var request = "http://api.yummly.com/v1/api/recipes?_app_id=f690d55a&_app_key=5a8f8f5fd0032df11eefecbe8dda2dbc&q=";
    var criteria = formData+Cusines+Courses+max_time_param+max_calorie+"&requirePictures=true";
    console.log(criteria);
    var encoded_request = criteria;
    console.log(request+encoded_request);
    xhr.open("GET",request+encoded_request , false);
    xhr.send();
    var responseString = JSON.parse(xhr.responseText);
    getMatches(responseString.matches);
    
}

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
    console.log(arr);
    var out = "";
    var i;
    for(i = 0; i < arr.length; i++) {
        var url = arr[i].smallImageUrls[0];
        url=url.substring(0,url.length-2);
        url=url+"1000";
        //<a href="http://localhost:3000/individualRecipes.html#"+arr[i].id>
        //out += '<div class="box">' + '<div class="boxInner">' + '<img id='+arr[i].id+'src=' + arr[i].smallImageUrls[0] +'></a>'+
        //	'<div class="titleBox">' +arr[i].recipeName+ '</div>' +'</div>'+'</div>'
        out += '<div class="box">' + '<div class="boxInner">' + '<img id='+arr[i].id +' src=' + url +' onclick= "redirect(this)"'+'>'+
            '<div class="titleBox">' +arr[i].recipeName+ '</div>' +'</div>'+'</div>'
        //console.log(out);
        //out += '<li>' + '<img src='+arr[i].smallImageUrls[0]+'>'+arr[i].recipeName+'<p hidden>' + arr[i].id+'</p></li><br>';
    }

    $(".response").empty();
    $(".response").html(out);

}
function redirect(img){
    window.location.href = 'individualRecipes' + '#' + img.id;
    console.log(id);
}