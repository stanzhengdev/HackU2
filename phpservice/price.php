<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
include "Nebulous.php";
$userBikeMake = '';
$userBikeModel = '';
if (isset($_GET['make'])) {
    $userBikeMake = $_GET['make'];
}

if (isset($_GET['model'])) {
    $userBikeModel = $_GET['model'];
}

$userBikeYear = null;
if (isset($_GET['year'])) {
    $userBikeYear = $_GET['year'];
}

if ($userBikeMake != NULL || $userBikeModel != NULL) {
    getAveragePrice($userBikeMake, $userBikeModel, $userBikeYear);
} else {
    echo json_encode(array());
}

function getAveragePrice($bikeMake, $bikeModel, $bikeYear) {
    $i = 0;
    $total = 0;
    $minPrice = 0;
    $maxPrice = 0;
    $minYear = 0;
    $maxYear = 0;
    $categories = array();
    $arParams = array(
        "makeDisplayName" => $bikeMake,
        "modelDisplayName" => $bikeModel,
        "view" => "full"
    );
    if ($bikeYear != null) {
        $arParams['minYear'] = $bikeYear;
        $arParams['maxYear'] = $bikeYear;
    }
    $testing = (TOL_Nebulous::getInstance()->getCycles($arParams));
    foreach ($testing["result"] as $cycle) {
        if (!empty($cycle["price"])) {
            if ($minPrice == 0) {
                $minPrice = $cycle["price"];
                $maxPrice = $cycle["price"];
            }
            if ($minYear == 0) {
                $minYear = $cycle['year'];
                $maxYear = $cycle['year'];
            }
            if ($cycle["price"] < $minPrice) $minPrice = $cycle["price"];
            if ($cycle["price"] > $maxPrice) $maxPrice = $cycle["price"];
            if ($cycle["year"] < $minYear) $minYear = $cycle["year"];
            if ($cycle["year"] > $maxYear) $maxYear = $cycle["year"];
            $total = $total + $cycle["price"];
            $i++;
        }
        if (isset($cycle['categoryName']) && $cycle['categoryName'] != '') {
            if (isset($categories[$cycle['categoryName']])) {
                $categories[$cycle['categoryName']]++;
            } else {
                $categories[$cycle['categoryName']] = 1;
            }
        }
    }
    if ($i == 0) {
        if ($bikeYear != null) {
            getAveragePrice($bikeMake, $bikeModel, null);
        }
        return;
    }
    echo json_encode(
        array(
            "Make" => $bikeMake,
            "Model" => $bikeModel,
            "Average Cycletrader.com Price" => "$" . number_format(round($total / $i)),
            "Min Price" => $minPrice,
            "Max Price" => $maxPrice,
            "Min Year" => $minYear,
            "Max Year" => $maxYear,
            "Categories" => $categories,
       )
   );
}
/*

Sample javascript
$.ajax({
'url' : 'price.php',
'dataType':'json',
data: {
    make: 'Honda',
    model: 'Gold Wing',
    year: 2012
},
success: function(data){
$('input#price').val(data.Price);
console.log(data.Price);
}
});

*/
?>
