<html>
<head>
    <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Abril+Fatface">
    <meta name="viewport" content="initial-scale=1">
    <link rel="stylesheet" type="text/css" href="../public/stylesheets/styleSearchResults.css">
    <!--link(rel='stylesheet', type='text/css', href='stylesheets/temp.css')-->
    <meta charset="UTF-8">
    <title>Recipe Results</title>
</head>
<div id="headers" class="headers">
    <form class="search-container">
        <h1>FOODOPIA</h1>
        <input type="text" placeholder="Search for..." class="search-bar">
        <!--a(href='#')
        img.search-icon(src='http://www.endlessicons.com/wp-content/uploads/2012/12/search-icon.png')
        -->
    </form>
</div>
<filters id="Filters" class="controls">
    <div id="firstrow" class="row">
        <div class="col col-span-2">
            <div class="icon icon--cuisine"></div>
            <input type="text" placeholder="Cuisines" data-placeholder="What am I feeling like?" data-placeholder-expanded="What am I feeling like?" class="cuisine">
        </div>
        <div class="col col-span-10">
            <input id="c1" type="checkbox" name="cb">
            <label for="c1">Chinese</label>
            <input id="c2" type="checkbox" name="cb">
            <label for="c2">Mexican</label>
            <input id="c3" type="checkbox" name="cb">
            <label for="c3">Thai</label>
            <input id="c4" type="checkbox" name="cb">
            <label for="c4">American</label>
            <input id="c5" type="checkbox" name="cb">
            <label for="c5">Indian</label>
            <input id="c6" type="checkbox" name="cb">
            <label for="c6">Others</label>
        </div>
    </div>
    <div class="row">
        <div class="col col-span-2">
            <div class="icon icon--meal"></div>
            <input type="text" placeholder="Meal" data-placeholder="What am I feeling like?" data-placeholder-expanded="What am I feeling like?" class="meal">
        </div>
        <div class="col col-span-10">
            <input id="m1" type="checkbox" name="cb">
            <label for="m1">Appetizers</label>
            <input id="m2" type="checkbox" name="cb">
            <label for="m2">Breakfast & Brunch</label>
            <input id="m3" type="checkbox" name="cb">
            <label for="m3">Entrees</label>
            <input id="m4" type="checkbox" name="cb">
            <label for="m4">Dinners</label>
            <input id="m5" type="checkbox" name="cb">
            <label for="m5">Lunch</label>
            <input id="m6" type="checkbox" name="cb">
            <label for="m6">Snack</label>
            <input id="m7" type="checkbox" name="cb">
            <label for="m7">Desserts</label>
            <input id="m8" type="checkbox" name="cb">
            <label for="m8">Others</label>
        </div>
    </div>
    <div class="row">
        <div class="col col-span-2">
            <div class="icon icon--calorie"></div>
            <input type="text" placeholder="Calories" class="calories">
        </div>
        <div class="col col-span-4 slider">
            <div class="c-slider">
                <input type="range" value="500" min="0" max="2000" step="10" class="c-range"><span class="c-value">500</span>
            </div>
        </div>
        <div class="col col-span-2">
            <div class="icon icon--time"></div>
            <input type="text" placeholder="Time Cost" class="time">
        </div>
        <div class="col col-span-4 slider">
            <div class="t-slider">
                <input type="range" value="60" min="0" max="180" step="5" class="t-range"><span class="t-value">180</span>
            </div>
        </div>
    </div>
    <button ng-click="filterSearch" class="search">Filter Results
    <button ng-click="clearFilters" id= "Reset" class="clear">Clear Filters

    </button>
</filters>

<div class="wrap">
    <div class="box">
        <div class="boxInner">
            <img src="https://bunge.s3.amazonaws.com/categories/images/000/000/006/content/Super-Cat-Food-Ingredients.jpg?1357968333" />
            <div class="titleBox">Shrimp</div>
        </div>
    </div>
    <div class="box">
        <div class="boxInner">
            <img src="http://www.tinyurbankitchen.com/wp-content/uploads/2009/12/4201400700_f7fcbcf642_o.jpg" />
            <div class="titleBox">Hot Pot</div>
        </div>
    </div>
    <div class="box">
        <div class="boxInner">
            <img src="https://img.buzzfeed.com/buzzfeed-static/static/2015-08/3/16/enhanced/webdr08/enhanced-16478-1438634921-7.jpg" />
            <div class="titleBox">Swedish cookies</div>
        </div>
    </div>
    <div class="box">
        <div class="boxInner">
            <img src="http://static2.businessinsider.com/image/51f03f966bb3f73c7700000b/19-fast-food-hacks-that-will-change-the-way-you-order.jpg" />
            <div class="titleBox">Burger</div>
        </div>
    </div>
    <div class="box">
        <div class="boxInner">
            <img src="http://cdn.pinchofyum.com/wp-content/uploads/Ramen-3.jpg" />
            <div class="titleBox">Ramen :D</div>
        </div>
    </div>
</div>
<div class="response">
    <?php
        echo "<p>".$_POST['result']."</p><br>"; 
    ?>
</div>
</body>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
<script src='//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js'></script>
<script src='http://cdnjs.cloudflare.com/ajax/libs/gsap/1.16.1/TweenMax.min.js'></script>

<script type="text/javascript" src="../public/js/resultsAmination.js"></script>

</html>
<?php
    echo "<p>".$_POST['result']."</p><br>"; 
?>