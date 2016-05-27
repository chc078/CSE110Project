$( document ).ready(function() {
	var search_query = window.location.hash.substring(1);
	console.log(search_query);
	if(search_query){
		var xhr = new XMLHttpRequest();
    	xhr.open("GET", "http://api.yummly.com/v1/api/recipes?_app_id=f690d55a&_app_key=5a8f8f5fd0032df11eefecbe8dda2dbc&q="+ search_query+"&requirePictures=true", false);
    	xhr.send();
    	var responseString = JSON.parse(xhr.responseText);        
    	getMatches(responseString.matches);
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

function call_api(){
	var formData;
	var Cusines="&allowedCuisine[]=cuisine";
	var Courses="&allowedCourse[]=course";
	var Calories="";
	var Time_cost="";
	if(document.getElementById('c1').checked) {
		Cusines+="^cuisine-chinese"
	}
	if(document.getElementById('c2').checked) {
		Cusines+="^cuisine-mexican"
	}
	if(document.getElementById('c3').checked) {
		Cusines+="^cuisine-thai"
	}
	if(document.getElementById('c4').checked) {
		Cusines+="^cuisine-american"
	}
	if(document.getElementById('c5').checked) {
		Cusines+="^cuisine-indian"
	}
	if(document.getElementById('c6').checked){
		Cusines+="^cuisine-kid-friendly^cuisine-italian^cuisine-asian^cuisine-southern^cuisine-french^cuisine-barbecue-bbq^cuisine-greek^cuisine-english^cuisine-spanish^cuisine-japanese"
	}
	//############################################
	if(document.getElementById('m1').checked) {
		Courses+="^course-Appetizers";
	}
	if(document.getElementById('m2').checked) {
		Courses+="^course-Breakfast and Brunch"
	}
	if(document.getElementById('m3').checked) {
		Courses+="^course-Side Dishes"
	}
	if(document.getElementById('m4').checked) {
		Courses+="^course-Main Dishes"
	}
	if(document.getElementById('m5').checked) {
		Courses+="^course-Lunch"
	}
	if(document.getElementById('m6').checked) {
		Courses+="^course-Salads"
	}
	if(document.getElementById('m7').checked) {
		Courses+="^course-Desserts";
	}
	if(document.getElementById('m8').checked) {
		Courses+="^course-Soups^course-Beverages^course-Condiments and Sauces^course-Cocktails";
	}
	

	//############################################

	formData = $(".search-container").find('input[name="name"]').val();
	console.log(Cusines);
	console.log(Courses);
	
	var xhr = new XMLHttpRequest();
	var request = "http://api.yummly.com/v1/api/recipes?_app_id=f690d55a&_app_key=5a8f8f5fd0032df11eefecbe8dda2dbc&q=";
	var criteria = formData+Cusines+Courses;
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
	var out = "";
	var i;
	for(i = 0; i < arr.length; i++) {
		out += '<li>' + '<img src='+arr[i].smallImageUrls[0]+'>'+arr[i].recipeName+'<p hidden>' + arr[i].id+'</p></li><br>';
	}

	$(".response").empty();
	$(".response").html(out);
	
}
