//$( document ).ready(function() {
	$(".search-container").keypress(function(e) {
		
		//"allowedCuisine[]=cuisine^cuisine-american^cuisine-Asian"
	    if(e.which === 13) {
	    	var formData;
			var Cusines="allowedCuisine[]=cuisine";
			var Meals="";
			var Calories="";
			var Time_cost="";
	    	if(document.getElementById('c1').checked) {
	    		Cusines+="^cuisine-Chinese"
			}
			if(document.getElementById('c2').checked) {
				Cusines+="^cuisine-Mexican"
			}
			if(document.getElementById('c3').checked) {
				Cusines+="^cuisine-Thai"
			}
			if(document.getElementById('c4').checked) {
				Cusines+="^cuisine-American"
			}
			if(document.getElementById('c5').checked) {
				Cusines+="^cuisine-Indian"
			}
			//console.log("entered");
	    	formData = $(".search-container").find('input[name="name"]').val();
	    	console.log(Cusines);
	    	
	    	var xhr = new XMLHttpRequest();
	    	
	    	xhr.open("GET", "http://api.yummly.com/v1/api/recipes?_app_id=f690d55a&_app_key=5a8f8f5fd0032df11eefecbe8dda2dbc&q="+ formData+"&allowedCuisine[]="+Cusines, false);
	    	xhr.send();
	    	var responseString = JSON.parse(xhr.responseText);
	        getMatches(responseString.matches);
	        //getRecipe("Vegetarian-Cabbage-Soup-Recipezaar");
	        e.preventDefault();
    		return false;
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
		//console.log("requests");
		$(".response").empty();
		$(".response").html(out);
		//document.getElementsByClassName("response").innerHTML ="";
		//document.getElementsByClassName("response").innerHTML = out;
	}
	

//});