window.storekit.init({

    debug: true, /* Because we like to see logs on the console */

    purchase: function (transactionId, productId) {
        console.log('purchased: ' + productId);
        alert("Purchased");
    },
    restore: function (transactionId, productId) {
        console.log('restored: ' + productId);
        alert("Restaurando");
    },
    restoreCompleted: function () {
        console.log('restoreCompleted');
        alert("Restore");
    },
    restoreFailed: function (errCode) {
        console.log('Restore Failed: ' + errCode);
        alert("Restore falló");
    },
    error: function (errno, errtext) {
        console.log('Failed: ' + errtext);
        alert("error" + errtext);
    },
    ready: function () {
    	alert("entrando al ready");
        var productIds = [
            "com.revistamoto.revista01"
        ];
        window.storekit.load(productIds, function(validProducts, invalidProductIds) {
            $.each(validProducts, function (i, val) {
            	var mensaje = "id: " + val.id + " title: " + val.title + " val: " + val.description + " price: " + val.price;
                console.log(mensaje);
                alert(mensaje);
            });
            
            if(invalidProductIds.length) {
            	var mensaje = "Invalid Product IDs: " + JSON.stringify(invalidProductIds);
                console.log(mensaje);
                alert(mensaje);
            }
        });
        
        alert("Saliendo del ready");
    }
});