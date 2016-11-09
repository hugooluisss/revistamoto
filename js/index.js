var server = "http://192.168.2.4/webservicesmotos/";
var portadas = "http://192.168.2.1/motosAnterior/portadas/";
//var server = "http://10.0.0.5/webservicesmotos/";
//var portadas = "http://192.168.2.1/motosAnterior/portadas/";

$(document).ready(function(){
	//$("body").css("height", screen.height);
	home();
	
	$("#btnHome").click(function(){
		home();
	});
	
	$("#btnContacto").click(function(){
		$.get("vistas/contacto.html", function(resp){
			$("#modulo").html(resp);
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
							var paymentDetails = new PayPalPaymentDetails("10.00", "0.00", "0.00");
							var payment = new PayPalPayment("10.00", "MX", "Awesome Sauce", "Sale", paymentDetails);
							
							var clientIDs = {
								"PayPalEnvironmentProduction": "YOUR_PRODUCTION_CLIENT_ID",
								"PayPalEnvironmentSandbox": "YOUR_SANDBOX_CLIENT_ID"
							};
							
							PayPalMobile.init(clientIDs);
							
							PayPalMobile.renderSinglePaymentUI(payment, 
								function(payment){
									console.log("payment success: " + JSON.stringify(payment, null, 4));
									alert(JSON.stringify(payment, null, 4));
								}, 
								function(result){
									console.log(result);
									alert(result);
								}
							);
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
			}
		});
	}
});

function download(uri, nombre){
	var fileTransfer = new FileTransfer();
	var uri = encodeURI(uri);
	
	alertify.log("Por favor espera mientras descargamos ésta edición...");
	
	fileTransfer.download(
		uri,
		nombre,
		function(entry) {
			alertify.log("La descarga está completa");
			window.open(nombre, '_system', 'location=no');
		},
		function(error) {
			console.log("download error source " + error.source);
			console.log("download error target " + error.target);
			console.log("upload error code" + error.code);
		}
	);
}