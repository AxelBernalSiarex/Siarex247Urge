<%@page import="com.siarex247.utils.Utils"%>
<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>

<%
	response.setHeader("Cache-Control", "no-Cache");
	response.setHeader("Pragma", "No-cache");
%>

    
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>

<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
	
  <script src='/siarex247/jsp/estatusXML/exportarXML/nomina/exportarNomina.js?v=<%=Utils.VERSION%>'></script>
      
</head>

<div class="card mb-3" style="box-shadow: none; margin-bottom: 0rem !important;">

	
	<div class="card-body bg-light pt-0" style="padding-top: 10px !important;">

		<form id="frmExportXML_Nomina_Exportar" class="was-validated" novalidate>
		   <div id="overSeccionCA_Nomina_Exportar" class="overlay" style="display: none;text-align: right;">
				<img src="/siarex247/img/loading.gif" style="width: 30px; height: 30px;"> Procesando...
			</div>
			
			<div class="p-2 pb-0">
				<div class="mb-2 row">
					<label class="col-sm-2 col-form-label" for="tipoExportacion" id="NOMINA_EXPORTAR_EXPORTARXML_ETQ1">Tipo de Exportacion</label>
					<div class="col-sm-4">
						<div class="form-group">
							<select class="form-select" id="NOMINA_EXPORTAR_tipoExportacion" name="tipoExportacion" onchange="cambiarModo_Nomina_Exportar(this.value);">
								 <option value="TEXTO" id="NOMINA_EXPORTAR_EXPORTARXML_ETQ2">Por Archivo de Texto</option>
                                 <option value="RFC" id="NOMINA_EXPORTAR_EXPORTARXML_ETQ3">Por RFC</option>
                                 <option value="XML" id="NOMINA_EXPORTAR_EXPORTARXML_ETQ4">Por XML</option>
                                 
							</select>
						</div>
					</div>
				</div>
				<div id="NOMINA_EXPORTAR_divBusquedaRFC">
				
					<div class="mb-2 row">
						<label class="col-sm-2 col-form-label" for="NOMINA_EXPORTAR_rfcEmpleado" id="NOMINA_EXPORTAR_EXPORTARXML_ETQ5">RFC</label>
						<div class="col-sm-4">
							<div class="form-group">
							<select class="form-select" id="NOMINA_EXPORTAR_rfcEmpleado" name="rfcEmpleado">
							    <option value="">Seleccione una opci&oacute;n ...</option>
							</select>
							</div>
						</div>
					</div>
								
				
				
				     <div class="mb-2 row">
						<label class="col-sm-2 col-form-label" for="NOMINA_EXPORTAR_fechaInicial" id="NOMINA_EXPORTAR_EXPORTARXML_ETQ6">Fecha Inicio</label>
		            	<div class="col-sm-4">
		        	       <div class="form-group">
		    	             <input class="form-control datetimepicker flatpickr-input active" id="NOMINA_EXPORTAR_fechaInicial" name="fechaInicial" type="text" placeholder="dd/mm/yyyy" data-options='{"disableMobile":true}' readonly="readonly"/>
			               </div>
			            </div>
					</div>

					<div class="mb-2 row">
						<label class="col-sm-2 col-form-label" for="NOMINA_EXPORTAR_fechaInicial" id="NOMINA_EXPORTAR_EXPORTARXML_ETQ7">Fecha Final</label>
		            	<div class="col-sm-4">
		        	       <div class="form-group">
		    	             <input class="form-control datetimepicker flatpickr-input active" id="NOMINA_EXPORTAR_fechaFinal" name="fechaFinal" type="text" placeholder="dd/mm/yyyy" data-options='{"disableMobile":true}' readonly="readonly"/>
			               </div>
			            </div>
					</div>
					
				
				</div>
				
				<div class="mb-2 row" id="NOMINA_EXPORTAR_divBusquedaXML">
					<label class="col-sm-2 col-form-label" for="filesXML" id="NOMINA_EXPORTAR_EXPORTARXML_ETQ8">Archivos XML </label>
					<div class="col-sm-4">
						<input id="NOMINA_EXPORTAR_filesXML" name="filesXML" class="form-control" type="file" accept="text/xml" multiple/>
					</div>
				</div>
				
				
				<div class="mb-2 row" id="NOMINA_EXPORTAR_divBusquedaTxt">
					<label class="col-sm-2 col-form-label" for="fileTXT" id="NOMINA_EXPORTAR_EXPORTARXML_ETQ9">Archivo TXT </label>
					<div class="col-sm-4">
						<input id="NOMINA_EXPORTAR_fileTXT" name="fileTXT" class="form-control" type="file" accept="text/plain"/>
					</div>
				</div>

				<div class="mb-2 row">
					<label class="col-sm-2 col-form-label" for="" id="NOMINA_EXPORTAR_EXPORTARXML_ETQ10">Agrupar en Folder</label>
					<div class="col-sm-3">
						<div class="form-check form-switch">
							<input class="form-check-input" id="NOMINA_EXPORTAR_agruparFacturasSW" type="checkbox"   onchange="habilitarAgrupacion_Nomina_Exportar();" />
						</div>
					</div>
				</div>

				<div class="mb-2 row">
					<label class="col-sm-2 col-form-label" for="modoAgrupar" id="NOMINA_EXPORTAR_EXPORTARXML_ETQ11">Modo de Agrupaci&oacute;n</label>
					<div class="col-sm-4">
						<div class="form-group">
							<select class="form-select" id="NOMINA_EXPORTAR_modoAgrupar" name="modoAgrupar" disabled="disabled">
								 <option value="NONE" selected=""></option>
                                 <option value="1" id="NOMINA_EXPORTAR_EXPORTARXML_ETQ12">FECHA DE PAGO</option>
                                 <option value="2" id="NOMINA_EXPORTAR_EXPORTARXML_ETQ13">FECHA INICIAL DE PAGO</option>
                                 <option value="3" id="NOMINA_EXPORTAR_EXPORTARXML_ETQ14">FECHA FINAL DE PAGO</option>
							</select>
						</div>
					</div>
				</div>



				<div class="mb-2 row">
					<label class="col-sm-2 col-form-label" for="NOMINA_EXPORTAR_CORREO_RESPONSABLE" id="NOMINA_EXPORTAR_EXPORTARXML_ETQ16">Correo de notificaci&oacute;n al responsable</label>
					<div class="col-sm-4">
						<input id="NOMINA_EXPORTAR_CORREO_RESPONSABLE" name="correoResponsable" class="form-control" type="email" required />
					</div>
				</div>


				<div class="mb-2 row">
					<label class="col-sm-2 col-form-label" for="" id="NOMINA_EXPORTAR_EXPORTARXML_ETQ17">Descargar XML </label>
					<div class="col-sm-1">
						<div class="form-check form-switch">
							<input class="form-check-input" id="NOMINA_EXPORTAR_descargarFacturas" name="descargarFacturas" type="checkbox"  />
						</div>
					</div>
					
					<label class="col-sm-2 col-form-label" for="" id="NOMINA_EXPORTAR_EXPORTARXML_ETQ18">Validar XML</label>
					<div class="col-sm-1">
						<div class="form-check form-switch">
							<input class="form-check-input" id="NOMINA_EXPORTAR_validarSAT" name="validarSAT" type="checkbox"  />
						</div>
					</div>
					
				</div>

	
				
				

				<div class="col-md-6 text-center">
					<button type="submit" id="NOMINA_EXPORTAR_btnProcesar_XML" class="btn btn-primary">Procesar</button>
				</div>

			</div>

		</form>

	</div>
