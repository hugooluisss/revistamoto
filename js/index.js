//var server = "http://192.168.2.4/webservicesmotos/";
//var portadas = "http://192.168.2.1/motosAnterior/portadas/";
var server = "http://10.0.0.5/webservicesmotos/";
var portadas = "http://10.0.0.5/motosAnterior/portadas/";

$(document).ready(function(){
	//$("body").css("height", screen.height);
	onDeviceReady();
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
			try{
				window.open(nombre, '_system', 'location=no');
				alert("Se abrió");
			}catch(err){
				alert(err.menssage);
			}
			
		},
		function(error) {
			console.log("download error source " + error.source);
			console.log("download error target " + error.target);
			console.log("upload error code" + error.code);
		}
	);
}