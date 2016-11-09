var IAP = {
  list: [ "com.revistamoto.revista01"]
};

IAP.load = function () {
  // Check availability of the storekit plugin
  if (!window.storekit) {
  	alert("Compras no habilitadas");
    console.log("In-App Purchases not available");
    return;
  }
 
  // Initialize
  storekit.init({
    debug:    true, // Enable IAP messages on the console
    ready:    IAP.onReady,
    purchase: IAP.onPurchase,
    restore:  IAP.onRestore,
    error:    IAP.onError
  });
};
 
// StoreKit's callbacks (we'll talk about them later)
IAP.onReady = function () {
	storekit.load(IAP.list, function (products, invalidIds) {
		IAP.products = products;
		IAP.loaded = true;
		for (var i = 0; i < invalidIds.length; ++i) {
			console.log("Error: could not load " + invalidIds[i]);
			alert("Error: could not load " + invalidIds[i]);
		}
	});
};
IAP.onPurchase = function (transactionId, productId, receipt) {
	if (productId === 'com.revistamoto.revista01')
		Coins.add(10);
	
	alert('Congratulation, you know own ' +	Coins.get() + ' coins');
};
IAP.onRestore = function () {
	alert("Restaurando");
};
IAP.onError = function () {
	alert("Error en la compra");
};

IAP.buy = function (productId) {
	storekit.purchase(productId);
};

var renderIAPs = function (el) {
	if (IAP.loaded) {
		var coins10  = IAP.products["com.revistamoto.revista01"];
		var html = "<ul>";
		for (var id in IAP.products) {
			var prod = IAP.products[id];
			html += "<li>" + 
			"<h3>" + prod.title + "</h3>" +
			"<p>" + prod.description + "</p>" +
			"<button type='button' " + "onclick='IAP.buy(\"" + prod.id + "\")'>" + prod.price + "</button>" + "</li>";
		}
		html += "</ul>";
		el.append(html);
		alert(html);
	}
	else {
		alert("Error");
		el.append("In-App Purchases not available.");
    }
};