</div>


<script type="text/javascript">

var MENSAJE_EXITOSO_Nomina_Exportar = null;
	$(document).ready(function () {

		
		$( "#NOMINA_EXPORTAR_divBusquedaRFC" ).hide();
		$( "#NOMINA_EXPORTAR_divBusquedaXML" ).hide();
		
		$('#NOMINA_EXPORTAR_modoAgrupar').select2({
			// dropdownParent: $('#myModalDetalle .modal-body'),
			theme: 'bootstrap-5'
		});
		
		$('#NOMINA_rfcEmpleado').select2({
			// dropdownParent: $('#myModalDetalle .modal-body'),
			theme: 'bootstrap-5'
		});
		
		
		$('#NOMINA_EXPORTAR_tipoExportacion').select2({
			theme: "bootstrap-5",
		});

		$("#frmExportXML_Nomina_Exportar").on("submit", function (event) {
			$(this).addClass("was-validated");
		});

		
		
   	 flatpickr(NOMINA_EXPORTAR_fechaInicial, {
  	      minDate: '1920-01-01', 
  	      //dateFormat : "d-m-Y", 
  	      dateFormat : "Y-m-d",
  	      locale: {
  	        firstDayOfWeek: 1,
  	        weekdays: {
  	          shorthand: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
  	          longhand: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],         
  	        }, 
  	        months: {
  	          shorthand: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Оct', 'Nov', 'Dic'],
  	          longhand: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  	        },
  	      },
  	    }); 

   	flatpickr(NOMINA_EXPORTAR_fechaFinal, {
	      minDate: '1920-01-01', 
	      //dateFormat : "d-m-Y", 
	      dateFormat : "Y-m-d",
	      locale: {
	        firstDayOfWeek: 1,
	        weekdays: {
	          shorthand: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
	          longhand: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],         
	        }, 
	        months: {
	          shorthand: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Оct', 'Nov', 'Dic'],
	          longhand: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
	        },
	      },
	    }); 

   	
		/* Necesario para validacion del form y del Select2
	   -----------------------------------------------------*/
		$("#frmExportXML_Nomina_Exportar")
			.validate({
				ignore: "input[type=hidden]",
				focusInvalid: false,
				errorClass: "help-block animation-pullUp",
				errorElement: "div",
				keyUp: true,
				submitHandler: function (form) {
					guardarDatos_Nomina_Exportar();
				},
				errorPlacement: function (error, e) {
					e.parents(".form-group").append(error);
				},
				highlight: function (e) {
					$(e)
						.closest(".form-group")
						.removeClass("has-success has-error")
						.addClass("has-error");
				},
				success: function (e) {
					e.closest(".form-group")
						.removeClass("has-success has-error")
						.addClass("has-success");
				},
				rules: {
					select: { required: true },
				},
				messages: {
					select: { required: "error" },
				},
			})
			.resetForm();
		
		
		iniciaFormCatalogo_Nomina_Exportar();
		asignarCorreo_Nomina_Exportar();
		calcularEtiquetasExportarXML_Nomina_Exportar();
		
	});
	
	

	 function calcularEtiquetasExportarXML_Nomina_Exportar(){
			$.ajax({
				url  : '/siarex247/lenguaje/obtenerEtiquetas.action',
				type : 'POST', 
				data : {
					nombrePantalla : 'EXPORTAR_NOMINA'
				},
				dataType : 'json',
				success  : function(data) {
					if($.isEmptyObject(data)) {
					   
					} else {
						
						// document.getElementById("EXPORTARXML_TITLE1").innerHTML = data.TITLE1;
						document.getElementById("NOMINA_EXPORTAR_EXPORTARXML_ETQ1").innerHTML = data.ETQ1;
						document.getElementById("NOMINA_EXPORTAR_EXPORTARXML_ETQ2").innerHTML = data.ETQ2;
						document.getElementById("NOMINA_EXPORTAR_EXPORTARXML_ETQ3").innerHTML = data.ETQ3;
						document.getElementById("NOMINA_EXPORTAR_EXPORTARXML_ETQ4").innerHTML = data.ETQ4;
						document.getElementById("NOMINA_EXPORTAR_EXPORTARXML_ETQ5").innerHTML = data.ETQ5;
						document.getElementById("NOMINA_EXPORTAR_EXPORTARXML_ETQ6").innerHTML = data.ETQ6;
						document.getElementById("NOMINA_EXPORTAR_EXPORTARXML_ETQ7").innerHTML = data.ETQ7;
						document.getElementById("NOMINA_EXPORTAR_EXPORTARXML_ETQ8").innerHTML = data.ETQ8;
						document.getElementById("NOMINA_EXPORTAR_EXPORTARXML_ETQ9").innerHTML = data.ETQ9;
						document.getElementById("NOMINA_EXPORTAR_EXPORTARXML_ETQ10").innerHTML = data.ETQ10;
						document.getElementById("NOMINA_EXPORTAR_EXPORTARXML_ETQ11").innerHTML = data.ETQ11;
						document.getElementById("NOMINA_EXPORTAR_EXPORTARXML_ETQ12").innerHTML = data.ETQ12;
						document.getElementById("NOMINA_EXPORTAR_EXPORTARXML_ETQ13").innerHTML = data.ETQ13;
						document.getElementById("NOMINA_EXPORTAR_EXPORTARXML_ETQ14").innerHTML = data.ETQ14;
						document.getElementById("NOMINA_EXPORTAR_EXPORTARXML_ETQ16").innerHTML = data.ETQ16;
						document.getElementById("NOMINA_EXPORTAR_EXPORTARXML_ETQ17").innerHTML = data.ETQ17;
						document.getElementById("NOMINA_EXPORTAR_EXPORTARXML_ETQ18").innerHTML = data.ETQ18;
						document.getElementById("NOMINA_EXPORTAR_btnProcesar_XML").innerHTML = BTN_PROCESAR_MENU;
						
						
						MENSAJE_EXITOSO_Nomina_Exportar = data.ETQ23;
						
					}
					
				},
				error : function(xhr, ajaxOptions, thrownError) {
					alert('calcularEtiquetasExportarXML()_1_'+thrownError);
				}
			});	
		}
	 
	 
	 function cargaEmpleados() {
			try {
				$('#NOMINA_EXPORTAR_rfcEmpleado').empty();
				$.ajax({
		           url:  '/siarex247/cumplimientoFiscal/exportarNomina/comboEmpleados.action',
		           type: 'POST',
		            dataType : 'json',
				    success: function(data){
				    	$('#NOMINA_EXPORTAR_rfcEmpleado').empty();
				    	$.each(data.data, function(key, text) {
					    	$('#NOMINA_EXPORTAR_rfcEmpleado').append($('<option></option>').attr('value', text.rfc).text(text.razonSocial));
				      	});
				    }
				});
			}catch(e) {
				alert("cargaEmpleados()_"+e);
			} 
		}
	 
</script>




</html>