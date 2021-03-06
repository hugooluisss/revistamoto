var server = "http://revistamoto.com/m/www/app/";
//var server = "http://192.168.2.4/webservicesmotos/";
var portadas = "http://revistamoto.com/m/www/portadas/";
var sistemaPago = "http://revistamoto.com/m/www/app/";
var suscripcionGeneral = false;

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
				
				$("#modulo #btnRegistro").click(function(){
					$("#winRegistro").modal();
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
				suscripcion = suscripcionGeneral;
				
				resp.find("[campo=usuario]").html(usuario);
				resp.find("[campo=suscripcion]").html(suscripcionGeneral == ''?"Sin suscripción":suscripcion);
				
				$("#winDatos").find(".modal-body").html(resp);
				if (suscripcionGeneral == false)
					$("#btnMembresia").show();
				else
					$("#btnMembresia").hide();
					
				$("#winDatos").modal();
				
				$("#btnMembresia").click(function(){
					$("#revista").hide();
					
					storekit.purchase("suscripcion");
				});
				
				$("#terminosCondiciones").click(function(){
					$("#winTerminosCondiciones").modal("show");
				});
			});
		});
		
		$("#btnLogout").click(function(){
			logout();
		});
		
		function home(){
			var i= 0;
			var usuario = window.localStorage.getItem("usuario");
			var suscripcion = window.localStorage.getItem("suscripcion");
			console.log("Usuario: " + usuario);
			if (usuario == '' || usuario == null || usuario === undefined){
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
						
						if (el.attr("busqueda") == 1){
							if (texto == '')
								el.show();
							else if (el.find("[campo=descripción]").text().toUpperCase().search(texto) >= 1)
								el.show();
							else
								el.hide();
						}
					});
				});
				
				
				//Se obtienen todas las revistas
				$.get(server + 'getRevistas.php', function(revistas){
					$.get("vistas/revista.html", function(resp){
						var ediciones = new Array;
						//var suscripcion = window.localStorage.getItem("suscripcion");
						var contRevistas = 0;
						
						ediciones.push("suscripcion");
						
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
							plantilla.find(".fa-spin").hide();
							plantilla.hide();
							
							plantilla.addClass("edicion" + revista.edicion);
							plantilla.find("a.comprar").attr("productId", revista.edicion);
							plantilla.find("a.comprar").attr("edicion", "edicion" + revista.edicion);
							plantilla.find("a.comprar").attr("direccion", revista.link);
							plantilla.find("a.ver").attr("direccion", revista.link);
							
							if (revista.estatus == "gratis"){
								plantilla.find("a.ver").show();
								plantilla.show();
								plantilla.attr("busqueda", 1);
							}else{
								ediciones.push("edicion" + revista.edicion);
								plantilla.find("a.comprar").show();
								plantilla.attr("busqueda", 0);
							}

							plantilla.find("a.ver").click(function(){
								console.log(revista);
								window.open('https://docs.google.com/viewer?url=' + revista.link, '_blank', 'location=no');
								/*db.transaction(function(tx){
									tx.executeSql("select * from revista where edicion = ?", [revista.edicion], function(tx, res){
										if (res.rows.length <= 0)
											window.open('https://docs.google.com/viewer?url=' + revista.link, '_blank', 'location=yes');
										else{
											console.log(res.rows);
											window.open('https://docs.google.com/viewer?url=' + revista.link, '_blank', 'location=yes');
										}
									}, errorDB);
								});*/
							});
							
							plantilla.find("a.comprar").click(function(){
								var el = $(this);
								console.info("Comprando " + el.attr("edicion"));
								
								storekit.purchase(el.attr("edicion"));
							});
						});
						
						var bandSuscripcion = false;
						storekit.init({
							debug:    true, // Enable IAP messages on the console
							ready:    function(){ 
								 /*puede ser un array de strings ['pro1',['prod2'],...*/
								console.log(ediciones);
								storekit.load(ediciones, function (products, invalidIds) {
									//se deben cargar los productos de la tienda para poder usarlos después			     
									console.log(products, invalidIds);
									
									$.each(products, function(i, product){
										$("." + product.id).show();
										if($("." + product.id).find("a.ver:hidden").length > 0){
											$("." + product.id).find("a.comprar").html($("." + product.id).find("a.comprar").html() + "(" + product.price + ")");
											$("." + product.id).find("a.comprar").show();
											$("." + product.id).attr("busqueda", 1);
										}
									});
									
									$.each(invalidIds, function(i, product){
										$("." + product).hide();
										$("." + product.id).attr("busqueda", 0);
									});
								});
							},
							purchase: function (transactionId, productId, receipt){
								if (productId == 'suscripcion'){
									bandSuscripcion = false;
									
									//$("a.ver").show();
									//$("a.comprar").hide();
									suscripcionGeneral = true;
									
									$("#winDatos").modal("hide");
								}else{
									//esta función se ejecuta cuando el usuario realizar una compra
									console.info("Producto comprado " + productId);
									var edicion = productId.substring(7, productId.length);
									var link = $("." + productId).find("a.comprar").attr("direccion");
									window.open('https://docs.google.com/viewer?url=' + revista.link, '_blank', 'location=no');
									/*
									db.transaction(function(tx){
										tx.executeSql("select * from revista where edicion = ?", [edicion], function(tx, res){
											if (res.rows.length <= 0)
												descargarRevista(edicion, link);
											else{
												(res.rows.item(0).ruta, '_blank');
												window.openFileNative.open(res.rows.item(0).ruta);
											}
										}, errorDB);
									});*/
								}
							},
							restore: function (transactionId, productId, transactionReceipt) {
								//esta función obtiene los productos anteriormente consumidos, así el usuario no paga nuevamente por algo que ya compró
								if (productId == "suscripcion"){
									suscripcionGeneral = true;
									
									$("a.ver").show();
									$("a.comprar").hide();
								}else{
									console.info("Restauracion: " + productId);
									
									var edicion = productId.substring(7, productId.length);
									var link = $("." + productId).find("a.comprar").attr("direccion");
									
									if (link == "" || link === undefined)
										console.log("Error, no se tiene la dirección de descarga de " + productId);
									else{
										console.info(edicion + " encontrada");
										/*
										db.transaction(function(tx){
											tx.executeSql("select * from revista where edicion = ?", [edicion], function(tx, res){
												if (res.rows.length <= 0)
													alertify.confirm("Se encontró que la edición " + edicion + " ya la compraste pero no está descargada en el dispositivo ¿Deseas iniciar su descarga?", function(e){
														if (e){
															console.info(edicion, link);
															descargarRevista(edicion, link);
														}
													});
											}, errorDB);
										});
										*/
									}
								}
							},
							error: function (errorCode, errorMessage) {
								//callback de un error< ocurrido
								alertify.error("<b>No se pudo conectar con la tienda de iTunes</b><br />");
								//alert('Error: ' + errorMessage);
							}
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
			alertify.success("El contenido de la edición" + edicion + " se cargará en un momento");
			
			window.open('https://docs.google.com/viewer?url=http://revistamoto.com/m//www/dw/amgss63/' + edicion + '.pdf', '_blank', 'location=no');
			/*
			var fileTransfer = new FileTransfer();
			var fileURL = fileEntry.toURL();
			$(".edicion" + edicion).find(".fa-spin").show();
			$(".edicion" + edicion).find(".avance").html("0%");
			
			statusDom = $(".edicion" + edicion).find(".avance").html("0%");
			
			fileTransfer.onprogress = function(progressEvent) {
				if (progressEvent.lengthComputable) {
					var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
					statusDom.html(perc + "%");
					console.log(perc);
				} else {
				    if(statusDom.html() == "") {
				    	statusDom.html("Descargando");
					} else {
						statusDom.html(statusDom.html() + ".");
					}
				}
			};
			
			fileTransfer.download(
				uri,
				fileURL,
				function (entry) {
					window.open(fileEntry.nativeURL, '_system');
					//window.openFileNative.open(fileEntry.nativeURL);
					//window.fileOpener.open(fileEntry.nativeURL);
					
					alertify.success("El contenido de la edición" + edicion + " se ha descargado");
					$(".edicion" + edicion).find(".fa-spin").hide();
					db.transaction(function(tx){
						tx.executeSql("insert into revista (edicion, ruta) values (?, ?)", [edicion, fileEntry.nativeURL], function(){
							$(".edicion" + edicion).find("a.comprar").hide();
							$(".edicion" + edicion).find("a.ver").show();
							//home();
						});
					});
					
					statusDom.html("");
		        },
		        function (error) {
		        	$(".edicion" + edicion).find(".fa-spin").hide();
		            console.log("download error source " + error.source);
		            console.log("download error target " + error.target);
		            console.log("upload error code" + error.code);
		            
		            alertify.error("Ocurrió un error al descargar");
		            
		            statusDom.html("");
		        },
		        null, {
		        }
		    );*/
		}
		
		function createDataBase(){
			db.transaction(function(tx){
				tx.executeSql('drop table if exists revista');
				
				tx.executeSql('CREATE TABLE IF NOT EXISTS revista (edicion integer primary key, ruta text)', [], function(ts, res){
					//tx.executeSql('delete from revista');
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
	}
};

app.initialize();

$(document).ready(function(){
	$("a").click(function(){
		$("#menuConfig").hide("slow");
	});
	
	$("#menuConfig").hide();
	
	$(".menuConfiguracion").click(function(){
		if ($("#menuConfig").css("display") == 'none')
			$("#menuConfig").show("slow");
		else
			$("#menuConfig").hide("slow");
	});
	
	$("#menuConfig").find(".politica").click(function(){
		$("#winTerminosCondiciones").modal("show");
		$("#menuConfig").hide("slow");
	});
	
	$("#menuConfig").find(".restaurarCompras").click(function(){
		$("#menuConfig").hide("slow");
		
		storekit.restore();
	});
	
	$.ajaxSetup({
		error: function(jqXHR, textStatus, errorThrown) {
			if (navigator.connection.type == Connection.NONE)
				alertify.error("No existe conexión a internet, para el correcto funcionamiento de la aplicación es necesario contar con internet");
			else
				alertify.error("No se pudo establecer conexión con el servidor, verifica tu conexión a internet");
			
			$("#over").css("display", 'none');
			$("#fade").css("display", 'none');
		}
	});
	
	//app.onDeviceReady();
});