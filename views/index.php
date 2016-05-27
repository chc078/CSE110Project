<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Abril+Fatface" />
    <meta name="viewport" content="initial-scale=1">
    <link rel="stylesheet" type="text/css" href="../public/stylesheets/styleMainPage.css">
    <meta charset="UTF-8">
    <title>foodopia</title>
</head>
<body>

<h1>FOODOPIA</h1>
<h3>Let ELFs take you to an adventure in Foodopia!</h3>

<div class="row">

    <div class="col-lg-6">
        <div class="input-group">
            <input type="text" name="name" class="form-control" placeholder="Search for...">
        </div><!-- /input-group -->
    </div><!-- /.col-lg-6 -->

</div><!-- /.row -->

<div id="login-button">
    <img src="http://dqcgrsy5v35b9.cloudfront.net/cruiseplanner/assets/img/icons/login-w-icon.png">
    </img>
</div>

<div id="container">
    <h2>Log In</h2>
  <span class="close-btn">
    <img src="https://cdn4.iconfinder.com/data/icons/miu/22/circle_close_delete_-128.png">
  </span>

    <form>
        <input type="email" name="email" placeholder="E-mail">
        <input type="password" name="pass" placeholder="Password">
        <a href="#">Foodopia Custom</a>
        <div id="remember-container">
            <input type="checkbox" id="checkbox-2-1" class="checkbox" checked="checked"/>
            <span id="remember">Stay in Foodopia</span>
            <span id="forgotten">Forgotten password</span>
        </div>
    </form>
</div>

<!-- Forgotten Password Container -->
<div id="forgotten-container">
    <h3>Forgotten</h3>
  <span class="close-btn">
    <img src="https://cdn4.iconfinder.com/data/icons/miu/22/circle_close_delete_-128.png">
  </span>

    <form>
        <input type="email" name="email" placeholder="E-mail">
        <a href="#" class="orange-btn">Get new password</a>
    </form>
    
</div>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
<script src='http://cdnjs.cloudflare.com/ajax/libs/gsap/1.16.1/TweenMax.min.js'></script>
<script src='http://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js'></script>
<script src="jquery.redirect.js"></script>
<script type="text/javascript" src="../public/js/mainPageAnimation.js"></script>


</body>
</html>