/*placeholder*/
$(document).ready(function(){
        $.Placeholder.init({ color : "#797979" });
 });
 
 $(document).ready(function () {
						var count = $('#carousel .item').length;
						for (var i=0; i<count; i++) {
							$('#carousel .carousel-indicators').append('<li data-target="#carousel" data-slide-to="'+i+'"'+(i ? '' : 'class="active"')+'></li>');
						}
					});
					
	
