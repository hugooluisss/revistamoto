var server = "http://revistamoto.com/m/www/app/";
var portadas = "http://revistamoto.com/m/www/portadas/";
var sistemaPago = "http://revistamoto.com/m/www/app/";

server = "http://192.168.2.4/webservicesmotos/";
sistemaPago = "http://192.168.2.4/webservicesmotos/";

var db = null;
var precioRevista = "26.00";
var precioSuscripcion = "179.00";

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
				
				$("#modulo #frmLogin").submit(function(){
					alertify.log("Estamos validando tus datos");
					$("#modulo form").find("[type=submit]").prop("disabled", true);
					
					$.post(server + "login.php", {
						"usuario": $("#frmLogin").find("#txtCorreo").val(),
						"contrasena": $("#frmLogin").find("#txtPass").val()
					}, function(resp){
						$("#modulo #frmLogin").find("[type=submit]").prop("disabled", false);
						
						if (resp.band){
							alertify.success("Bienvenido");
							window.localStorage.removeItem("usuario");
							window.localStorage.setItem("usuario", $("#frmLogin").find("#txtCorreo").val());
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
				
				$("#modulo #frmRegistro").submit(function(){
					alertify.log("Estamos validando tus datos");
					$("#frmRegistro").find("[type=submit]").prop("disabled", true);
					
					$.post(server + "registro.php", {
						"usuario": $("#frmRegistro").find("#txtCorreo").val(),
						"contrasena": $("#frmRegistro").find("#txtPass").val()
					}, function(resp){
						$("#frmRegistro").find("[type=submit]").prop("disabled", false);
						
						if (resp.band){
							alertify.success("Sus datos fueron registrados con éxito... a continuación inicie sesión");
							
							$("#frmLogin").find("#txtCorreo").val($("#frmRegistro").find("#txtCorreo").val());
							$("#winRegistro").modal("hide");
						}else{
							alertify.error("Tu cuenta de correo ya está registrada, intenta iniciando sesión o con otra cuenta");
							$("#txtCorreo").focus();
						}
					}, "json");
				});
				
				$("#btnRecuperarPass").click(function(){
					alertify.prompt("Introducce tu correo electrónico", function (e, str) { 
						if (e){
							alertify.log("Estamos consultando tus datos en el servidor, por favor espera");
							$.post(server + "recuperarPass.php", {
								"usuario": str
							}, function(resp){
								alertify.success("Enviamos un correo electrónico a tu cuenta con tus datos de acceso");
							});
						}
					});
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
				
				$("#btnMembresia").click(function(){
					$("#revista").hide();
					
					$("#winPago").find("#txtMonto").text("$ " + precioSuscripcion);
					$("#winPago").find(".modal-title").text("Compra de suscripción");
					$("#winPago").find("#txtOrden").val("");
					$("#winPago").find("#email2").val(window.localStorage.getItem("usuario"));
					$("#winPago").find("#Email").val(window.localStorage.getItem("usuario"));
					$("#winPago").modal({backdrop: false});
					
					
					$("#winRegistro").modal();
				});
			});
		});
		
		$("#btnLogout").click(function(){
			logout();
		});
		
		function home(){
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
								db.transaction(function(tx){
									tx.executeSql("select * from revista where edicion = ?", [revista.edicion], function(tx, res){
										if (res.rows.length <= 0)
											descargarRevista(revista.edicion, revista.link);
										else{
											console.log(res.rows);
											window.open(res.rows.item(0).ruta, '_blank');
											window.openFileNative.open(res.rows.item(0).ruta);
										}
									}, errorDB);
								});
							});
							
							plantilla.find("a.comprar").click(function(){
								var el = $(this);
								alert(el.attr("edicion"));
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

		function descargarRevista(edicion, link){
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
				var nombre = fs.root.fullPath + "/" + edicion + ".pdf";
				// Parameters passed to getFile create a new file or return the file if it already exists.
				alertify.log("Iniciando el proceso de descarga");
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
					console.log(fileEntry);
					console.log(entry);
					console.log(entry.toURL());
					window.open(fileEntry.nativeURL, '_blank');
					window.openFileNative.open(fileEntry.nativeURL);
					alertify.success("El contenido se ha descargado");
					db.transaction(function(tx){
						tx.executeSql("insert into revista (edicion, ruta) values (?, ?)", [edicion, fileEntry.nativeURL], function(){
							home();
						});
					});
					
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
		
		function createDataBase(){
			db.transaction(function(tx){
				tx.executeSql('drop table if exists revista');
				
				tx.executeSql('CREATE TABLE IF NOT EXISTS revista (edicion integer primary key, ruta text)', [], function(ts, res){
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
		
		comprarRevista();
		
		function comprarRevista(){
			inAppPurchase
				.getProducts(['com.revistamoto.appios.edicion160', 'com.yourapp.prod2', ...])
				.then(function (products) {
					console.log(products);
					/*
					[{ productId: 'com.yourapp.prod1', 'title': '...', description: '...', price: '...' }, ...]
					*/
				});
  .catch(function (err) {
    console.log(err);
  });
			/*
			store.verbosity = store.DEBUG;
			
			store.register({
				id: "com.revistamoto.appios.edicion160",
				alias: "edicion160",
				type: store.NON_CONSUMABLE
			});
			
			store.ready(function() {
				console.log("\\o/ STORE READY \\o/");
			});
			
			store.refresh();
			*/
			/*
			var p = store.get("edicion160");
			if (p.state === store.REGISTERED)
				console.log("Edicion 160 Válida");
				
				
			store.order("edicion160");
			
			store.when("product").updated(function (p) {
				console.log(p);
			});
			
			store.when("edicion160").updated(function (p) {
				console.log(p);
			});
			
			// Log all errors
			store.error(function(error) {
				alert('ERROR ' + error.code + ': ' + error.message);
			});
			
			
			store.when("com.revistamoto.appios.edicion160").approved(function(product){
				// synchronous
				product.finish();
				console.log("Probando");
				console.log(product);
			});
			*/
		}
	}
};

app.initialize();

$(document).ready(function(){
	//app.onDeviceReady();
});


