var server = "http://revistamoto.com/m/www/app/";
var portadas = "http://revistamoto.com/m/www/portadas/";

server = "http://192.168.2.4/webservicesmotos/";

var sistemaPago = "http://192.168.2.4/revistaPago/openpay.php";
var db = null;
var app = {
	// Application Constructor
	initialize: function() {
		this.bindEvents();
	},
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	bindEvents: function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},
	// deviceready Event Handler
	//
	// The scope of 'this' is the event. In order to call the 'receivedEvent'
	// function, we must explicitly call 'app.receivedEvent(...);'
	onDeviceReady: function() {
		try{
			db = openDatabase({name: "motos.db"});
			console.log("Conexión desde phonegap OK");
			createDataBase(db);
		}catch(err){
			db = window.openDatabase("motos.db", "1.0", "Just a Dummy DB", 200000);
			createDataBase(db);
			console.log("Se inicio la conexión a la base para web");
		}
		
		createDataBase();
		home();
	
		$("#btnHome").click(function(){
			home();
		});
		
		$("#btnContacto").click(function(){
			$.get("vistas/contacto.html", function(resp){
				$("#modulo").html(resp);
				
				$("#frmContacto").submit(function(){
					alertify.log("Espera un momento en lo que enviamos tu mensaje");
					$("#frmContacto").find("[type=submit]").prop("disabled", true);
					$.post(server + "contacto.php", {
						"correo": $("#txtCorreo").val(),
						"nombre": $("#txtNombre").val(),
						"asunto": $("#txtAsunto").val(),
						"mensaje": $("#txtMensaje").val()
					}, function(resp){
						$("#frmContacto").find("[type=submit]").prop("disabled", false);
						if (resp.band){
							$("#frmContacto")[0].reset();
							alertify.success("El mensaje se envió con éxito... espera respuesta muy pronto");
						}else
							alertify.error("Lamentablemente el mensaje no pudo ser enviado, por favor intentalo más tarde");
					}, "json");
				});
			});
		});
		
		$("#btnLogin").click(function(){
			$.get("vistas/login.html", function(resp){
				$("#modulo").html(resp);
				
				$("#modulo form").submit(function(){
					alertify.log("Estamos validando tus datos");
					$("#modulo form").find("[type=submit]").prop("disabled", true);
					
					$.post(server + "login.php", {
						"usuario": $("#txtCorreo").val(),
						"contrasena": $("#txtPass").val()
					}, function(resp){
						$("#modulo form").find("[type=submit]").prop("disabled", false);
						
						if (resp.band){
							alertify.success("Bienvenido");
							window.localStorage.removeItem("usuario");
							window.localStorage.setItem("usuario", $("#txtCorreo").val());
							window.localStorage.removeItem("suscripcion");
							window.localStorage.setItem("suscripcion", resp.suscripcion);
							
							$("#btnLogin").hide();
							$("#btnPerfil").show();
							
							home();
						}else{
							alertify.error("Tus datos son incorrectos, por favor verificalos");
							$("#txtCorreo").focus();
						}
					}, "json");
				});
			});
		});
		
		$("#btnPerfil").click(function(){
			$.get("vistas/perfil.html", function(resp){
				resp = $(resp);
				var usuario = window.localStorage.getItem("usuario");
				var suscripcion = window.localStorage.getItem("suscripcion");
				
				resp.find("[campo=usuario]").html(usuario);
				resp.find("[campo=suscripcion]").html(suscripcion == ''?"Sin suscripción":suscripcion);
				
				$("#winDatos").find(".modal-body").html(resp);
				if (suscripcion == '')
					$("#btnMembresia").show();
				else
					$("#btnMembresia").hide();
					
				$("#winDatos").modal();
			});
		});
		
		$("#btnLogout").click(function(){
			logout();
		});
		
		function home(){
			//storekit.restore();
			
			var i= 0;
			var usuario = window.localStorage.getItem("usuario");
			if (usuario == undefined){
				$("#btnLogin").show();
				$("#btnPerfil").hide();
			}else{
				$("#btnLogin").hide();
				$("#btnPerfil").show();
			}
			
			$.get("vistas/inicio.html", function(resp){
				$("#modulo").html(resp);
				//Este es el buscador
				$("#txtFiltro").keyup(function(){
					var texto = $("#txtFiltro").val().toUpperCase();
					
					$(".revista").each(function(){
						el = $(this);
						if (texto == '')
							el.show();
						else if (el.find("[campo=descripción]").text().toUpperCase().search(texto) >= 1)
							el.show();
						else
							el.hide();
					});
				});
				
				
				//Se obtienen todas las revistas
				$.get(server + 'getRevistas.php', function(revistas){
					$.get("vistas/revista.html", function(resp){
						var suscripcion = window.localStorage.getItem("suscripcion");
						
						$.each(revistas, function(i, revista){
							var plantilla = resp;
							plantilla = $(plantilla);
						
							$.each(revista, function(key, value){
								plantilla.find("[campo=" + key + "]").html(value);
							})
							
							plantilla.find("img[imagen]").attr("src", portadas + revista.edicion + ".jpg");
							
							$("#modulo").append(plantilla);
							
							plantilla.find("a.ver").hide();
							plantilla.find("a.comprar").hide();
							
							plantilla.find("a.comprar").attr("edicion", revista.edicion);
							
							db.transaction(function(tx){
								tx.executeSql("select * from revista where edicion = ?", [revista.edicion], function(tx, res){
									if (res.rows.length > 0)
										plantilla.find("a.ver").show();
									else{
										if (revista.estatus == "gratis")
											plantilla.find("a.ver").show();
										else{					
											if (suscripcion != '' && suscripcion != null)
												plantilla.find("a.ver").show();
											else
												plantilla.find("a.comprar").show();
										}
									}
								}, errorDB);
							});
								
							plantilla.find("a.ver").click(function(){
								tx.executeSql("select * from revista where edicion = ?", [revista.edicion], function(tx, res){
									if (res.rows.length <= 0)
										descargarRevista(revista.edicion, revista.link);
									else
										window.openFileNative.open(res.rows[0].ruta);
								}, errorDB);
							});
							
							plantilla.find("a.comprar").click(function(){
								var el = $(this);
								$("#txtOrden").val(el.attr("edicion"));
								$("#revista").attr("src", portadas + revista.edicion + ".jpg");
								$("#winPago").modal({backdrop: false});
							});
						});
					});
				}, "json");
			});
		}
		
		function logout(){
			alertify.confirm("¿Seguro?", function(e){
				if (e){
					window.localStorage.clear();
					$("#btnLogin").show();
					$("#btnPerfil").hide();
					$("#winDatos").modal("hide");
					
					home();
				}
			});
		}
		
		submitPago();
	}
};

