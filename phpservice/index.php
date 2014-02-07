<?php 
require("Bike.php");

?>

<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=1000, initial-scale=1.0, maximum-scale=1.0">
    <style type="text/css">
    	.share_panel{
    		background-color: #EFF0F2;
    		border-radius:6px;
    		text-align:center;
    	}
    </style>
    <!-- Loading Bootstrap -->
    <link href="flatui/bootstrap/css/bootstrap.css" rel="stylesheet">

    <!-- Loading Flat UI -->
    <link href="flatui/css/flat-ui.css" rel="stylesheet">
    <link href="flatui/css/demo.css" rel="stylesheet">

    <link rel="shortcut icon" href="flatui/images/favicon.ico">

    <!-- HTML5 shim, for IE6-8 support of HTML5 elements. All other JS at the end of file. -->
    <!--[if lt IE 9]>
      <script src="flatui/js/html5shiv.js"></script>
      <script src="flatui/js/respond.min.js"></script>
    <![endif]-->
</head>
<body>
<div class="container">
	<hr>
	<div class="row">
		<div class="col-xs-6">
			<img src="<?php echo $motorcylce->photo;?>" width="80%">
		</div>

		<div class="col-xs-6">
				<div class="share_panel">
				<div class="row">
					<div class="col-xs-12">					
						<h4><?php echo "{$motorcylce->year} {$motorcylce->make} {$motorcylce->model}"; ?></h4>
					</div>
				</div>
				<div class="row">
					<div class="col-xs-12">
			          <a class="btn btn-primary" href="<?php echo $motorcylce->url;?>"><span class="fui-eye"></span></a>
			          <a class="btn btn-primary" data-toggle="modal" data-target="#myModal" href="#"><span class="fui-chat"></span></a>
			          <a class="btn btn-primary" href="#fakelink"><span class="fui-heart"></span></a>	
					</div>
				</div>
				<div class="row">
					<div class="col-xs-12">
						<h5>$<?php echo $motorcylce->price;?></h5>
					</div>
				</div>
				</div>
		</div>

	</div>
	<hr>
</div>

<!-- Modal -->
<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
        <h4 class="modal-title" id="myModalLabel">Share via text message</h4>
      </div>
      <div class="modal-body">
		<form>
			<div class="form-group">
				<input class="form-control" type="tel" name="to" id="to" placeholder="Phone number to share to">
			</div>
			<div class="form-group">
				<input class="form-control" type="text" name="from_name" id="from_name" placeholder="Your name">
			</div>
			<input type="hidden" value="<?php echo $motorcylce->url;?>" name="url" id="url">
			<input type="hidden" value="<?php echo $motorcylce->titleToString();?>" name="title" id="title">
		</form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary" id="sendsms" data-dismiss="modal">Send</button>
      </div>
    </div>
  </div>
</div>


<script src="http://code.jquery.com/jquery-1.10.2.min.js"></script>
<script>
$(document).ready(function(){
	$("#sendsms").click(function(){
		var to = $("#to").val();
		var from_name = $("#from_name").val();
		var url = $("#url").val();
		var title = $("#title").val();

		var message = "Your friend " + from_name +  " wants you to checkout this bike: " + url;

		var data = "to=" + to + "&body=" + message;

		$.ajax({
			type: 'POST',
			url: 'twilio.php',
			data: data,
			complete: function(data)
			{
				//$('#myModal').modal('hide');
			},
		}); 
	});
});
</script>
 <!-- Load JS here for greater good =============================-->
    <script src="flatui/js/jquery-ui-1.10.3.custom.min.js"></script>
    <script src="flatui/js/jquery.ui.touch-punch.min.js"></script>
    <script src="flatui/js/bootstrap.min.js"></script>
    <script src="flatui/js/bootstrap-select.js"></script>
    <script src="flatui/js/bootstrap-switch.js"></script>
    <script src="flatui/js/flatui-checkbox.js"></script>
    <script src="flatui/js/flatui-radio.js"></script>
    <script src="flatui/js/jquery.tagsinput.js"></script>
    <script src="flatui/js/jquery.placeholder.js"></script>
    <script src="flatui/js/jquery.stacktable.js"></script>
    <script src="http://vjs.zencdn.net/4.3/video.js"></script>
    <script src="flatui/js/application.js"></script>
</body>
</html>