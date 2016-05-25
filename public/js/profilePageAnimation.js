
 $('#taste').hide();
 $('#senstive').hide();
 $('#basic').hide();
 $('#back-button').hide();


$('#UserInfo').click(function(){
    $('#UserInfo').fadeOut(100);
    $('#Appetite').fadeOut(100);
    $('#Allergy').fadeOut(100);
    $('#alwaysInMyFridge').fadeOut(100);
    $('#basic').fadeIn(100);
    $('#back-button').fadeIn(100);
   



});




$('#Appetite').click(function(){
    $('#taste').fadeIn(100);
    $('#UserInfo').fadeOut(100);
    $('#Appetite').fadeOut(100);
    $('#Allergy').fadeOut(100);
    $('#alwaysInMyFridge').fadeOut(100);
    $('#back-button').fadeIn(100);
   



});


$('#Allergy').click(function(){
    $('#senstive').fadeIn(100);
    $('#UserInfo').fadeOut(100);
    $('#Appetite').fadeOut(100);
    $('#Allergy').fadeOut(100);
    $('#alwaysInMyFridge').fadeOut(100);
    $('#back-button').fadeIn(100);
   



});



$('#AlwaysInMyFridge').click(function(){
   
    $('#UserInfo').fadeOut(100);
    $('#Appetite').fadeOut(100);
    $('#Allergy').fadeOut(100);
    $('#AlwaysInMyFridge').fadeOut(100);
    $('#back-button').fadeIn(100);
   



});