//app.initialize();

$(document).ready(function(){
	app.onDeviceReady();
});

function descargarRevista(edicion, link){
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
		var nombre = fs.root.fullPath + "/" + edicion + ".pdf";
		// Parameters passed to getFile create a new file or return the file if it already exists.
		console.log("Iniciando el proceso de descarga");
		fs.root.getFile(nombre, { create: true, exclusive: false }, function (fileEntry) {
			download(fileEntry, link, edicion);
		}, function(){
			console.log("Error al crear el archivo");
		});
	}, function(){
		console.log("Error en requestFileSystem");
	});
}

function download(fileEntry, uri, edicion) {
	var fileTransfer = new FileTransfer();
	var fileURL = fileEntry.toURL();

	fileTransfer.download(
		uri,
		fileURL,
		function (entry) {
			console.log("Successful download...");
			console.log("download complete: " + entry.toURL());
			
			window.openFileNative.open(fileEntry.nativeURL);
			alertify.success("El contenido se ha descargado");
			db.transaction(function(tx){
				tx.executeSql("insert into revista (edicion, ruta) values (?, ?)", [edicion, fileEntry.nativeURL]);
			});
			
			home();
        },
        function (error) {
            console.log("download error source " + error.source);
            console.log("download error target " + error.target);
            console.log("upload error code" + error.code);
            
            alertify.error("Ocurrió un error al descargar");
        },
        null, {
        }
    );
}

