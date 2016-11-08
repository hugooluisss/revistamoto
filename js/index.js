var server = "http://192.168.2.4/webservicesmotos/";
var portadas = "http://192.168.2.1/motosAnterior/portadas/";

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
					
					if (resp.band)
						alertify.success("Bienvenido");
					else{
						alertify.error("Tus datos son incorrectos, por favor verificalos");
						$("#txtCorreo").focus();
					}
				});
			});
		});
	});
	
	function home(){
		var i= 0;
		$.get("vistas/inicio.html", function(resp){
			$("#modulo").html(resp);
			//Se obtienen todas las revistas
			$.get(server + 'getRevistas.php', function(revistas){
				$.get("vistas/revista.html", function(resp){
					$.each(revistas, function(i, revista){
						var plantilla = resp;
						plantilla = $(plantilla);
					
						$.each(revista, function(key, value){
							plantilla.find("[campo=" + key + "]").html(value);
						})
						
						plantilla.find("img[imagen]").attr("src", portadas + revista.edicion + ".jpg");

						if (revista.estatus == "gratis")
							plantilla.find("a.comprar").hide();
						else
							plantilla.find("a.ver").hide();
							
						plantilla.find("a.ver").click(function(){
							//window.open(revista.link, "_blank", "location=no");
							
							download(revista.link, revista.edicion);
						});

						$("#modulo").append(plantilla);
					});
				});
			}, "json");
		});
	}
});

function download(uri, nombre){
	try{
		var fileTransfer = new FileTransfer();
		var uri = encodeURI(uri);
		var fileURL = cordova.file.applicationStorageDirectory + nombre + ".pdf";
		
		alertify.log("Por favor espera mientras descargamos ésta edición...");
		
		fileTransfer.download(
			uri,
			fileURL,
			function(entry) {
				console.log("download complete: " + entry.toURL());
				alertify.log("La descarga está completa");
				
				cordova.plugins.fileOpener2.open(
					fileURL, 
					'application/pdf', 
					{ 
						error : function(errorObj) { 
							alert('Error status: ' + errorObj.status + ' - Error message: ' + errorObj.message); 
						},
						success : function () {
							alert('file opened successfully');              
						}
					});
			},
			function(error) {
				console.log("download error source " + error.source);
				console.log("download error target " + error.target);
				console.log("upload error code" + error.code);
			}
		);
	}catch(err){
		alert(err.message);
	}
}