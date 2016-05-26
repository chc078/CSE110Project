
$('#taste').hide();
$('#senstive').hide();
$('#basic').hide();
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
    $('#senstive').delay(100).fadeIn(100);
    $('#back-button').delay(100).fadeIn(100);
});



$('#AlwaysInMyFridge').click(function(){
    $('#function-container').fadeOut(100);
    $('#back-button').delay(100).fadeIn(100);
});


 $('#back-button').click(function(){
     $('#taste').fadeOut(100);
     $('#basic').fadeOut(100);
     $('#senstive').fadeOut(100);
     $('#function-container').delay(100).fadeIn(100);
     $('#home').delay(100).fadeIn(100);

 });
