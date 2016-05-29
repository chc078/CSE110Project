/**
 * Created by ice on 5/18/16.
 */
function validatePass() {
    console.log('running');
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirm").value;
    if (password != confirmPassword) {
        alert("Passwords do not match.");
        return false;
    }
    return true;
}

$(document).click(function(){
    $("#message").fadeOut();
});

$(document).keypress(function(){
    $("#message").fadeOut();
});