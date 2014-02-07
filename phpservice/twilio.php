<?php

require ('twilio/Services/Twilio.php');

?>
<?php 

error_reporting(E_ERROR | E_WARNING | E_PARSE | E_NOTICE);
$to = $_POST['to'];
$body = $_POST['body'];
$from = "3476947668";


// set your AccountSid and AuthToken from www.twilio.com/user/account
$AccountSid = "AC7e7b178cd40c369db75017daee2d1fad";
$AuthToken = "eb3219f705bcb5a0575ad056229774cf";
 
$client = new Services_Twilio($AccountSid, $AuthToken);
 
$sms = $client->account->sms_messages->create($from, $to, $body
);
 
// Display a confirmation message on the screen
echo "Sent message {$sms->sid}";

?>