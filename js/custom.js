var utm_source = ((location.search+'').match(/utm_source=(\w+)/) ? RegExp.$1 : '');
var utm_campaign = ((location.search+'').match(/utm_campaign=(\w+)/) ? RegExp.$1 : '');
var ref = (document.referrer+'').match(/\/\/([^\/]+)/) ? RegExp.$1 : '';
var from = ((document.cookie+'').match(/f=(\w+)/) ? RegExp.$1 : '');
var phones = {
	'organic' : '8 (495) 374-74-76',
	'ads': '8 (495) 374-74-77'
}; 

var organic = ['yandex.ru','google.ru', 'google.com', 'google.ua', 'yandex.ua', 'm.yandex.ru', 'images.yandex.ru', 'blogs.yandex.ru', 'video.yandex.ru', 'go.mail.ru', 'm.go.mail.ru', 'mail.ru', 'google.com.ua', 'images.google.ru', 'maps.google.ru', 'nova.rambler.ru', 'm.rambler.ru', 'gogo.ru', 'nigma.ru', 'search.qip.ru', 'webalta.ru', 'sm.aport.ru', 'akavita.by', 'meta.ua', 'search.bigmir.net', 'search.tut.by', 'all.by', 'search.i.ua', 'index.online.ua', 'web20.a.ua', 'search.ukr.net', 'search.com.ua', 'search.ua', 'poisk.ru', 'go.km.ru', 'liveinternet.ru', 'gde.ru', 'affiliates.quintura.com'];
document.cookie =  'from=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;';		

function initPhone() {
	if (!from) {
		if (!utm_source) {
			for (var i=0; i<organic.length; i++) {
				if ((ref+'').match(organic[i])) {
					from = 'organic';
					break;
				}
			}
			if (!from) {
				from = (ref+'').replace(/^.*?([^\.]+\.\w+)$/, '$1');
			}
		}
		else {
			from = 'ads';
		}
		from = from ? from : 'bookmarks';
		document.cookie = "f="+from+"; path=/";
	}
	
	if (phones[from]) {
		$('.phone.geo_msk').html(phones[from]);
	}
//	if (utm_source == 'yandex') {
//		var phone = (utm_campaign == 'market') ? '<span>(495)</span> 374-74-76' : '<span>(495)</span> 374-74-77';
//		$('.phone.geo_msk').html(phone);
//	}

/*
	if (utm_source == 'yandex' && utm_campaign == 'market') {
		var phone = '<span>(495)</span> 374-74-76';
		$('.phone.geo_msk').html(phone);
	}
*/
}

function regionSetup() {
	var cookie = (document.cookie+'').match(/region=([\w\s]+)/)  ? RegExp.$1 : '';
	
	var r = ((window.ymaps && ymaps.geolocation) ? ymaps.geolocation.region : cookie) || 'Moscow';
	if (!(r+'').match(/moscow/i)) {
		$('.geo_region').show();
		$('.geo_msk').hide();
	}
	
	if (window.ymaps && ymaps.geolocation) {
		document.cookie = "region="+ymaps.geolocation.region+"; path=/";
	}
	else if (!cookie) {
		$('body').append('<script type="text/javascript" src="https://api-maps.yandex.ru/2.0-stable/?load=package.map&lang=en_US&onload=regionSetup"></script>');
	}
}

