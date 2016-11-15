document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady(){
	home();
	
	$("#btnHome").click(function(){
		home();
	});
	
	$("#btnContacto").click(function(){
		$.get("vistas/contacto.html", function(resp){
			$("#modulo").html(resp);
			
			$("form").submit(function(){
				alertify.log("Espera un momento en lo que enviamos tu mensaje");
				$("form").find("[type=submit]").prop("disabled", true);
				$.post(server + "contacto.php", {
					"correo": $("#txtCorreo").val(),
					"nombre": $("#txtNombre").val(),
					"asunto": $("#txtAsunto").val(),
					"mensaje": $("#txtMensaje").val()
				}, function(resp){
					$("form").find("[type=submit]").prop("disabled", false);
					if (resp.band){
						$("form")[0].reset();
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
			
			$("form").submit(function(){
				alertify.log("Estamos validando tus datos");
				$("form").find("[type=submit]").prop("disabled", true);
				
				$.post(server + "login.php", {
					"usuario": $("#txtCorreo").val(),
					"contrasena": $("#txtPass").val()
				}, function(resp){
					$("form").find("[type=submit]").prop("disabled", false);
					
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
						
						if (revista.estatus == "gratis")
							plantilla.find("a.ver").show();
						else{					
							if (suscripcion != '' && suscripcion != null)
								plantilla.find("a.ver").show();
							else
								plantilla.find("a.comprar").show();
						}
							
						plantilla.find("a.ver").click(function(){
							window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {
								var nombre = fs.root.nativeURL + revista.edicion + ".pdf";
								try{
									fs.root.getFile(nombre, { create: false }, function(){
										window.open(nombre, '_system', 'location=no');
									}, function(){
										download(revista.link, nombre);
									});
								}catch(err){
									alert(err.message);
								}
							});
						});
						
						plantilla.find("a.comprar").click(function(){
							inAppPurchase
								.buy('com.revistamoto.revista01')
								.then(function (data) {
									console.log(data);
								})
								.catch(function (err) {
									console.log(err);
								});
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
	
	inAppPurchase
		.getProducts(['com.revistamoto.revista01'])
		.then(function (products) {
			console.log(products);
			/*
			[{ productId: 'com.yourapp.prod1', 'title': '...', description: '...', price: '...' }, ...]
			*/
		}).catch(function (err) {
			console.log(err);
		});
}