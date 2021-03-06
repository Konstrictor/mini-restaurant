var panier = {};

function templatePanier(id, name, prix, quantite){
	total=prix*quantite;
	return`
	<tr class="panier-item" data-id="${id}">
		<td class="panier-name">${name}</td>
		<td class="panier-prix">${prix}</td>
		<td class="panier-quantite">${quantite}</td>
		<td class="panier-total">${total}</td>
		<td><button class="panier_moins">-</button></td>
		<td><button class="panier_plus">+</button></td>
	</tr>
	`
}
$("#panier").on('click', '.panier_plus', function(event) {
	event.preventDefault();
	$item = $(this).parents(".panier-item");
	$quantite = $item.find(".panier-quantite");
	quantite = parseInt($quantite.text())+1;
	$total = $item.find(".panier-total");
	prix = parseInt($item.find(".panier-prix").text());
	$quantite.text(quantite);
	$total.text(quantite*prix);

	$recette_qtt.text(recette_qtt);
	panier[$item.attr('data-id')].quantite=quantite;

	calculateTotal();
});

$("#panier").on('click', '.panier_moins', function(event) {
	event.preventDefault();
	event.stopPropagation();
	$item = $(this).parents(".panier-item");
	$quantite = $item.find(".panier-quantite");
	quantite = parseInt($quantite.text())-1;
	if(quantite>0){
		$total = $item.find(".panier-total");
		prix = parseInt($item.find(".panier-prix").text());
		$quantite.text(quantite);
		$total.text(quantite*prix);
		panier[$item.attr('data-id')].quantite=quantite;
	}else{
		$item.remove();
		delete(panier[$item.attr('data-id')]);
	}
	calculateTotal();
});

$("#valider-panier").on('click', function(event) {
	if(!$.isEmptyObject(panier)){
		$.ajax({
			url: window.location.pathname,
			type: 'POST',
			dataType: 'json',
			headers : {"X-CSRFToken":$.cookie("csrftoken")},
			data: JSON.stringify(panier),
		})
		.done(function(data) {
			// window.location=window.location;
			window.location ="/";
		})
		.fail(function() {
			console.log("error");
		})
		.always(function() {
			console.log("complete");
		});
	}
});

$("#valider_imprimer").on('click', function(event) {
	if(!$.isEmptyObject(panier)){
		$.ajax({
			url: window.location.pathname,
			type: 'POST',
			dataType: 'json',
			headers : {"X-CSRFToken":$.cookie("csrftoken")},
			data: JSON.stringify(panier),
		})
		.done(function(data) {
			printDiv(data);
		})
		.fail(function() {
			console.log("error");
		})
		.always(function() {
			console.log("complete");
		});
	}
});

$("#toggle-panier").on('click', function(event) {
	event.preventDefault();
	$panier = $("#panier");
	if(!($panier.hasClass('active'))){
		$panier.find('tbody').empty();
		for(var [id, item] of  Object.entries(panier)){
			$panier.find('tbody').append(templatePanier(id, item.name,item.prix,item.quantite));
		}
		$panier.addClass('active');
	}
	calculateTotal();
});

$recette_plus = $(".recette_plus");
$recette_moins = $(".recette_moins");

$recette_plus.on('click', function(event) {
	$recette = $(this).parents(".recette");
	$recette_qtt = $recette.find(".recette_qtt");
	recette_qtt = parseInt($recette_qtt.text())+1;
	recette_id = $recette.attr('data-id');
	recette_name = $recette.find(".name").text();
	recette_prix = $recette.find(".prix").text();
	item = {"name":recette_name, "quantite":recette_qtt, "prix":recette_prix};
	$recette_qtt.text(recette_qtt);
	panier[recette_id] = item;
});

$recette_moins.on('click', function(event) {
	$recette = $(this).parents(".recette");
	$recette_qtt = $recette.find(".recette_qtt");
	recette_qtt = parseInt($recette_qtt.text())-1;
	if(recette_qtt>0){
		recette_id = $recette.attr('data-id');
		recette_name = $recette.find(".name").text();
		recette_prix = $recette.find(".prix").text();
		item = {"name":recette_name, "quantite":recette_qtt, "prix":recette_prix};
		
		$recette_qtt.text(recette_qtt);
		panier[recette_id] = item;
	}else{
		$recette_qtt.text(0);
		recette_name = $recette.find(".name").text();
		delete(panier[recette_id]);
	}
});

function calculateTotal(){
	$panier = $(".panier-item");
	total = 0;
	for(let panier_item of $panier){
		total += parseInt($(panier_item).find('.panier-total').text());
	}
	$("#total").text(total)
}

function templateFacture(facture){
	console.log(facture.date);
	date = new Date(facture.date).toLocaleDateString("fr-FR",{year: 'numeric', month: 'long', day: 'numeric'})
 	str_lignes_facture=`
<tr>
<td>
Facture no. ${facture.id+" "+date}<br/>
Serveur: <b>${facture.serveur}</b><br/><br/>
</td>
</tr>
<tr>
<td>
RC .......................<br/>
NIF .......................<br/>
Tel: 79 991 419 / 75 790 436<br/>
FIDODIDO BAR-RESTAURANT<br/>
Chaussée PL Rwagasore<br/>
Rohero 1 Quartier INSS<br/><br/>
</tr>
</td>
<td><b>${facture.table}</b></td>
</tr>
<tr>
<td>
<table style="width:100%;">
<tbody>
<tr>
<th style="border-bottom: 1px solid #aaa;text-align: left;">Article</th>
<th style="border-bottom: 1px solid #aaa;text-align: left;">P.U.</th>
<th style="border-bottom: 1px solid #aaa;text-align: left;">Qt.</th>
<th style="border-bottom: 1px solid #aaa;text-align: right;">Total</th>
</tr>`;
 	for(var item of facture.factures){
		str_lignes_facture += `
		<tr>
			<td>${item.name}</td>
			<td>${item.prix}</td>
			<td> x ${item.quantite}</td>
			<td style="text-align:right">&nbsp;${item.total}</td>
		</tr>`
	}
	str_lignes_facture +=`
<tr>
<th style="border-top: 1px solid #aaa;text-align: left;">Total</th>
<th style="border-top: 1px solid #aaa;text-align: left;">&nbsp;</th>
<th style="border-top: 1px solid #aaa;text-align: left;">&nbsp;</th>
<th style="border-top: 1px solid #aaa;text-align: right;"><b>${facture.total}</b></th>
</tr>
</tbody>
</table>
</td>
</tr>
<tr>
<td>Caissier ${facture.caissier}</td>
</tr>
<tr>
<br/>
<td style="text-align: center;"><strong>Merci</strong></td>
</tr>
`;
	return str_lignes_facture;
}
function printDiv(object_facture) { 
	str_facture = templateFacture(object_facture);
	$("#printable-body").html(str_facture);

	var a = window.open('', '', 'height=500, width=1000'); 
	a.document.write($("#printable").html()); 
	a.document.close(); 
	a.print();
 //    a.close();
	// window.location ="/"
}