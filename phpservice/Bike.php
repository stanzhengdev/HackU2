<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
require('Nebulous.php');

class Motorcycle{

	public $make = null;

	public $model = null;

	public $year = null;

	public $price = null;

	public $photo = null;

	public $url = null;

	public function __construct($data = array())
	{
		if (isset( $data["makeDisplayName"]) )  $this->make = $data["makeDisplayName"];
		if (isset( $data["modelDisplayName"]) )  $this->model = $data["modelDisplayName"];
		if (isset( $data["year"]) )  $this->year = $data["year"];
		if (isset( $data["price"]) )  $this->price = $data["price"];
		if (isset( $data["photos"]) )  $this->photo = $data["photos"][0]["urls"]["550x410"];
		if (isset( $data["adDetailUrl"]) )  $this->url = $data["adDetailUrl"];
	}

	public function titleToString()
	{
		return "{$this->year} {$this->make} {$this->model}";
	}
};

$arParams = array(
    "view" => "full",
    "hasPhoto"=>"true",
    "classId"=>"356953",
    "minYear"=>"2014",
    "minPrice"=>0,
);

$testing = (TOL_Nebulous::getInstance()->getCycles($arParams));
//echo json_encode($testing);



$ad_index = rand(0, (count($testing["result"])-1));
$ad = $testing["result"][$ad_index];
$motorcylce = new Motorcycle($ad);


//echo json_encode($motorcylce);

?>