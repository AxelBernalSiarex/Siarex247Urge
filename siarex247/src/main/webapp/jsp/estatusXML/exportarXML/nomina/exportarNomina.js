






  function habilitarAgrupacion_Nomina_Exportar(){
	  try {
		  var isCheck = $("#NOMINA_EXPORTAR_agruparFacturasSW").prop('checked');
		  if (isCheck){
			  $( "#NOMINA_EXPORTAR_modoAgrupar" ).prop( "disabled", false );
		  }else{
			  $( "#NOMINA_EXPORTAR_modoAgrupar" ).prop( "disabled", true );
		  }
	  }catch(e){
		  alert('habilitarAgrupacion_Nomina_Exportar()_'+e);
	  }
  }
  
  
  function cambiarModo_Nomina_Exportar(valorModo){
	  try{
		  if (valorModo == 'TEXTO'){
			  $( "#NOMINA_EXPORTAR_divBusquedaTxt" ).show();
			  $( "#NOMINA_EXPORTAR_divBusquedaRFC" ).hide();
			  $( "#NOMINA_EXPORTAR_divBusquedaXML" ).hide();
			  $( "#NOMINA_EXPORTAR_fileTXT" ).prop( "disabled", false );
		  }else if (valorModo == 'RFC'){
			  $( "#NOMINA_EXPORTAR_divBusquedaTxt" ).show();
			  $( "#NOMINA_EXPORTAR_divBusquedaRFC" ).show();
			  $( "#NOMINA_EXPORTAR_fileTXT" ).prop( "disabled", true );
			  $( "#NOMINA_EXPORTAR_divBusquedaXML" ).hide();
		  }else if (valorModo == 'XML'){
			  $( "#NOMINA_EXPORTAR_divBusquedaXML" ).show();
			  $( "#NOMINA_EXPORTAR_divBusquedaRFC" ).hide();
			  $( "#NOMINA_EXPORTAR_divBusquedaTxt" ).hide();
			  $( "#NOMINA_EXPORTAR_fileTXT" ).prop( "disabled", false );
		  }else {
			 
			  //$( "#divBusquedaTxt" ).hide();
		  }
	  }catch(e){
		  alert('cambiarModo_Nomina_Exportar()_'+e);
	  }
  }

	function iniciaFormCatalogo_Nomina_Exportar(){
		
		$('#NOMINA_EXPORTAR_rfcEmpleado').select2({
			// dropdownParent: $('#myModalDetalle .modal-body'),
			theme: 'bootstrap-5'
		});
		
		
		
		/* Reset al Formulario */ 
		$("#frmExportXML_Nomina_Exportar").find('.has-success').removeClass("has-success");
	    $("#frmExportXML_Nomina_Exportar").find('.has-error').removeClass("has-error");
		$('#frmExportXML_Nomina_Exportar')[0].reset(); 
		$('#frmExportXML_Nomina_Exportar').removeClass("was-validated"); 
	
		cargaEmpleados();
	}
	
  
  
   function guardarDatos_Nomina_Exportar(){
  	try{
              var formData = new FormData(document.getElementById("frmExportXML_Nomina_Exportar"));
              formData.append("dato", "valor");

              $.ajax({
                  url: '/siarex247/cumplimientoFiscal/exportarNomina/exportarFacturas.action',
                  type: "post",
                  dataType: "json",
                  data: formData,
                  beforeSend: function( xhr ) {
	        			$('#overSeccionCA_Nomina_Exportar').css({display:'block'});
	        			$("#NOMINA_EXPORTAR_btnProcesar_XML").prop('disabled', true);
	        	  },
	        	  complete: function(jqXHR, textStatus){
		    		  $('#overSeccionCA_Nomina_Exportar').css({display:'none'});
		    		  $("#NOMINA_EXPORTAR_btnProcesar_XML").prop('disabled', false);
			      },	
                  cache: false,
                  contentType: false,
  	    		processData: false
              }).done(function(data){
            	  if (data.codError == '000'){
            		  Swal.fire({
  						  icon: 'success',
  						  title: MSG_OPERACION_EXITOSA_MENU,
  						  // text: 'El proceso de exportar facturas se ha iniciado satisfactoriamente. En unos momentos recibirá un correo para descargar el archivo de facturas.',
  						  text: MENSAJE_EXITOSO_Nomina_Exportar,
  						  showCancelButton: false,
  						  confirmButtonText: BTN_ACEPTAR_MENU,
  						  denyButtonText: BTN_CANCELAR_MENU,
  						}).then((result) => {
  						  if (result.isConfirmed) {
  						
  						  }
  						});
            	  }else{
            		  Swal.fire({
			                title: MSG_ERROR_OPERACION_MENU,
			                html: '<p>'+data.mensajeError+'</p>',	
			                icon: 'error'
			            });
            	  }
            	  
             });
  	}
  	catch(e){
  		alert('error : ' + e);
  	}
  }
   
   
   

	function asignarCorreo_Nomina_Exportar(){
		try{
				
			$.ajax({
				url  : '/siarex247/seguridad/usuarios/consultaPermisos.action',
				type : 'POST', 
				data : null,
				dataType : 'json',
				success  : function(data) {
	 				if (data == null){
	 					Swal.fire({
	 						  title: '¡Operación Exitosa!',
	 						 html: '<p>Error al obtener los permisos del usuario</p>',	
								  showCancelButton: false,
								  confirmButtonText: 'Aceptar',
								  icon: 'success'
	 						}).then((result) => {
	 						});
	 					
	 				}else{
	 					$('#NOMINA_EXPORTAR_CORREO_RESPONSABLE').val(data.correo);
	 				}
					
				},
				error : function(xhr, ajaxOptions, thrownError) {
					alert('asignarCorreo_Nomina_Exportar()_'+thrownError);
				}
			});			
			
		}catch(e){
			alert('asignarCorreo_Nomina_Exportar()_'+e);
		}
	 }
	