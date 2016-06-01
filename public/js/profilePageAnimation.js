
$('#taste').hide();
$('#sensitive').hide();
$('#basic').hide();
$('#alwaysInFridge').hide();
$('#back-button').hide();



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
