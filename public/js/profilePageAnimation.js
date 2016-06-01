
$('#taste').hide();
$('#sensitive').hide();
$('#basic').hide();
$('#alwaysInFridge').hide();
$('#back-button').hide();

$("#bitter").click(function(){
    var bitter = document.getElementById("bitter").value;
    //$(".c-value").html(cal);
});

$("#sweet").click(function(){
    var sweet = document.getElementById("sweet").value;
    //$(".c-value").html(cal);
});

$("#salty").click(function(){
    var salty = document.getElementById("salty").value;
   // $(".c-value").html(cal);
});

$("#meaty").click(function(){
    var meaty = document.getElementById("meaty").value;
   // $(".c-value").html(cal);
});

$("#piqant").click(function(){
    var piqant = document.getElementById("piqant").value;
   // $(".c-value").html(cal);
});

$("#sour").click(function(){
    var sour = document.getElementById("sour").value;
});

$("#save").click(function(){
    var myName = document.getElementById('name').innerHTML;

    $scope.user = User.$get({username: myName});
});




$('#UserInfo').click(function(){
    $('#function-container').fadeOut(100);
    $('#basic').delay(100).fadeIn(100);
    $('#back-button').delay(100).fadeIn(100);
});


$('#Appetite').click(function(){
    $('#function-container').fadeOut(100);
    $('#taste').delay(100).fadeIn(100);
    $('#back-button').delay(100).fadeIn(100);
});


$('#Allergy').click(function(){
    $('#function-container').fadeOut(100);
    $('#sensitive').delay(100).fadeIn(100);
    $('#back-button').delay(100).fadeIn(100);
});


$('#alwaysInMyFridge').click(function(){
    $('#function-container').fadeOut(100);
    $('#alwaysInFridge').delay(100).fadeIn(100);
    $('#back-button').delay(100).fadeIn(100);
});


 $('#back-button').click(function(){
     $('#taste').fadeOut(100);
     $('#basic').fadeOut(100);
     $('#sensitive').fadeOut(100);
     $('#alwaysInFridge').fadeOut(100);
     $('#function-container').delay(100).fadeIn(100);
     $('#home').delay(100).fadeIn(100);
     $('#back-button').delay(100).fadeOut(100);

 });
