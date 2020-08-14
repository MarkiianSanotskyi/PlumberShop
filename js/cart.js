//var delivery_costs = 800;
var delivery_free = 500000;
//var delivery_costs_def = delivery_costs;
var rub = '&nbsp;<span class="glyphicon glyphicon-ruble"></span>';
var noprice = '<span class="small">по запросу</span>';

var delivery_price_after_table = { prefix:"Доставка: ",
									postfix: "&nbsp;<span class=\"glyphicon glyphicon-ruble\"><span>",
									free: "бесплатно" };

var cart = $.cookie("cart");
if (!cart || !cart.match(/\[/)) {
	cart = "[]";
}
cart = eval('(' + cart + ')');

$(document).ready(function () {
	refreshCart();
	bindCartEvents();
	if (cart && cart.length) {
		$('#buy-one-click').remove();
	}
	$('.good-item .cart').click(function () {
		if ($(this).hasClass('checked')) {
//			location.href = '/cart/?rnd='+Math.random();
			$('#cart-modal').modal('show');
		}
		else {
			add2cart($(this).attr('data-id')); 
		}
	});

	$('.p2p_items .cart').click(function () {
		add2cart($(this).attr('data-id')); 
	});
	
	
	$('#item-cart').click(function () {
		addFromProductCart();
	});
	
	for (var i=0; i<cart.length; i++) {
		cartButtonStatus(cart[i].id);
	}

	if (!$('#options td.thumb a').get().length) {
		$('#options td.thumb').remove();
	}
	$('#order-button').fancybox();
	$('#options input').change(function () {
		calcCheck();
	});
	
	$('#order-form select[name="cart_delivery"]').change( deliveryChange );
});


function calcCheck() {
	var sum = 0;
	$('#options input:checked').each(function () {
		var count = parseInt(this.value) || 1;	
		var price = parseFloat(($(this).closest('tr').find('.price').text()+'').replace(/\D/g, ''));
		sum += count * price;
	});
	if (sum > 0) {
		var price = parseFloat(($('#item-top-price').attr('data-price')+'').replace(/\D/g, ''));
		if (!$('#item-calc').length) {
			$('#item-top-price').after('<div id="item-calc"></div>');
		}
		$('#item-calc').html('<p>+&nbsp;'+splitters(sum)+rub + ' дополнительные опции<br><b>Итого: '+splitters(sum+price)+rub + '</b></p>');
	}
	else {
		$('#item-calc').remove();
	}
}

function cartButtonStatus(id) {
	$('.cart[data-id='+id+']').addClass('checked btn-success').removeClass('btn-primary').html('<span class="glyphicon glyphicon-ok"></span> В корзине');
}

function bindCartEvents(parent) {
	parent = parent ? parent+ ' ' : '';
	$(parent + '.minus,.plus').click(function () {
		var $inp = $(this).closest('.input-group').find('input');
		if ($inp.length) {
			$inp.val(parseInt($inp.val()) + ($(this).hasClass('minus') ? -1 : 1));
			$inp.trigger('change');
		}
	});
	$(parent + '.cart input[name="count"]').change(function (event) {
		var item_id = parseInt($(this).attr('data-item_id'));
		var opt_id = parseInt($(this).attr('data-opt_id'));
		var count =  parseInt($(this).val());
		if (count<0) {count = 0};
		for (var i=0;i<cart.length;i++) {
			if (cart[i].id === item_id) {
				if (!opt_id) {
					cart[i].c = count;
					if (!count) {
						if (confirm('Вы хотите удалить позицию из корзины?')) {
							cart.splice(i,1);
							$('.cart tr.item-'+item_id).remove();
						}
						else {
							$('.cart tr.item-'+item_id+' input[name="count"]').val(cart[i].c);
						}
					}
				}
				else {
					for (var j=0;j<cart[i].o.length;j++) {
						if (cart[i].o[j].id === opt_id) {
							cart[i].o[j].c = count;
							if (!count) {
								if (confirm('Вы хотите удалить позицию из корзины?')) {
									cart[i].o.splice(j,1);
									$('.cart tr.opt-'+opt_id).remove();
								}
								else {
									$('.cart tr.opt-'+opt_id+' input[name="count"]').val(cart[i].o[j].c);
								}
								break;
							}
						}
					}
				}
				break;
			}
		}
		$.cookie("cart", stringify(cart), {
			path: '/',
			expires: DateThroughMounth()
		});
		summaryCalc();
	});
	
	$(parent + '.cart .remove').click(function () {
		$(this).closest('tr').find('input[name="count"]').val(0).trigger('change');
	});

}

function deliveryChange() {
	if ($('#order-form select[name="cart_delivery"]').val() != 'Доставка') {
		//$('.summary .delivery')
	}
	
	var delivery_cost = $('#order-form select[name="cart_delivery"]').find(":selected").attr('data-value');
	$('#order-form input[name="cart_delivery_cost"]').val(delivery_cost);

	var delivery_str = delivery_cost > 0 ? (delivery_price_after_table.prefix + delivery_cost + delivery_price_after_table.postfix) : delivery_price_after_table.free;
	$('.delivery-price-after-table').html( delivery_str );
	
	summaryCalc();
}

function addFromProductCart() {
	var items = [];
	
	items[0] = {id: $('#item-cart').attr('data-id'), c: 1};
	
	if ($('#item-cart').hasClass('checked')) {
		$('#cart-modal').modal('show');
		return;
	}
	$('#options input:checked').each(function () {
		var id = ($(this).closest('tr').attr('id') + '').replace('opt-', '');
		var count = parseInt(this.value) || 1;	
		if (!items[0].o) {
			items[0].o = [];
		}
		items[0].o.push({id: id, c: count});	
	});

	for (var j=0; j<items.length; j++) {
		for (i=0; i<cart.length; i++) {
			if (cart[i].id == items[j].id) {
				break;
			}
		}
		
		if (i>=cart.length) {
			cart.push(items[j]);
		}
		else {
			cart[i] = items[j];
		}
	}
	
	cartButtonStatus(items[0].id);
	$('#buy-one-click').remove();

	// met.reachGoal('ADDCART');
	$.cookie("cart", stringify(cart), {
		path: '/',
		expires: DateThroughMounth()
	});
	
	refreshCart();
}

function add2cart(id, o) {
	if (!cart) {
		cart = [];
	}
	
	var i=0;
	for (i=0; i<cart.length; i++) {
		if (cart[i].id === id) {
			break;
		}
	}
	if (!o) {
		o = [];
	}

	if (i>=cart.length) {
		cart[cart.length] = {id: id, c: 1};
		if (o.length > 0) {
			cart[cart.length-1].o = o;
		}
	}
	else {
		cart[i] = {'id': id, 'c': 1, 'o': o};
	}
	
	// met.reachGoal('ADDCART');
	$.cookie("cart", stringify(cart), {
		path: '/',
		expires: DateThroughMounth()
	});

	cartButtonStatus(id);
	refreshCart();
}

function refreshCart() {
	if (!cart.length) {
		$('#cart .btn').html('<span class="glyphicon glyphicon-shopping-cart"></span><small class="hidden-xs"> &nbsp;Корзина пуста</small>');
		return;
	}
	else {
		var count = parseInt($('.cart .summary .count').text());
		var sum = $('.cart .summary .sum').text();
		$('#cart .btn').html( count > 0 ? 
			'<span class="glyphicon glyphicon-shopping-cart"></span> <span class="badge count">'+count+'</span> <small class="hidden-xs"> &nbsp; Корзина <span class="sum">'+sum+'</span>&nbsp;<span class="glyphicon glyphicon-ruble"></span></small>' : '<span class="glyphicon glyphicon-shopping-cart"></span><small class="hidden-xs"> &nbsp;Корзина пуста</small>'

		).addClass('summary');
		$('#cart .btn').removeAttr('href');
		$('#cart .btn').click(function(){
			$('#cart-modal').modal('show');
		});
		$('.little-cart a').removeAttr('href');
		$('.little-cart a').click(function(){
			$('#cart-modal').modal('show');
		});
	}
	//if (location.pathname === '/cart/') {
//		$('#cart .modal').remove();
//		var count = parseInt($('.cart .summary .count').text());
//		var sum = $('.cart .summary .sum').text();
//		$('#cart .btn').html( count > 0 ? 
//			'<span class="glyphicon glyphicon-shopping-cart"></span> <span class="badge count">'+count+'</span> <small class="hidden-xs"> &nbsp; Корзина <span class="sum">'+sum+'</span>&nbsp;<span class="glyphicon glyphicon-ruble"></span></small>' : '<span class="glyphicon glyphicon-shopping-cart"></span><small class="hidden-xs"> &nbsp;Корзина пуста</small>'
//
//		).addClass('summary');
//		return;
//	}
	//$('#cart .btn').html('<span class="glyphicon glyphicon-shopping-cart"></span>&nbsp;<span class="hidden-xs"> Заргузка...</span>');
	
	//$.post('/cartajax/?rnd='+Math.random(), '', function (data) {
//		$('#cart').html(data);
//				
//		var little_data = data.replace(/<small.*small>/, "");
//
//		$('.little-cart').html(little_data);
//		bindCartEvents('#cart');
//	});
}

function DateThroughMounth() {
	var date = new Date();
	date.setTime(date.getTime() + (30*24*3600*1000));
	return date;
}

function splitters(text) {
	text = text + ' ';
	if (text.match(/(\d\d\d\d+)/)) {
		var count = RegExp.$1;
		var count_text = '';
		while (count >= 1) {
			count_text = (count % 1000)+' '+count_text;
			if (count >= 1000) {
			if (count%1000 < 100) {
				count_text = '0'+count_text;
			}
			if (count%1000 < 10) {
				count_text = '0'+count_text;
			}}
			count = parseInt(count/1000);
		}
		return text.replace(/\d\d\d\d+/, count_text);
	}
	return text;
}


function summaryCalc() {
	var sum = 0;
	var count = 0;

	$('table.cart').each(function () {
		sum = 0;
		count = 0;

		$(this).find('tbody tr').each(function () {
			var c = parseInt($(this).find('input[name="count"]').val());
			var price = parseInt(($(this).find('.price').attr('data-price')+'').replace(/\D/, ''));
			count += c;
			sum += c*price;
			$(this).find('.sum').html(splitters((c*price)+'')+rub);
		});
		
	});

	$('.summary .count').html(count);
	$('.summary .sum').html(sum);
	
	var delivery_costs = $('#order-form select[name="cart_delivery"]').find(":selected").attr('data-value');
	
	//var dself = ($('#order-form select[name="cart_delivery"]').length && $('#order-form select[name="cart_delivery"]').val() != 'Доставка') ? 1 : 0;
	if (sum > delivery_free)  {
		$('.summary .delivery').html(dself ? $('#order-form select[name="cart_delivery"]').val()  : 'бесплатно');
		$('.summary .sum-all').html(sum);
	}
	else {
		$('.summary .delivery').html(1*delivery_costs + rub);
		$('.summary .sum-all').html(sum + 1*delivery_costs);
	}
}

function checkForm() {
	var f = document.forms['cart'];
	if (!f.cart_name || !f.cart_name.value || !f.cart_name.value.match(/[a-zA-Zа-яА-Я]/)) {
		alert('Пожалуйста, заполните поле Ф.И.О.');
		$(f.cart_name).parent().addClass('has-error');
		return false;
	}
	if (!f.cart_phone || !f.cart_phone.value || !f.cart_phone.value.match(/\d/)) {
		$(f.cart_phone).parent().addClass('has-error');
		alert('Пожалуйста, заполните поле Телефон');
		return false;
	}
	return true;
}

function stringify(json) {
	//из за ..ядского ие приходится писать вместо JSON.stringify
	var string = "[";
	if (!json || !json.length) {
		return "[]";
	}
	for (var i=0;i<json.length;i++) {
		if (json[i].id && json[i].c >0) {
			string += "{\"id\":"+json[i].id+",\"c\":"+json[i].c;
			if (json[i].o && json[i].o.length) {
				var opt = "";
				for (var j=0; j<json[i].o.length; j++) {
					if (json[i].o[j].id && json[i].o[j].c > 0) {
						opt += "{\"id\":"+json[i].o[j].id+",\"c\":"+json[i].o[j].c+"},";
					}
				}
				opt = opt.replace(/\,$/, '');
				if (opt) {
					string += ",\"o\":["+opt+"]";
				}
			}
			string += "},";
		}
	}
	string = string.replace(/\,$/, '');
	string += "]";
	return string;
}
	