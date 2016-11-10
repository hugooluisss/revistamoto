window.storekit.init({

    debug: true, /* Because we like to see logs on the console */

    purchase: function (transactionId, productId) {
        console.log('purchased: ' + productId);
    },
    restore: function (transactionId, productId) {
        console.log('restored: ' + productId);
    },
    restoreCompleted: function () {
        console.log('restoreCompleted');
    },
    restoreFailed: function (errCode) {
        console.log('Restore Failed: ' + errCode);
    },
    error: function (errno, errtext) {
        console.log('Failed: ' + errtext);
    },
    ready: function () {
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
    }
});