$(document).ready(function () {
	regionSetup();
	initPhone();
	
	$( ".navbar-form .btn" ).click(function() {
	  $( ".navbar-form" ).submit();
	});
	$( ".search-code .btn" ).click(function() {
	  $( ".search-code" ).submit();
	});	
	
	$('[data-toggle="tooltip"]').tooltip();
	var $podbor = $('.podbor .podbor-col>.list-group-item');
	if ($podbor.length > 1) {
		 $('.podbor .podbor-col:last-child').append($podbor.splice(Math.ceil($podbor.length / 2), Math.floor($podbor.length / 2)));
	}
	
	$('.rur').each(function () {$(this).replaceWith('<span class="glyphicon glyphicon-ruble"></span>');});

	$('.podbor .values a input, .podbor .values span input').click(function (event) {
		event.stopPropagation();
		if (this.checked) {
			$(this).parent().addClass('active');
		}
		else {
			$(this).parent().removeClass('active');
			
		}
	});

	$('.dropdown-toggle[data-toggle="dropdown"]').attr('href', '#');
	$('.podbor .values a, .podbor .values span').click(function (event) {
		event.preventDefault();
		var el =$(this).find('input').get(0);
		if (el.checked) {
			$(el).removeAttr('checked');
		}
		else {
			el.checked = true;
		}
		if (el.checked) {
			$(this).addClass('active');
		}
		else {
			$(this).removeClass('active');
			
		}
	});
	
	
	$('a[rel="photo"]').fancybox({
		helpers:  {
			title : {
	            type : 'inside'
	        },
	        thumbs : {
	            width: 80,
	            height: 80
	        },
	        buttons	: {}
	}});

	$('#fullview').click(function () {
		$.cookie('fullview', 1, {path: '/'});
		location.reload();
	});
/*
	$('#callback').fancybox({
		width: parseInt($('#callback-form').css('width')),
		height: parseInt($('#callback-form').css('height'))+5,
		autoSize: false,
		padding: 0
	});
	
*/
	$('#callback-form form, #item-feedback form, #itemfeedback-form form').submit(feedbackPost);
	$('#review-form form').submit(function (event) {
		event.preventDefault();
		var $that = $(this);
		$that.find('input[type="submit"]').attr('disabled', true);
		var id = $that.find('input[name="prod_id"]').val();
		var rating = $that.find('select[name="rating"]').val();
		var name = $that.find('input[name="name"]').val();
		if (!id || !name || !rating) {
			alert("Не корректно заполнына форма");
			$that.find('input[type="submit"]').removeAttr('disabled');	
			return;
		}

		$.post('/new_review/', $that.serialize(), function (data) {
			if (data && data.match(/ok/i)) {
				$that.find('input[type="submit"]').replaceWith("<p>Спасибо за Ваш отзыв! Мы разместим его после проверки</p>");
			}
			else {
				$that.find('input[type="submit"]').removeAttr('disabled');
				alert("Произошла непредвиденная ошибка, пожалуйста повторите попытку позже");
			}
		}).fail(function() { 
			$that.find('input[type="submit"]').removeAttr('disabled');			
			alert("Произошла непредвиденная ошибка, пожалуйста повторите попытку позже");
		});
	});
	$('form[name="filter"]').submit(function (event) {
		$(this).find('input[type="text"]').each(function () {
			if (this.value) {
				$(this).addClass('success');
			}
			else {
				$(this).removeClass('success');
			}
		});
		var p = $(this).find('.success,:checked').serialize();	
		event.preventDefault();
		if (p) {
			location.href = "?"+p;
		}
	});
});

function order(name) {
	$.cookie('order', name, {path: '/'});
	location.reload();
}


function feedbackPost(event) {
	event.preventDefault();

	var has_phone = this.elements.fb_phone;
	var has_mail = this.elements.fb_email;
	var phone_test = 0;
	var mail_test = 0;


	if (has_phone && (has_phone.value+'').match(/[\d\- \(\)\+\.]{7,}/)) {
		phone_test = 1;
	}
	
	if (has_mail && (has_mail.value+'').match(/^\s*[\w\-\.]+\@[\w\-\.]+\s*$/)) {
		mail_test = 1;
	}

	if (!phone_test && !mail_test) {
		if (has_mail) {
			$(has_mail).parent().addClass("has-error");
		}
		if (has_phone) {
			$(has_phone).parent().addClass("has-error");
		}
		return;
	}
	if (this.elements.template && this.elements.template=='callback') {
		met.reachGoal('ZVONOK');
	}
	else if (this.elements.template && this.elements.template=='item') {
		met.reachGoal('FEEDBACK');
	}
	var $submit =$(this).find('.btn-primary');
	$submit.html('Отправка').val('Отправка...').attr("disabled","disabled");
	$.post('/5eed6ack/', $(this).serialize(), function () {
		$submit.replaceWith('Спасибо, мы обязательно c Вами свяжемся');
	});
}


jQuery( document ).ready(function() {


	$("input[name=fb_phone]").mask("(999) 999-9999");

	jQuery('#scrollup img').animate({opacity: 0.5},100);

	jQuery('#scrollup img').mouseover( function(){
		jQuery( this ).animate({opacity: 1},100);
	}).mouseout( function(){
		jQuery( this ).animate({opacity: 0.5},100);
	}).click( function(){
		window.scroll(0 ,0); 
		return false;
	});

	jQuery(window).scroll(function(){
		var full_height = $(document).height();
		var window_height = $(window).height();
		var footer_height = $('footer').height();
		if ( jQuery(document).scrollTop() > 500 && jQuery(document).scrollTop() < (full_height - footer_height * 4)) {
			
			jQuery('#scrollup').fadeIn('fast');
		} else {
		
				jQuery('#scrollup').fadeOut('fast');
			
			
		}

		

	});
});