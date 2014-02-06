<?php 
ini_set('display_errors', 1);
error_reporting(E_ALL);
require('Nebulous.php');

$query = isset( $_GET['q']) ? $_GET['q'] : "";

$arParams = array(
    "view" => "full",
    "hasPhoto"=>"true",
    "classId"=>"356953",
    "minPrice"=>0,
);

$testing = (TOL_Nebulous::getInstance()->getCycles($arParams));



$response = array();
foreach( $testing["result"] as $ad)
{
	$filtered = array();
	$filtered["make"] = $ad["makeDisplayName"];
	$filtered["model"] = $ad["modelDisplayName"];
	$filtered["year"] = $ad["year"];
	$filtered["price"] = $ad["price"];
	$filtered["photo"] = $ad["photos"][0]["urls"]["550x410"];
	$response[] = $filtered;

}

//echo json_encode($testing);
foreach ($response as $ad) {

		echo "<img src='{$ad['photo']}'>";	
	
}

// echo json_encode(array("count"=>count($response), "response"=>$response));
/*
foreach($testing as $test)
{
	echo json_encode($test);
}

	
*/



?>