function submitPago(){
	OpenPay.setId($("#payment-card").attr("openpayid"));
    OpenPay.setApiKey($("#payment-card").attr("openpaykey"));
    OpenPay.setSandboxMode(true);
    var deviceSessionId = OpenPay.deviceData.setup("payment-card", "deviceIdHiddenFieldName");
    //OpenPay.setProductionMode(true);
    
    $("#deviceIdHiddenFieldName").val(deviceSessionId);
	
	$("#card_number").change(function(){
		$("#card_number").val($("#card_number").val().replace(/\s/g, ""));
	});
	
	$("#payment-card").validate({
		rules: {
			holder_name: "required",
			last_name: "required",
			Email: {
				required: true,
				email: true
			},
			card_number: {
				required: true,
			 	number: true,
			 	maxlength: 16,
			 	minlength: 16
			},
			expiration_month: {
				min: 1,
				max: 12,
				number: true,
				required: true
			},
			expiration_year: {
				required: true,
				number: true,
			},
			cvv2: {
				required: true,
				number: true,
				maxlength: 3,
				minlength:3
			},
			txtLinea1: "required",
			txtCP: {
				required: true,
				maxlength: 5,
				minlength: 5
			},
			txtCiudad: "required",
			txtEstado: "required"
		},
		messages: {
			holder_name: "Este campo es requerido",
			last_name: "Este campo es requerido",
			Email: {
				required: "Este campo es requerido",
				email: "Este no es un email válido"
			},
			card_number: {
				required: "Este campo es requerido",
			 	number: "Solo números",
			 	maxlength: "Son 16 números",
			 	minlength: "Son 16 números"
			},
			expiration_month: {
				min: "No es un mes válido",
				max: "No es un mes válido",
				number: "Solo números",
				required: "Este campo es requerido"
			},
			expiration_year: {
				required: "Este campo es requerido",
				number: "Solo números",
			},
			cvv2: {
				required:  "Este campo es requerido",
				number: "Solo números",
				maxlength: "Deben de ser 3 números",
				minlength: "Deben de ser 3 números"
			},
			txtLinea1: "Este campo es requerido",
			txtCP: "Este campo es requerido y son cinco números",
			txtCiudad: "Este campo es requerido",
			txtEstado: "Este campo es requerido"
		},
		submitHandler: function(form) {
		    //$('#payment-card').find("[type=submit]").prop("disabled", true);
		    OpenPay.token.create({
				"card_number": $("#payment-card").find("#card_number").val(),
				"holder_name": $("#payment-card").find("#holder_name").val() + ' ' + $("#payment-card").find("#last_name").val(),
				"expiration_year":$("#payment-card").find("#expiration_year").val(),
				"expiration_month": $("#payment-card").find("#expiration_month").val(),
				"cvv2": $("#payment-card").find("#cvv2").val(),
				"address":{
					"city": $("#payment-card").find("#txtCiudad").val(),
					"line3": $("#payment-card").find("#txtLinea3").val(),
					"postal_code": $("#payment-card").find("#txtCP").val(),
					"line1": $("#payment-card").find("#txtLinea1").val(),
					"line2": $("#payment-card").find("#txtLinea2").val(),
					"state": $("#payment-card").find("#txtEstado").val(),
					"country_code":"MX"
				}
			}, function(response){
				$('#token_id').val(response.data.id);
				band = true;
				console.log("validado");
				
				$.post(sistemaPago, $(form).serialize(), function(resp){
					$('#payment-card').find("[type=submit]").prop("disabled", false);
					
					if (resp.band){
						alertify.success("Muchas gracias por su pago, la revista se descargará en un momento");
						
						descargarRevista($("#txtOrden").val());
						$("#winPago").modal("hide");
					}else{
						alertify.error("El pago fue rechazado, por favor verifique sus datos");
					}
				}, "json");

		    }, function(response){
		    	$('#payment-card').find("[type=submit]").prop("disabled", false);
		    	band = false;
				alertify.error("Ocurrió un error en la transacción: " + response.data.description);
			});
		}
	});
}

function createDataBase(){
	db.transaction(function(tx){
		//tx.executeSql('drop table if exists tienda');
		
		tx.executeSql('CREATE TABLE IF NOT EXISTS revista (edicion integer primary key, ruta text)', [], function(){
			console.log("Tabla Revistas creada");
		}, errorDB);
	});
}

/*
*
* Error en la base de datos
*
*/

function errorDB(tx, res){
	console.log("Error: " + res.message);
}