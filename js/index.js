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
							window.open(revista.link, "_blank", "location=no");
						});

						$("#modulo").append(plantilla);
					});
				});
			}, "json");
		});
	}
});