var tablaDetalleNomina = null;

$(document).ready(function() {
    try {
        tablaDetalleNomina = $('#tablaDetalleNomina').DataTable({
            paging: true,
            retrieve: true,
            pageLength: 15,
            lengthChange: false,
            // dom: 'Blfrtip',
            dom: '<"top">t<"bottom"ilp<"clear">>',
            ordering: true,
            serverSide: true,
            fixedHeader: true,
            orderCellsTop: true,
            info: true,
            select: true,
            stateSave: false,
            order: [
                [0, 'asc']
            ],
            buttons: null,

            language: {
                processing: "Procesando...",
                zeroRecords: "No se encontraron resultados",
                emptyTable: "Ningún dato disponible en esta tabla",
                info: "Mostrando _START_ al _END_ de _TOTAL_ registros",
                infoEmpty: "No hay registros disponibles",
                infoFiltered: "(filtrado de un total de _MAX_ registros)",
                infoPostFix: "",
                search: "Buscar:",
                url: "",
                infoThousands: ",",
                loadingRecords: "Cargando...",
                oPaginate: {
                    sFirst: "Primero",
                    sLast: "Último",
                    sNext: "<span class='fa fa-chevron-right fa-w-10'></span>",
                    sPrevious: "<span class='fa fa-chevron-left fa-w-10'></span>"
                }
            },
            ajax: {
                url: '/siarex247/cumplimientoFiscal/boveda/nomina/detalleBoveda.action',
                beforeSend: function(xhr) {
                    $('#overSeccion_Boveda_Nomina').css({
                        display: 'block'
                    });
                    $('#btnRefrescar_NominaCFDI').prop('disabled', true);
                },
                complete: function(jqXHR, textStatus) {
                    $('#overSeccion_Boveda_Nomina').css({
                        display: 'none'
                    });
                    $('#btnRefrescar_NominaCFDI').prop('disabled', false);
                },

                data: function(d) {
                    // básicos
                    d.fechaInicial = obtenerFechaIni_Nomina();
                    d.fechaFinal = obtenerFechaFin_Nomina();
                    d.rfc = obtenerRFC_Nomina();
                    d.razonSocial = obtenerRazon_Nomina();
                    d.uuid = obtenerUUID_Nomina();
                    d.serie = obtenerSerie_Nomina();

                    // ===== Operadores texto =====
                    d.rfcOperator = $('#rfcOperatorN').val() || 'contains';
                    d.razonOperator = $('#razonOperatorN').val() || 'contains';
                    d.serieOperator = $('#serieOperatorN').val() || 'contains';
                    d.uuidOperator = $('#uuidOperatorN').val() || 'contains';
					
					// ===== NUEVOS FILTROS (Exentas, Gravadas, Otros) =====
					                    d.exentasV1 = $('#exentasFilter1N').val();
					                    d.exentasV2 = $('#exentasFilter2N').val();
					                    d.exentasOperator = $('#exentasOperatorN').val() || 'eq';

					                    d.gravadasV1 = $('#gravadasFilter1N').val();
					                    d.gravadasV2 = $('#gravadasFilter2N').val();
					                    d.gravadasOperator = $('#gravadasOperatorN').val() || 'eq';

					                    d.otrosV1 = $('#otrosFilter1N').val();
					                    d.otrosV2 = $('#otrosFilter2N').val();
					                    d.otrosOperator = $('#otrosOperatorN').val() || 'eq';
					                    // =====================================================

                    // ===== Numéricos (valor 1/2 + operador) =====
                    d.folioV1 = $('#folioFilter1N').val();
                    d.folioV2 = $('#folioFilter2N').val();
                    d.folioOperator = $('#folioOperatorN').val() || 'eq';

                    d.totalV1 = $('#totalFilter1N').val();
                    d.totalV2 = $('#totalFilter2N').val();
                    d.totalOperator = $('#totalOperatorN').val() || 'eq';

                    d.subV1 = $('#subFilter1N').val();
                    d.subV2 = $('#subFilter2N').val();
                    d.subOperator = $('#subOperatorN').val() || 'eq';

                    d.descV1 = $('#descFilter1N').val();
                    d.descV2 = $('#descFilter2N').val();
                    d.descOperator = $('#descOperatorN').val() || 'eq';

                    d.percV1 = $('#percFilter1N').val();
                    d.percV2 = $('#percFilter2N').val();
                    d.percOperator = $('#percOperatorN').val() || 'eq';

                    d.dedV1 = $('#dedFilter1N').val();
                    d.dedV2 = $('#dedFilter2N').val();
                    d.dedOperator = $('#dedOperatorN').val() || 'eq';

                    // ===== Fecha =====
                    d.dateOperator = $('#dateOperatorN').val() || 'eq';
                    d.dateV1 = $('#dateFilter1N').val();
                    d.dateV2 = $('#dateFilter2N').val();

                    // evita cache si es necesario
                    d._ = Date.now();
                },

                type: 'POST'
            },
            aoColumns: [
                { mData: null }, // 0 Acciones
                { mData: "rfcReceptor" }, // 1 RFC
                { mData: "razonSocialReceptor" }, // 2 Razon Social
                { mData: "subTotal" }, // 3 (Total Percepciones)
                { mData: "totalExcento" }, // 4
                { mData: "totalGravado" }, // 5
                { mData: "totalOtros" }, // 6
                { mData: "descuento" }, // 7 (Total Deducciones)
                { mData: "total" }, // 8 (Neto a pagar)
                { mData: null, sClass: "center" }, // 9 XML
                { mData: null, sClass: "center" }, // 10 PDF
                { mData: "uuid" }, // 11 UUID
                { mData: "fechaFactura" }, // 12
                // Ocultas (compatibilidad)
                { mData: "totalPercepciones" },
                { mData: "totalDeducciones" }
            ],
            columnDefs: [
                // === CORRECCIÓN APLICADA AQUÍ ===
                // XML (Columna 9 en tu estructura de filtros)
                {
                    targets: 9,
                    searchable: false,
                    sortable: false,
                    render: function(data, type, row) {
                        // Se usa la imagen moderna y la función generaArchivoNomina
                        return '<img class="" src="/theme-falcon/repse247/img/xml26.png" alt="" style="cursor: pointer;" title="Ver XML" data-bs-toggle="tooltip" data-bs-placement="top" title="Archivo XML" onclick="generaArchivoNomina(\'XML\', \'' + row.idRegistro + '\');" />';
                    }
                },
                // PDF (Columna 10)
                {
                    targets: 10,
                    searchable: false,
                    sortable: false,
                    render: function(data, type, row) {
                        // Se usa la imagen moderna y la función generaArchivoNomina
                        return '<img class="" src="/theme-falcon/repse247/img/pdf26.png" alt="" style="cursor: pointer;" title="Ver PDF" data-bs-toggle="tooltip" data-bs-placement="top" title="Archivo PDF" onclick="generaArchivoNomina(\'PDF\', \'' + row.idRegistro + '\');" />';
                    }
                },
                // UUID (Columna 11) - Enlace al PDF
                {
                    targets: 11,
                    searchable: false,
                    sortable: false,
                    render: function(data, type, row) {
                        // Se actualiza el enlace para usar generaArchivoNomina
                        return '<a href="javascript:generaArchivoNomina(\'PDF\', \'' + row.idRegistro + '\');">' + row.uuid + '</a>';
                    }
                },
                // ================================

                // Columnas ocultas de compatibilidad
                {
                    targets: [13, 14],
                    visible: false,
                    searchable: false
                },
                // Acciones
                {
                    targets: 0,
                    searchable: false,
                    sortable: false,
                    render: function(data, type, row) {
                        var retorno = "";
                        retorno += '<div class="dropdown font-sans-serif position-static">';
                        retorno += '<button class="btn btn-link text-600 btn-sm dropdown-toggle btn-reveal" type="button" id="dropdown0" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false">';
                        retorno += '<span class="fas fa-ellipsis-h fs--1"></span></button>';
                        retorno += '<div class="dropdown-menu dropdown-menu-end border py-0" aria-labelledby="dropdown0">';
                        retorno += '<div class="bg-white py-2">';
                        // También corregimos las acciones del menú
                        retorno += '<a class="dropdown-item" href="javascript:generaArchivoNomina(\'XML\', \'' + row.idRegistro + '\');">Descargar XML</a>';
                        retorno += '<a class="dropdown-item" href="javascript:generaArchivoNomina(\'PDF\', \'' + row.idRegistro + '\');">Descargar PDF</a>';
                        retorno += '</div></div></div>';
                        return retorno;
                    }
                }
            ],
            initComplete: function() {
                var btns = $('.dt-button');
                btns.removeClass('dt-button');

                var btnsSubMenu = $('.dtb-b2');
                btnsSubMenu.addClass('dropdown-menu dropdown-menu-end py-0 show');

            },
            drawCallback: function() {

            }
        });

    } catch (e) {
        alert('usuarios()_' + e);
    };

    tablaDetalleNomina.on('draw', function() {
        $('[data-toggle="tooltip"]').tooltip();
    });

    // --- Inicia Listeners de Filtros (del archivo CORREGIR) ---
    /* --- ENTER global en inputs/selects del thead --- */
    $(document)
        .off('keydown.nominaEnterLikeEmitidos')
        .on('keydown.nominaEnterLikeEmitidos',
            '#tablaDetalleNomina thead tr.filters :input, .dtfh-floatingparent thead tr.filters :input',
            function(e) {
                if (e.which == 13) {
                    e.preventDefault();
                    // Al dar enter, forzamos recarga
                    $('#tablaDetalleNomina').DataTable().ajax.reload();
                }
            });

    /* --- Inicializa defaults y handlers por campo --- */
    $(function() {
        // Textos
        initDxLikeFilterN({ inputId: '#rfcFilterInputN', hiddenOpId: '#rfcOperatorN', targetInput: '#rfc_Nomina' });
        initDxLikeFilterN({ inputId: '#razonFilterInputN', hiddenOpId: '#razonOperatorN', targetInput: '#razonSocial_Nomina' });
        initDxLikeFilterN({ inputId: '#uuidFilterInputN', hiddenOpId: '#uuidOperatorN', targetInput: '#uuid_Nomina' });

        // Numéricos
        initNumericDxFilterN({ v1Id: '#totalFilter1N', v2Id: '#totalFilter2N', opHiddenId: '#totalOperatorN' });
        initNumericDxFilterN({ v1Id: '#subFilter1N', v2Id: '#subFilter2N', opHiddenId: '#subOperatorN' });
        initNumericDxFilterN({ v1Id: '#descFilter1N', v2Id: '#descFilter2N', opHiddenId: '#descOperatorN' });
        // Agrega aquí los demás si faltan en tu versión original, respetando lo que tenías
    });

});

// === FUNCIÓN DE REDIRECCIÓN (Tomada del archivo correcto) ===
function generaArchivoNomina(tipo, idRegistro) {
    document.getElementById('idRegistroP_Nomina').value = idRegistro;
    document.getElementById('tipoArchivoP_Nomina').value = tipo;
    document.frmBovedaNomina.submit();
}

function abreModal_Nomina(opcion, id) {
    switch (opcion) {
        case "nuevo":
            $("#btnSometer_Nomina").prop('disabled', false);
            iniciaFormNomina();
            $('#myModalDetalle_Nomina').modal('show');
            break;
        default:
    }
}

function iniciaFormNomina() {
    $("#frm-Carga-XML-Nomina").find('.has-success').removeClass("has-success");
    $("#frm-Carga-XML-Nomina").find('.has-error').removeClass("has-error");
    $('#frm-Carga-XML-Nomina')[0].reset();
    $('#frm-Carga-XML-Nomina').removeClass("was-validated");
}

	function generaArchivoNomina(tipo, idRegistro){
		 document.getElementById('idRegistroP_Nomina').value = idRegistro;
		 document.getElementById('tipoArchivoP_Nomina').value = tipo;
	     document.frmBovedaNomina.submit();
	}
	
	function procesaValidarNomina(){
			
			try{
				$("#btnSometer_Nomina").prop('disabled', true);
		            var formData = new FormData(document.getElementById("frm-Carga-XML-Nomina"));
		            formData.append("dato", "valor");

		            $.ajax({
		            	url: '/siarex247/cumplimientoFiscal/boveda/nomina/iniciaCargaXML.action',
		                dataType: "json",
		                beforeSend: function( xhr ) {
		        			$('#overSeccion_Nomina').css({display:'block'});
		        		},
		                type: "post",
		                data: formData,
		                cache: false,
		                contentType: false,
			    		processData: false,
			    		complete: function(jqXHR, textStatus){
				    		  $('#overSeccion_Nomina').css({display:'none'});
				    		  $("#btnSometer_Nomina").prop('disabled', false);
					    },
					    
		            }).done(function(data){
		            	
			            if (data.ESTATUS == 'OK') {
		 					Swal.fire({
		 						  icon: 'success',
		 						  title: MSG_OPERACION_EXITOSA_MENU,
		 						 // text: data.MENSAJE,
		 						  html: '<p>'+data.MENSAJE+' </p>',
		 						  showCancelButton: false,
		 						  confirmButtonText: BTN_ACEPTAR_MENU,
		 						  denyButtonText: BTN_CANCELAR_MENU,
		 						}).then((result) => {
		 						  if (result.isConfirmed) {
		 							 $('#myModalDetalle_Nomina').modal('hide');
		  	 						 $('#tablaDetalleNomina').DataTable().ajax.reload(null,true);
		 						  }
		 					});
						}else if (data.ESTATUS == 'OK_CON_ERROR'){
							Swal.fire({
		 						  icon: 'success',
		 						  title: MSG_OPERACION_EXITOSA_MENU,
		 						  // text: data.MENSAJE,
		 						 html: '<p>'+data.MENSAJE+' </p>',
		 						  showCancelButton: false,
		 						  confirmButtonText: BTN_ACEPTAR_MENU,
		 						  denyButtonText: BTN_CANCELAR_MENU,
		 						}).then((result) => {
		 						  if (result.isConfirmed) {
		 							 $('#myModalDetalle_Nomina').modal('hide');
		  	 						 $('#tablaDetalleNomina').DataTable().ajax.reload(null,true);
		 						  }
		 					});
						} else {
						  Swal.fire({
							  icon: 'error',
							  title: '¡Error en Operacion!',
							  text: data.MENSAJE
						  });
						}
		         });
			}
			catch(e){
				e = null;
			}
	}
	
	function eliminaBovedaNomina(idRegistro){
		try{
			
			if (idRegistro == 'MULTIPLE'){
				idRegistro =  getElementosFilterEmitidos();
			}
			
			if (idRegistro == ''){
				Swal.fire({
	    			title: MSG_ERROR_OPERACION_MENU,
	                	//html: '<p>¡ Debe seleccionar al menos un registro para eliminar !</p>',	
	    				html: '<p>'+LABEL_BOVEDA_TEXT3+'</p>',
	                	icon: 'info'
	    		});
			}else {

				Swal.fire({
					  icon : 'question',
					 // title: '¿Estas seguro de eliminar el registro de Boveda ?',
					  title: TITLE_DELETE_CATALOGO,
					  // text: 'UUID : '+uuidBoveda,
					  showDenyButton: true,
					  showCancelButton: false,
					  confirmButtonText: BTN_ACEPTAR_MENU,
					  denyButtonText: BTN_CANCELAR_MENU,
					}).then((result) => {
					  if (result.isConfirmed) {
						  $.ajax({
					           url:  '/siarex247/cumplimientoFiscal/boveda/nomina/eliminarBoveda.action',
					           type: 'POST',
					            dataType : 'json',
					            data : {
					            	idRegistro : idRegistro
					            },
							    success: function(data){
							    	if (data.codError == "000"){
							    		Swal.fire({
				 						  title: MSG_OPERACION_EXITOSA_MENU,
				 						 html: '<p>Registro Borrado. </p>',
											  showCancelButton: false,
											  confirmButtonText: BTN_ACEPTAR_MENU,
											  icon: 'success'
				 						}).then((result) => {
				 							$('#tablaDetalleNomina').DataTable().ajax.reload(null,false);
				 						});
							    	}else{
							    		Swal.fire({
							    			title: MSG_ERROR_OPERACION_MENU,
			  			                	html: '<p>'+data.mensajeError+'</p>',	
			  			                	icon: 'error'
							    		});
							    	}
							    	
							    	
							    }
							});
					  } else if (result.isDenied) {
						 
					  }
					})
			}
			
		}catch(e){
			alert('eliminaCatalogo()_'+e);
		}
		
	}
	

	function exportExcelNomina(){
	  try{
	    // ===== 1) Tomar valores desde filtros del thead; si no hay, usar helpers =====
	    var rfc          = ($('#rfcFilterInputN').length   ? $('#rfcFilterInputN').val()   : '') || obtenerRFC_Nomina();
	    var razonSocial  = ($('#razonFilterInputN').length ? $('#razonFilterInputN').val() : '') || obtenerRazon_Nomina();
	    var serie        = ($('#serieFilterInputN').length ? $('#serieFilterInputN').val() : '') || obtenerSerie_Nomina();
	    var uuid         = ($('#uuidFilterInputN').length  ? $('#uuidFilterInputN').val()  : '') || obtenerUUID_Nomina();
	    var folio        = ($('#folioFilter1N').length     ? $('#folioFilter1N').val()     : '') || obtenerFolio_Nomina();

	    var fechaInicial = ($('#dateFilter1N').length ? $('#dateFilter1N').val() : '') || obtenerFechaIni_Nomina();
	    var fechaFinal   = ($('#dateFilter2N').length ? $('#dateFilter2N').val() : '') || obtenerFechaFin_Nomina();

	    // ===== 2) Operadores DX-like (texto/num/fecha) =====
	    var rfcOp    = ($('#rfcOperatorN').val()   || 'contains').toLowerCase();
	    var razonOp  = ($('#razonOperatorN').val() || 'contains').toLowerCase();
	    var serieOp  = ($('#serieOperatorN').val() || 'contains').toLowerCase();
	    var uuidOp   = ($('#uuidOperatorN').val()  || 'contains').toLowerCase();

	    var dateOp   = ($('#dateOperatorN').val()  || 'eq').toLowerCase();
	    var dateV1   = $('#dateFilter1N').val() || '';
	    var dateV2   = $('#dateFilter2N').val() || '';

	    var folioOp  = ($('#folioOperatorN').val() || 'eq').toLowerCase();
	    var folioV1  = $('#folioFilter1N').val() || '';
	    var folioV2  = $('#folioFilter2N').val() || '';

	    var totalOp  = ($('#totalOperatorN').val() || 'eq').toLowerCase();
	    var totalV1  = $('#totalFilter1N').val() || '';
	    var totalV2  = $('#totalFilter2N').val() || '';

	    var subOp    = ($('#subOperatorN').val() || 'eq').toLowerCase();
	    var subV1    = $('#subFilter1N').val() || '';
	    var subV2    = $('#subFilter2N').val() || '';

	    var descOp   = ($('#descOperatorN').val() || 'eq').toLowerCase();
	    var descV1   = $('#descFilter1N').val() || '';
	    var descV2   = $('#descFilter2N').val() || '';

	    var percOp   = ($('#percOperatorN').val() || 'eq').toLowerCase();
	    var percV1   = $('#percFilter1N').val() || '';
	    var percV2   = $('#percFilter2N').val() || '';

	    var dedOp    = ($('#dedOperatorN').val() || 'eq').toLowerCase();
	    var dedV1    = $('#dedFilter1N').val() || '';
	    var dedV2    = $('#dedFilter2N').val() || '';
		
		// ===== NUEVOS FILTROS (Exentas, Gravadas, Otros) =====
			    var exentasOp  = ($('#exentasOperatorN').val() || 'eq').toLowerCase();
			    var exentasV1  = $('#exentasFilter1N').val() || '';
			    var exentasV2  = $('#exentasFilter2N').val() || '';

			    var gravadasOp = ($('#gravadasOperatorN').val() || 'eq').toLowerCase();
			    var gravadasV1 = $('#gravadasFilter1N').val() || '';
			    var gravadasV2 = $('#gravadasFilter2N').val() || '';

			    var otrosOp    = ($('#otrosOperatorN').val() || 'eq').toLowerCase();
			    var otrosV1    = $('#otrosFilter1N').val() || '';
			    var otrosV2    = $('#otrosFilter2N').val() || '';

	    // ===== 3) Helper para asegurar/llenar hiddens en el form =====
	    function put(id, name, val){
	      var el = document.getElementById(id);
	      if(!el){
	        el = document.createElement('input');
	        el.type = 'hidden';
	        el.id   = id;
	        el.name = name;
	        document.frmExportarDetalleExcel_Nomina.appendChild(el);
	      }
	      el.value = (val == null ? '' : val);
	    }

	    // ===== 4) Llenar form con básicos =====
	    put('rfc_Nomina_Exportar',          'rfc',          rfc);
	    put('razonSocial_Nomina_Exportar',  'razonSocial',  razonSocial);
	    put('folio_Nomina_Exportar',        'folio',        folio);
	    put('serie_Nomina_Exportar',        'serie',        serie);
	    put('fechaInicial_Nomina_Exportar', 'fechaInicial', fechaInicial);
	    put('fechaFinal_Nomina_Exportar',   'fechaFinal',   fechaFinal);
	    put('uuid_Nomina_Exportar',         'uuid',         uuid);

	    // ===== 5) Operadores / valores avanzados =====
	    // Texto
	    put('rfcOperator_Nomina_Exportar',    'rfcOperator',    rfcOp);
	    put('razonOperator_Nomina_Exportar',  'razonOperator',  razonOp);
	    put('serieOperator_Nomina_Exportar',  'serieOperator',  serieOp);
	    put('uuidOperator_Nomina_Exportar',   'uuidOperator',   uuidOp);
	    // Fecha
	    put('dateOperator_Nomina_Exportar',   'dateOperator',   dateOp);
	    put('dateV1_Nomina_Exportar',         'dateV1',         dateV1);
	    put('dateV2_Nomina_Exportar',         'dateV2',         dateV2);
	    // Numéricos
	    put('folioOperator_Nomina_Exportar',  'folioOperator',  folioOp);
	    put('folioV1_Nomina_Exportar',        'folioV1',        folioV1);
	    put('folioV2_Nomina_Exportar',        'folioV2',        folioV2);

	    put('totalOperator_Nomina_Exportar',  'totalOperator',  totalOp);
	    put('totalV1_Nomina_Exportar',        'totalV1',        totalV1);
	    put('totalV2_Nomina_Exportar',        'totalV2',        totalV2);

	    put('subOperator_Nomina_Exportar',    'subOperator',    subOp);
	    put('subV1_Nomina_Exportar',          'subV1',          subV1);
	    put('subV2_Nomina_Exportar',          'subV2',          subV2);

	    put('descOperator_Nomina_Exportar',   'descOperator',   descOp);
	    put('descV1_Nomina_Exportar',         'descV1',         descV1);
	    put('descV2_Nomina_Exportar',         'descV2',         descV2);

	    put('percOperator_Nomina_Exportar',   'percOperator',   percOp);
	    put('percV1_Nomina_Exportar',         'percV1',         percV1);
	    put('percV2_Nomina_Exportar',         'percV2',         percV2);

	    put('dedOperator_Nomina_Exportar',    'dedOperator',    dedOp);
	    put('dedV1_Nomina_Exportar',          'dedV1',          dedV1);
	    put('dedV2_Nomina_Exportar',          'dedV2',          dedV2);
		
		// ... (después de dedV2_Nomina_Exportar) ...

			    // Exentas
			    put('exentasOperator_Nomina_Exportar', 'exentasOperator', exentasOp);
			    put('exentasV1_Nomina_Exportar',       'exentasV1',       exentasV1);
			    put('exentasV2_Nomina_Exportar',       'exentasV2',       exentasV2);

			    // Gravadas
			    put('gravadasOperator_Nomina_Exportar', 'gravadasOperator', gravadasOp);
			    put('gravadasV1_Nomina_Exportar',       'gravadasV1',       gravadasV1);
			    put('gravadasV2_Nomina_Exportar',       'gravadasV2',       gravadasV2);

			    // Otros Pagos
			    put('otrosOperator_Nomina_Exportar',    'otrosOperator',    otrosOp);
			    put('otrosV1_Nomina_Exportar',          'otrosV1',          otrosV1);
			    put('otrosV2_Nomina_Exportar',          'otrosV2',          otrosV2);
		

	    // (opcional) debug
	    // console.log('[Bóveda Nómina/Excel] payload →', $(document.frmExportarDetalleExcel_Nomina).serialize());

	    // ===== 6) Submit =====
	    document.frmExportarDetalleExcel_Nomina.submit();

	  }catch(e){
	    alert('exportExcelNomina(): ' + e);
	  }
	}


	
	
	

	function iniciaFormNotificacion(){
		$('#modoAgrupar_NOMINA').select2({
			dropdownParent: $('#myModalNotifica_Nomina .modal-body'),
			theme: 'bootstrap-5'
		});
		
		/* Reset al Formulario */ 
		$("#frmConfirmEmail").find('.has-success').removeClass("has-success");
	    $("#frmConfirmEmail").find('.has-error').removeClass("has-error");
		$('#frmConfirmEmail')[0].reset(); 
		$('#frmConfirmEmail').removeClass("was-validated"); 
		   
	}
	
	
	function consultarTotales(){
	    try{
	        var fechaInicial = obtenerFechaIni_Nomina();
	        var fechaFinal = obtenerFechaFin_Nomina();

	        $.ajax({
	            url  : '/siarex247/cumplimientoFiscal/boveda/recibidos/validarFechas.action',
	            data : {
	                fechaInicial : fechaInicial,
	                fechaFinal  : fechaFinal
	            },
	            type : 'POST', 
	            dataType : 'json',
	            success  : function(data) {
	                if($.isEmptyObject(data)) {
	                   
	                } else {
	                    if (data.codError == '000') {
	                        // 1) Recolectar UUIDs seleccionados
	                        var dataSelect = (window.tablaDetalleNomina && tablaDetalleNomina.rows)
	                                          ? tablaDetalleNomina.rows('.selected').data()
	                                          : null;

	                        var uuids = [];
	                        if (dataSelect && dataSelect.length){
	                          $.each(dataSelect, function(_, row){
	                            if (row && row.uuid) uuids.push(String(row.uuid).trim());
	                          });
	                        }
	                        uuids = Array.from(new Set(uuids.filter(Boolean)));
	                        var uuidRegistro = uuids.join(';');
	                        
	                        // 2) Tomar filtros DX-like
	                        var rfc          = ($('#rfcFilterInputN').length ? $('#rfcFilterInputN').val() : '') || obtenerRFC_Nomina();
	                        var razonSocial  = ($('#razonFilterInputN').length ? $('#razonFilterInputN').val() : '') || obtenerRazon_Nomina();
	                        var serie        = ($('#serieFilterInputN').length ? $('#serieFilterInputN').val() : '') || obtenerSerie_Nomina();
	                        var uuid         = ($('#uuidFilterInputN').length ? $('#uuidFilterInputN').val() : '') || obtenerUUID_Nomina();
	                        var folio        = ($('#folioFilter1N').length ? $('#folioFilter1N').val() : '') || obtenerFolio_Nomina();
	                        var fechaInicial = ($('#dateFilter1N').length ? $('#dateFilter1N').val() : '') || obtenerFechaIni_Nomina();
	                        var fechaFinal   = ($('#dateFilter2N').length ? $('#dateFilter2N').val() : '') || obtenerFechaFin_Nomina();

	                        // ==== Operadores ====
	                        var rfcOperator    = ($('#rfcOperatorN').val()   || 'contains').toLowerCase();
	                        var razonOperator  = ($('#razonOperatorN').val() || 'contains').toLowerCase();
	                        var serieOperator  = ($('#serieOperatorN').val() || 'contains').toLowerCase();
	                        var uuidOperator   = ($('#uuidOperatorN').val()  || 'contains').toLowerCase();

	                        var dateOperator   = ($('#dateOperatorN').val()  || 'eq').toLowerCase();
	                        var dateV1         = $('#dateFilter1N').val() || '';
	                        var dateV2         = $('#dateFilter2N').val() || '';

	                        var folioOperator  = ($('#folioOperatorN').val() || 'eq').toLowerCase();
	                        var folioV1        = $('#folioFilter1N').val() || '';
	                        var folioV2        = $('#folioFilter2N').val() || '';

	                        var totalOperator  = ($('#totalOperatorN').val() || 'eq').toLowerCase();
	                        var totalV1        = $('#totalFilter1N').val() || '';
	                        var totalV2        = $('#totalFilter2N').val() || '';

	                        var subOperator    = ($('#subOperatorN').val() || 'eq').toLowerCase();
	                        var subV1          = $('#subFilter1N').val() || '';
	                        var subV2          = $('#subFilter2N').val() || '';

	                        var descOperator   = ($('#descOperatorN').val() || 'eq').toLowerCase();
	                        var descV1         = $('#descFilter1N').val() || '';
	                        var descV2         = $('#descFilter2N').val() || '';

	                        var percOperator   = ($('#percOperatorN').val() || 'eq').toLowerCase();
	                        var percV1         = $('#percFilter1N').val() || '';
	                        var percV2         = $('#percFilter2N').val() || '';

	                        var dedOperator    = ($('#dedOperatorN').val() || 'eq').toLowerCase();
	                        var dedV1          = $('#dedFilter1N').val() || '';
	                        var dedV2          = $('#dedFilter2N').val() || '';

	                        // === AGREGADO: NUEVOS FILTROS ===
	                        var exentasOperator = ($('#exentasOperatorN').val() || 'eq').toLowerCase();
	                        var exentasV1       = $('#exentasFilter1N').val() || '';
	                        var exentasV2       = $('#exentasFilter2N').val() || '';

	                        var gravadasOperator = ($('#gravadasOperatorN').val() || 'eq').toLowerCase();
	                        var gravadasV1       = $('#gravadasFilter1N').val() || '';
	                        var gravadasV2       = $('#gravadasFilter2N').val() || '';

	                        var otrosOperator    = ($('#otrosOperatorN').val() || 'eq').toLowerCase();
	                        var otrosV1          = $('#otrosFilter1N').val() || '';
	                        var otrosV2          = $('#otrosFilter2N').val() || '';
	                        // ================================

	                        // 4) Llamada al backend
	                        $.ajax({
	                          url  : '/siarex247/cumplimientoFiscal/boveda/nomina/obtenerTotales.action',
	                          type : 'POST',
	                          beforeSend: function(){ $('#overSeccion_Boveda_Nomina').css({display:'block'}); },
	                          complete:   function(){ $('#overSeccion_Boveda_Nomina').css({display:'none'}); },
	                          data : {
	                            rfc          : rfc,
	                            razonSocial  : razonSocial,
	                            fechaInicial : fechaInicial,
	                            fechaFinal   : fechaFinal,
	                            uuid         : uuid,
	                            serie        : serie,
	                            folio        : folio,
	                            idRegistro   : uuidRegistro,
	                            // ---- Operadores/valores ----
	                            rfcOperator, razonOperator, serieOperator, uuidOperator,
	                            dateOperator, dateV1, dateV2,
	                            folioOperator, folioV1, folioV2,
	                            totalOperator, totalV1, totalV2,
	                            subOperator, subV1, subV2,
	                            descOperator, descV1, descV2,
	                            percOperator, percV1, percV2,
	                            dedOperator, dedV1, dedV2,
	                            // === AGREGADO: ENVIAR AL BACKEND ===
	                            exentasOperator, exentasV1, exentasV2,
	                            gravadasOperator, gravadasV1, gravadasV2,
	                            otrosOperator, otrosV1, otrosV2
	                            // ===================================
	                          },
	                          dataType : 'json',
	                          success  : function(data){
	                            if ($.isEmptyObject(data)){
	                              descargarCFDINomina();
	                              return;
	                            }
	                            if (data.codError === '000'){
	                              descargarCFDINomina();
	                            } else {
	                              iniciaFormNotificacion();
	                              $("#myModalNotifica_Nomina").modal("show");
	                              asignarCorreoNomina();
	                            }
	                          },
	                          error : function(xhr, ajaxOptions, thrownError){
	                            alert('consultarTotales() error: ' + thrownError);
	                          }
	                        });
	                    } else {
	                        Swal.fire({
	                            title: '¡Rango de fechas no valido!',
	                            html: '<p>'+data.mensajeError+'</p>',    
	                            icon: 'info'
	                        });
	                    }
	                }
	            },
	            error : function(xhr, ajaxOptions, thrownError) {
	                alert('validarFechas()_'+thrownError);
	            }
	        }); 

	    } catch(e){
	        alert('consultarTotales()_' + e);
	    }
	}


	/*
	function descargarCFDINomina(){
	      try{
	          var uuidRegistro = '';
	          var dataSelect = tablaDetalleNomina.rows('.selected').data(); 
				$.each(dataSelect, function(key, row) {
					uuidRegistro+= row.uuid + ";"		
				});
				
				
					var arrElementos = uuidRegistro.split(';');
					if (arrElementos.length > 50000){
						Swal.fire({
			    			title: MSG_ERROR_OPERACION_MENU,
			                	//html: '<p>¡ Debe exportar una cantidad menor a 50000 registros !</p>',	
			    				html: '<p>'+LABEL_BOVEDA_TEXT4+'</p>',
			                	icon: 'info'
			    		});
					}else{
						
						var fechaInicial  = obtenerFechaIni_Nomina();
						var fechaFinal = obtenerFechaFin_Nomina();
						var rfc = obtenerRFC_Nomina();
						var razonSocial = obtenerRazon_Nomina();
						var uuid = obtenerUUID_Nomina();
						var serie = obtenerSerie_Nomina();
						var folio  = obtenerFolio_Nomina();
						document.getElementById('fechaInicialZIP_Nomina').value = fechaInicial;
						document.getElementById('fechaFinalZIP_Nomina').value = fechaFinal;
						document.getElementById('rfcZIP_Nomina').value = rfc;
						document.getElementById('razonSocialZIP_Nomina').value = razonSocial;
						document.getElementById('uuidBovedaZIP_Nomina').value = uuid;
						document.getElementById('serieZIP_Nomina').value = serie;
						document.getElementById('folioZIP_Nomina').value = folio;
						document.getElementById('idRegistroZIP_Nomina').value = uuidRegistro;				
						document.frmBovedaNominaZIP.submit();	
					}
				// }
	      }
	      catch(e){
	          alert('descargarCFDIEmitidos(): '+e);
	      }
	  } */
	  
	  
	  function descargarCFDINomina(){
	      try{
	        // 1) UUIDs seleccionados (únicos)
	        var dataSelect = (window.tablaDetalleNomina && tablaDetalleNomina.rows)
	                          ? tablaDetalleNomina.rows('.selected').data() : null;
	        var uuids = [];
	        if (dataSelect && dataSelect.length){
	          $.each(dataSelect, function(_, row){
	            if (row && row.uuid) uuids.push(String(row.uuid).trim());
	          });
	        }
	        uuids = Array.from(new Set(uuids.filter(Boolean)));
	        var uuidRegistro = uuids.join(';');
	        if (uuids.length > 50000){
	          Swal.fire({ title: MSG_ERROR_OPERACION_MENU, html: '<p>'+LABEL_BOVEDA_TEXT4+'</p>', icon: 'info' });
	          return;
	        }

	        // 2) Valores base
	        var rfc          = ($('#rfcFilterInputN').length ? $('#rfcFilterInputN').val() : '') || obtenerRFC_Nomina();
	        var razonSocial  = ($('#razonFilterInputN').length ? $('#razonFilterInputN').val() : '') || obtenerRazon_Nomina();
	        var serie        = ($('#serieFilterInputN').length ? $('#serieFilterInputN').val() : '') || obtenerSerie_Nomina();
	        var uuid         = ($('#uuidFilterInputN').length ? $('#uuidFilterInputN').val() : '') || obtenerUUID_Nomina();
	        var folio        = ($('#folioFilter1N').length ? $('#folioFilter1N').val() : '') || obtenerFolio_Nomina();
	        var fechaInicial = ($('#dateFilter1N').length ? $('#dateFilter1N').val() : '') || obtenerFechaIni_Nomina();
	        var fechaFinal   = ($('#dateFilter2N').length ? $('#dateFilter2N').val() : '') || obtenerFechaFin_Nomina();

	        // 3) Operadores/valores DX-like
	        var rfcOperator    = ($('#rfcOperatorN').val()   || 'contains').toLowerCase();
	        var razonOperator  = ($('#razonOperatorN').val() || 'contains').toLowerCase();
	        var serieOperator  = ($('#serieOperatorN').val() || 'contains').toLowerCase();
	        var uuidOperator   = ($('#uuidOperatorN').val()  || 'contains').toLowerCase();

	        var dateOperator   = ($('#dateOperatorN').val()  || 'eq').toLowerCase();
	        var dateV1         = $('#dateFilter1N').val() || '';
	        var dateV2         = $('#dateFilter2N').val() || '';

	        var folioOperator  = ($('#folioOperatorN').val() || 'eq').toLowerCase();
	        var folioV1        = $('#folioFilter1N').val() || '';
	        var folioV2        = $('#folioFilter2N').val() || '';

	        var totalOperator  = ($('#totalOperatorN').val() || 'eq').toLowerCase();
	        var totalV1        = $('#totalFilter1N').val() || '';
	        var totalV2        = $('#totalFilter2N').val() || '';

	        var subOperator    = ($('#subOperatorN').val() || 'eq').toLowerCase();
	        var subV1          = $('#subFilter1N').val() || '';
	        var subV2          = $('#subFilter2N').val() || '';

	        var descOperator   = ($('#descOperatorN').val() || 'eq').toLowerCase();
	        var descV1         = $('#descFilter1N').val() || '';
	        var descV2         = $('#descFilter2N').val() || '';

	        var percOperator   = ($('#percOperatorN').val() || 'eq').toLowerCase();
	        var percV1         = $('#percFilter1N').val() || '';
	        var percV2         = $('#percFilter2N').val() || '';

	        var dedOperator    = ($('#dedOperatorN').val() || 'eq').toLowerCase();
	        var dedV1          = $('#dedFilter1N').val() || '';
	        var dedV2          = $('#dedFilter2N').val() || '';

	        // === AGREGADO: Lectura de nuevos filtros ===
	        var exentasOperator = ($('#exentasOperatorN').val() || 'eq').toLowerCase();
	        var exentasV1       = $('#exentasFilter1N').val() || '';
	        var exentasV2       = $('#exentasFilter2N').val() || '';

	        var gravadasOperator = ($('#gravadasOperatorN').val() || 'eq').toLowerCase();
	        var gravadasV1       = $('#gravadasFilter1N').val() || '';
	        var gravadasV2       = $('#gravadasFilter2N').val() || '';

	        var otrosOperator    = ($('#otrosOperatorN').val() || 'eq').toLowerCase();
	        var otrosV1          = $('#otrosFilter1N').val() || '';
	        var otrosV2          = $('#otrosFilter2N').val() || '';
	        // ==========================================

	        // 4) Helper para inyectar inputs
	        var $form = $(document.frmBovedaNominaZIP);
	        function put(id, name, val){
	          var el = document.getElementById(id);
	          if(!el){
	            el = document.createElement('input');
	            el.type = 'hidden';
	            el.id   = id;
	            el.name = name;
	            $form.append(el);
	          }
	          el.value = (val == null ? '' : val);
	        }

	        // 5) Básicos
	        put('fechaInicialZIP_Nomina', 'fechaInicial', fechaInicial);
	        put('fechaFinalZIP_Nomina',   'fechaFinal',   fechaFinal);
	        put('rfcZIP_Nomina',          'rfc',          rfc);
	        put('razonSocialZIP_Nomina',  'razonSocial',  razonSocial);
	        put('uuidBovedaZIP_Nomina',   'uuid',         uuid);
	        put('serieZIP_Nomina',        'serie',        serie);
	        put('folioZIP_Nomina',        'folio',        folio);
	        put('idRegistroZIP_Nomina',   'idRegistro',   uuidRegistro);

	        // 6) Operadores/valores DX-like
	        put('rfcOperatorZIP_Nomina',    'rfcOperator',    rfcOperator);
	        put('razonOperatorZIP_Nomina',  'razonOperator',  razonOperator);
	        put('serieOperatorZIP_Nomina',  'serieOperator',  serieOperator);
	        put('uuidOperatorZIP_Nomina',   'uuidOperator',   uuidOperator);

	        put('dateOperatorZIP_Nomina',   'dateOperator',   dateOperator);
	        put('dateV1ZIP_Nomina',         'dateV1',         dateV1);
	        put('dateV2ZIP_Nomina',         'dateV2',         dateV2);

	        put('folioOperatorZIP_Nomina',  'folioOperator',  folioOperator);
	        put('folioV1ZIP_Nomina',        'folioV1',        folioV1);
	        put('folioV2ZIP_Nomina',        'folioV2',        folioV2);

	        put('totalOperatorZIP_Nomina',  'totalOperator',  totalOperator);
	        put('totalV1ZIP_Nomina',        'totalV1',        totalV1);
	        put('totalV2ZIP_Nomina',        'totalV2',        totalV2);

	        put('subOperatorZIP_Nomina',    'subOperator',    subOperator);
	        put('subV1ZIP_Nomina',          'subV1',          subV1);
	        put('subV2ZIP_Nomina',          'subV2',          subV2);

	        put('descOperatorZIP_Nomina',   'descOperator',   descOperator);
	        put('descV1ZIP_Nomina',         'descV1',         descV1);
	        put('descV2ZIP_Nomina',         'descV2',         descV2);

	        put('percOperatorZIP_Nomina',   'percOperator',   percOperator);
	        put('percV1ZIP_Nomina',         'percV1',         percV1);
	        put('percV2ZIP_Nomina',         'percV2',         percV2);

	        put('dedOperatorZIP_Nomina',    'dedOperator',    dedOperator);
	        put('dedV1ZIP_Nomina',          'dedV1',          dedV1);
	        put('dedV2ZIP_Nomina',          'dedV2',          dedV2);

	        // === AGREGADO: Envío de nuevos filtros al ZIP ===
	        
	        // Exentas
	        put('exentasOperatorZIP_Nomina', 'exentasOperator', exentasOperator);
	        put('exentasV1ZIP_Nomina',       'exentasV1',       exentasV1);
	        put('exentasV2ZIP_Nomina',       'exentasV2',       exentasV2);

	        // Gravadas
	        put('gravadasOperatorZIP_Nomina', 'gravadasOperator', gravadasOperator);
	        put('gravadasV1ZIP_Nomina',       'gravadasV1',       gravadasV1);
	        put('gravadasV2ZIP_Nomina',       'gravadasV2',       gravadasV2);

	        // Otros Pagos
	        put('otrosOperatorZIP_Nomina',    'otrosOperator',    otrosOperator);
	        put('otrosV1ZIP_Nomina',          'otrosV1',          otrosV1);
	        put('otrosV2ZIP_Nomina',          'otrosV2',          otrosV2);
	        // ================================================

	        // 7) Submit
	        document.frmBovedaNominaZIP.submit();

	      } catch(e){
	        alert('descargarCFDINomina(): '+e);
	      }
	  }

	
	  /* ===========================
	   * Reporte Resumen (Nómina)
	   * =========================== */
	  function reporteResumen(){
	      try{
	          var fechaInicial = obtenerFechaIni_Nomina();
	          var fechaFinal = obtenerFechaFin_Nomina();

	          $.ajax({
	              url  : '/siarex247/cumplimientoFiscal/boveda/recibidos/validarFechas.action',
	              data : {
	                  fechaInicial : fechaInicial,
	                  fechaFinal  : fechaFinal
	              },
	              type : 'POST', 
	              dataType : 'json',
	              success  : function(data) {
	                  if($.isEmptyObject(data)) {
	                     
	                  } else {
	                      if (data.codError == '000') {
	                            // ===== A) Selección de filas (UUIDs) =====
	                            var uuidRegistro = '';
	                            var dataSelect = (window.tablaDetalleNomina && tablaDetalleNomina.rows) 
	                                              ? tablaDetalleNomina.rows('.selected').data() 
	                                              : null;
	                            if (dataSelect && dataSelect.length){
	                              $.each(dataSelect, function(_, row){ uuidRegistro += (row.uuid || '') + ';'; });
	                            }
	                            var arrElementos = uuidRegistro.split(';');
	                            /*
	                            if (arrElementos.length > 50000){
	                              Swal.fire({
	                                title: MSG_ERROR_OPERACION_MENU,
	                                html : '<p>'+LABEL_BOVEDA_TEXT4+'</p>',
	                                icon : 'info'
	                              });
	                              return;
	                            }
	                            */

	                            // ===== B) Tomar valores desde filtros =====
	                            var rfc          = ($('#rfcFilterInputN').length   ? $('#rfcFilterInputN').val()   : '') || obtenerRFC_Nomina();
	                            var razonSocial  = ($('#razonFilterInputN').length ? $('#razonFilterInputN').val() : '') || obtenerRazon_Nomina();
	                            var serie        = ($('#serieFilterInputN').length ? $('#serieFilterInputN').val() : '') || obtenerSerie_Nomina();
	                            var uuid         = ($('#uuidFilterInputN').length  ? $('#uuidFilterInputN').val()  : '') || obtenerUUID_Nomina();
	                            var folio        = ($('#folioFilter1N').length     ? $('#folioFilter1N').val()     : '') || obtenerFolio_Nomina();

	                            // ===== C) Operadores DX-like =====
	                            var rfcOp    = ($('#rfcOperatorN').val()   || 'contains').toLowerCase();
	                            var razonOp  = ($('#razonOperatorN').val() || 'contains').toLowerCase();
	                            var serieOp  = ($('#serieOperatorN').val() || 'contains').toLowerCase();
	                            var uuidOp   = ($('#uuidOperatorN').val()  || 'contains').toLowerCase();

	                            var dateOp   = ($('#dateOperatorN').val()  || 'eq').toLowerCase();
	                            var dateV1   = $('#dateFilter1N').val() || '';
	                            var dateV2   = $('#dateFilter2N').val() || '';

	                            var folioOp  = ($('#folioOperatorN').val() || 'eq').toLowerCase();
	                            var folioV1  = $('#folioFilter1N').val() || '';
	                            var folioV2  = $('#folioFilter2N').val() || '';

	                            var totalOp  = ($('#totalOperatorN').val() || 'eq').toLowerCase();
	                            var totalV1  = $('#totalFilter1N').val() || '';
	                            var totalV2  = $('#totalFilter2N').val() || '';

	                            var subOp    = ($('#subOperatorN').val() || 'eq').toLowerCase();
	                            var subV1    = $('#subFilter1N').val() || '';
	                            var subV2    = $('#subFilter2N').val() || '';

	                            var descOp   = ($('#descOperatorN').val() || 'eq').toLowerCase();
	                            var descV1   = $('#descFilter1N').val() || '';
	                            var descV2   = $('#descFilter2N').val() || '';

	                            var percOp   = ($('#percOperatorN').val() || 'eq').toLowerCase();
	                            var percV1   = $('#percFilter1N').val() || '';
	                            var percV2   = $('#percFilter2N').val() || '';

	                            var dedOp    = ($('#dedOperatorN').val() || 'eq').toLowerCase();
	                            var dedV1    = $('#dedFilter1N').val() || '';
	                            var dedV2    = $('#dedFilter2N').val() || '';

	                            // === AGREGADO: Lectura de nuevos filtros ===
	                            var exentasOp = ($('#exentasOperatorN').val() || 'eq').toLowerCase();
	                            var exentasV1 = $('#exentasFilter1N').val() || '';
	                            var exentasV2 = $('#exentasFilter2N').val() || '';

	                            var gravadasOp = ($('#gravadasOperatorN').val() || 'eq').toLowerCase();
	                            var gravadasV1 = $('#gravadasFilter1N').val() || '';
	                            var gravadasV2 = $('#gravadasFilter2N').val() || '';

	                            var otrosOp    = ($('#otrosOperatorN').val() || 'eq').toLowerCase();
	                            var otrosV1    = $('#otrosFilter1N').val() || '';
	                            var otrosV2    = $('#otrosFilter2N').val() || '';
	                            // ==========================================

	                            // ===== D) Helper =====
	                            var $form = $(document.frmNominaResumen);
	                            function put(id, name, val){
	                              var el = document.getElementById(id);
	                              if(!el){
	                                el = document.createElement('input');
	                                el.type = 'hidden';
	                                el.id   = id;
	                                el.name = name;
	                                $form.append(el);
	                              }
	                              el.value = (val == null ? '' : val);
	                            }

	                            // ===== E) Llenar form con básicos =====
	                            put('rfc_Nomina_Resumen',          'rfc',          rfc);
	                            put('razonSocial_Nomina_Resumen',  'razonSocial',  razonSocial);
	                            put('folio_Nomina_Resumen',        'folio',        folio);
	                            put('serie_Nomina_Resumen',        'serie',        serie);
	                            put('fechaInicial_Nomina_Resumen', 'fechaInicial', fechaInicial);
	                            put('fechaFinal_Nomina_Resumen',   'fechaFinal',   fechaFinal);
	                            put('uuid_Nomina_Resumen',         'uuid',         uuid);
	                            put('idRegistroResumen_Nomina',    'idRegistro',   uuidRegistro);

	                            // ===== F) Operadores / valores avanzados =====
	                            put('rfcOperator_Nomina_Resumen',    'rfcOperator',    rfcOp);
	                            put('razonOperator_Nomina_Resumen',  'razonOperator',  razonOp);
	                            put('serieOperator_Nomina_Resumen',  'serieOperator',  serieOp);
	                            put('uuidOperator_Nomina_Resumen',   'uuidOperator',   uuidOp);

	                            put('dateOperator_Nomina_Resumen',   'dateOperator',   dateOp);
	                            put('dateV1_Nomina_Resumen',         'dateV1',         dateV1);
	                            put('dateV2_Nomina_Resumen',         'dateV2',         dateV2);

	                            put('folioOperator_Nomina_Resumen',  'folioOperator',  folioOp);
	                            put('folioV1_Nomina_Resumen',        'folioV1',        folioV1);
	                            put('folioV2_Nomina_Resumen',        'folioV2',        folioV2);

	                            put('totalOperator_Nomina_Resumen',  'totalOperator',  totalOp);
	                            put('totalV1_Nomina_Resumen',        'totalV1',        totalV1);
	                            put('totalV2_Nomina_Resumen',        'totalV2',        totalV2);

	                            put('subOperator_Nomina_Resumen',    'subOperator',    subOp);
	                            put('subV1_Nomina_Resumen',          'subV1',          subV1);
	                            put('subV2_Nomina_Resumen',          'subV2',          subV2);

	                            put('descOperator_Nomina_Resumen',   'descOperator',   descOp);
	                            put('descV1_Nomina_Resumen',         'descV1',         descV1);
	                            put('descV2_Nomina_Resumen',         'descV2',         descV2);

	                            put('percOperator_Nomina_Resumen',   'percOperator',   percOp);
	                            put('percV1_Nomina_Resumen',         'percV1',         percV1);
	                            put('percV2_Nomina_Resumen',         'percV2',         percV2);

	                            put('dedOperator_Nomina_Resumen',    'dedOperator',    dedOp);
	                            put('dedV1_Nomina_Resumen',          'dedV1',          dedV1);
	                            put('dedV2_Nomina_Resumen',          'dedV2',          dedV2);

	                            // === AGREGADO: Enviar nuevos filtros al form ===
	                            // Exentas
	                            put('exentasOperator_Nomina_Resumen', 'exentasOperator', exentasOp);
	                            put('exentasV1_Nomina_Resumen',       'exentasV1',       exentasV1);
	                            put('exentasV2_Nomina_Resumen',       'exentasV2',       exentasV2);

	                            // Gravadas
	                            put('gravadasOperator_Nomina_Resumen', 'gravadasOperator', gravadasOp);
	                            put('gravadasV1_Nomina_Resumen',       'gravadasV1',       gravadasV1);
	                            put('gravadasV2_Nomina_Resumen',       'gravadasV2',       gravadasV2);

	                            // Otros Pagos
	                            put('otrosOperator_Nomina_Resumen',    'otrosOperator',    otrosOp);
	                            put('otrosV1_Nomina_Resumen',          'otrosV1',          otrosV1);
	                            put('otrosV2_Nomina_Resumen',          'otrosV2',          otrosV2);
	                            // ===============================================

	                            // ===== G) Submit =====
	                            document.frmNominaResumen.submit();
	                      } else {
	                          Swal.fire({
	                              title: '¡Rango de fechas no valido!',
	                              html: '<p>'+data.mensajeError+'</p>',    
	                              icon: 'info'
	                          });
	                      }
	                  }
	              },
	              error : function(xhr, ajaxOptions, thrownError) {
	                  alert('validarFechas()_'+thrownError);
	              }
	          }); 

	      }catch(e){
	        alert('reporteResumen()_' + e);
	      }
	  }

	

	  /* ===========================
	   * Reporte Detalle (Nómina)
	   * =========================== */
	  function reporteDetalle(){
	      try{
	          var fechaInicial = obtenerFechaIni_Nomina();
	          var fechaFinal = obtenerFechaFin_Nomina();

	          $.ajax({
	              url  : '/siarex247/cumplimientoFiscal/boveda/recibidos/validarFechas.action',
	              data : {
	                  fechaInicial : fechaInicial,
	                  fechaFinal  : fechaFinal
	              },
	              type : 'POST', 
	              dataType : 'json',
	              success  : function(data) {
	                  if($.isEmptyObject(data)) {
	                     
	                  } else {
	                      if (data.codError == '000') {
	                          // ==== A) UUIDs seleccionados
	                          var uuidRegistro = '';
	                          var dataSelect = (window.tablaDetalleNomina && tablaDetalleNomina.rows) 
	                                            ? tablaDetalleNomina.rows('.selected').data() 
	                                            : null;
	                          if (dataSelect && dataSelect.length){
	                            $.each(dataSelect, function(_, row){ uuidRegistro += (row.uuid || '') + ';'; });
	                          }
	                          var arrElementos = uuidRegistro.split(';');
	                          /*
	                          if (arrElementos.length > 50000){
	                            Swal.fire({
	                              title: MSG_ERROR_OPERACION_MENU,
	                              html : '<p>'+LABEL_BOVEDA_TEXT4+'</p>',
	                              icon : 'info'
	                            });
	                            return;
	                          }
	                          */

	                          // ==== B) Valores desde filtros
	                          var rfc          = ($('#rfcFilterInputN').length   ? $('#rfcFilterInputN').val()   : '') || obtenerRFC_Nomina();
	                          var razonSocial  = ($('#razonFilterInputN').length ? $('#razonFilterInputN').val() : '') || obtenerRazon_Nomina();
	                          var serie        = ($('#serieFilterInputN').length ? $('#serieFilterInputN').val() : '') || obtenerSerie_Nomina();
	                          var uuid         = ($('#uuidFilterInputN').length  ? $('#uuidFilterInputN').val()  : '') || obtenerUUID_Nomina();
	                          var folio        = ($('#folioFilter1N').length     ? $('#folioFilter1N').val()     : '') || obtenerFolio_Nomina();

	                          // ==== C) Operadores y valores
	                          var rfcOp    = ($('#rfcOperatorN').val()   || 'contains').toLowerCase();
	                          var razonOp  = ($('#razonOperatorN').val() || 'contains').toLowerCase();
	                          var serieOp  = ($('#serieOperatorN').val() || 'contains').toLowerCase();
	                          var uuidOp   = ($('#uuidOperatorN').val()  || 'contains').toLowerCase();

	                          var dateOp   = ($('#dateOperatorN').val()  || 'eq').toLowerCase();
	                          var dateV1   = $('#dateFilter1N').val() || '';
	                          var dateV2   = $('#dateFilter2N').val() || '';

	                          var folioOp  = ($('#folioOperatorN').val() || 'eq').toLowerCase();
	                          var folioV1  = $('#folioFilter1N').val() || '';
	                          var folioV2  = $('#folioFilter2N').val() || '';

	                          var totalOp  = ($('#totalOperatorN').val() || 'eq').toLowerCase();
	                          var totalV1  = $('#totalFilter1N').val() || '';
	                          var totalV2  = $('#totalFilter2N').val() || '';

	                          var subOp    = ($('#subOperatorN').val() || 'eq').toLowerCase();
	                          var subV1    = $('#subFilter1N').val() || '';
	                          var subV2    = $('#subFilter2N').val() || '';

	                          var descOp   = ($('#descOperatorN').val() || 'eq').toLowerCase();
	                          var descV1   = $('#descFilter1N').val() || '';
	                          var descV2   = $('#descFilter2N').val() || '';

	                          var percOp   = ($('#percOperatorN').val() || 'eq').toLowerCase();
	                          var percV1   = $('#percFilter1N').val() || '';
	                          var percV2   = $('#percFilter2N').val() || '';

	                          var dedOp    = ($('#dedOperatorN').val() || 'eq').toLowerCase();
	                          var dedV1    = $('#dedFilter1N').val() || '';
	                          var dedV2    = $('#dedFilter2N').val() || '';

	                          // === AGREGADO: Nuevos Filtros ===
	                          var exentasOp = ($('#exentasOperatorN').val() || 'eq').toLowerCase();
	                          var exentasV1 = $('#exentasFilter1N').val() || '';
	                          var exentasV2 = $('#exentasFilter2N').val() || '';

	                          var gravadasOp = ($('#gravadasOperatorN').val() || 'eq').toLowerCase();
	                          var gravadasV1 = $('#gravadasFilter1N').val() || '';
	                          var gravadasV2 = $('#gravadasFilter2N').val() || '';

	                          var otrosOp    = ($('#otrosOperatorN').val() || 'eq').toLowerCase();
	                          var otrosV1    = $('#otrosFilter1N').val() || '';
	                          var otrosV2    = $('#otrosFilter2N').val() || '';
	                          // ================================

	                          // ==== D) Helper de hidden inputs
	                          var $form = $(document.frmNominaDetalle);
	                          function put(id, name, val){
	                            var el = document.getElementById(id);
	                            if(!el){
	                              el = document.createElement('input');
	                              el.type = 'hidden';
	                              el.id   = id;
	                              el.name = name;
	                              $form.append(el);
	                            }
	                            el.value = (val == null ? '' : val);
	                          }

	                          // ==== E) Básicos
	                          put('rfc_Nomina_Detalle',          'rfc',          rfc);
	                          put('razonSocial_Nomina_Detalle',  'razonSocial',  razonSocial);
	                          put('folio_Nomina_Detalle',        'folio',        folio);
	                          put('serie_Nomina_Detalle',        'serie',        serie);
	                          put('fechaInicial_Nomina_Detalle', 'fechaInicial', fechaInicial);
	                          put('fechaFinal_Nomina_Detalle',   'fechaFinal',   fechaFinal);
	                          put('uuid_Nomina_Detalle',         'uuid',         uuid);
	                          put('idRegistroDetalle_Nomina',    'idRegistro',   uuidRegistro);

	                          // ==== F) Operadores / valores avanzados
	                          put('rfcOperator_Nomina_Detalle',    'rfcOperator',    rfcOp);
	                          put('razonOperator_Nomina_Detalle',  'razonOperator',  razonOp);
	                          put('serieOperator_Nomina_Detalle',  'serieOperator',  serieOp);
	                          put('uuidOperator_Nomina_Detalle',   'uuidOperator',   uuidOp);

	                          put('dateOperator_Nomina_Detalle',   'dateOperator',   dateOp);
	                          put('dateV1_Nomina_Detalle',         'dateV1',         dateV1);
	                          put('dateV2_Nomina_Detalle',         'dateV2',         dateV2);

	                          put('folioOperator_Nomina_Detalle',  'folioOperator',  folioOp);
	                          put('folioV1_Nomina_Detalle',        'folioV1',        folioV1);
	                          put('folioV2_Nomina_Detalle',        'folioV2',        folioV2);

	                          put('totalOperator_Nomina_Detalle',  'totalOperator',  totalOp);
	                          put('totalV1_Nomina_Detalle',        'totalV1',        totalV1);
	                          put('totalV2_Nomina_Detalle',        'totalV2',        totalV2);

	                          put('subOperator_Nomina_Detalle',    'subOperator',    subOp);
	                          put('subV1_Nomina_Detalle',          'subV1',          subV1);
	                          put('subV2_Nomina_Detalle',          'subV2',          subV2);

	                          put('descOperator_Nomina_Detalle',   'descOperator',   descOp);
	                          put('descV1_Nomina_Detalle',         'descV1',         descV1);
	                          put('descV2_Nomina_Detalle',         'descV2',         descV2);

	                          put('percOperator_Nomina_Detalle',   'percOperator',   percOp);
	                          put('percV1_Nomina_Detalle',         'percV1',         percV1);
	                          put('percV2_Nomina_Detalle',         'percV2',         percV2);

	                          put('dedOperator_Nomina_Detalle',    'dedOperator',    dedOp);
	                          put('dedV1_Nomina_Detalle',          'dedV1',          dedV1);
	                          put('dedV2_Nomina_Detalle',          'dedV2',          dedV2);

	                          // === AGREGADO: Enviar nuevos filtros al form ===
	                          // Exentas
	                          put('exentasOperator_Nomina_Detalle', 'exentasOperator', exentasOp);
	                          put('exentasV1_Nomina_Detalle',       'exentasV1',       exentasV1);
	                          put('exentasV2_Nomina_Detalle',       'exentasV2',       exentasV2);

	                          // Gravadas
	                          put('gravadasOperator_Nomina_Detalle', 'gravadasOperator', gravadasOp);
	                          put('gravadasV1_Nomina_Detalle',       'gravadasV1',       gravadasV1);
	                          put('gravadasV2_Nomina_Detalle',       'gravadasV2',       gravadasV2);

	                          // Otros Pagos
	                          put('otrosOperator_Nomina_Detalle',    'otrosOperator',    otrosOp);
	                          put('otrosV1_Nomina_Detalle',          'otrosV1',          otrosV1);
	                          put('otrosV2_Nomina_Detalle',          'otrosV2',          otrosV2);
	                          // ===============================================

	                          // ==== G) Submit
	                          document.frmNominaDetalle.submit();
	                      } else {
	                          Swal.fire({
	                              title: '¡Rango de fechas no valido!',
	                              html: '<p>'+data.mensajeError+'</p>',    
	                              icon: 'info'
	                          });
	                      }
	                  }
	              },
	              error : function(xhr, ajaxOptions, thrownError) {
	                  alert('validarFechas()_'+thrownError);
	              }
	          }); 
	      }catch(e){
	        alert('reporteDetalle()_' + e);
	      }
	  }

	  /* ===========================
	   * Reporte Nómina (Acumulado / principal)
	   * =========================== */
	  function reporteNomina(){
	      try{
	          var fechaInicial = obtenerFechaIni_Nomina();
	          var fechaFinal = obtenerFechaFin_Nomina();

	          $.ajax({
	              url  : '/siarex247/cumplimientoFiscal/boveda/recibidos/validarFechas.action',
	              data : {
	                  fechaInicial : fechaInicial,
	                  fechaFinal  : fechaFinal
	              },
	              type : 'POST', 
	              dataType : 'json',
	              success  : function(data) {
	                  if($.isEmptyObject(data)) {
	                     
	                  } else {
	                      if (data.codError == '000') {
	                          // ==== A) UUIDs seleccionados
	                          var uuidRegistro = '';
	                          var dataSelect = (window.tablaDetalleNomina && tablaDetalleNomina.rows) 
	                                            ? tablaDetalleNomina.rows('.selected').data() 
	                                            : null;
	                          if (dataSelect && dataSelect.length){
	                            $.each(dataSelect, function(_, row){ uuidRegistro += (row.uuid || '') + ';'; });
	                          }
	                          var arrElementos = uuidRegistro.split(';');
	                          if (arrElementos.length > 50000){
	                            Swal.fire({
	                              title: MSG_ERROR_OPERACION_MENU,
	                              html : '<p>'+LABEL_BOVEDA_TEXT4+'</p>',
	                              icon : 'info'
	                            });
	                            return;
	                          }

	                          // ==== B) Valores desde filtros
	                          var rfc          = ($('#rfcFilterInputN').length   ? $('#rfcFilterInputN').val()   : '') || obtenerRFC_Nomina();
	                          var razonSocial  = ($('#razonFilterInputN').length ? $('#razonFilterInputN').val() : '') || obtenerRazon_Nomina();
	                          var serie        = ($('#serieFilterInputN').length ? $('#serieFilterInputN').val() : '') || obtenerSerie_Nomina();
	                          var uuid         = ($('#uuidFilterInputN').length  ? $('#uuidFilterInputN').val()  : '') || obtenerUUID_Nomina();
	                          var folio        = ($('#folioFilter1N').length     ? $('#folioFilter1N').val()     : '') || obtenerFolio_Nomina();

	                          // ==== C) Operadores y valores
	                          var rfcOp    = ($('#rfcOperatorN').val()   || 'contains').toLowerCase();
	                          var razonOp  = ($('#razonOperatorN').val() || 'contains').toLowerCase();
	                          var serieOp  = ($('#serieOperatorN').val() || 'contains').toLowerCase();
	                          var uuidOp   = ($('#uuidOperatorN').val()  || 'contains').toLowerCase();

	                          var dateOp   = ($('#dateOperatorN').val()  || 'eq').toLowerCase();
	                          var dateV1   = $('#dateFilter1N').val() || '';
	                          var dateV2   = $('#dateFilter2N').val() || '';

	                          var folioOp  = ($('#folioOperatorN').val() || 'eq').toLowerCase();
	                          var folioV1  = $('#folioFilter1N').val() || '';
	                          var folioV2  = $('#folioFilter2N').val() || '';

	                          var totalOp  = ($('#totalOperatorN').val() || 'eq').toLowerCase();
	                          var totalV1  = $('#totalFilter1N').val() || '';
	                          var totalV2  = $('#totalFilter2N').val() || '';

	                          var subOp    = ($('#subOperatorN').val() || 'eq').toLowerCase();
	                          var subV1    = $('#subFilter1N').val() || '';
	                          var subV2    = $('#subFilter2N').val() || '';

	                          var descOp   = ($('#descOperatorN').val() || 'eq').toLowerCase();
	                          var descV1   = $('#descFilter1N').val() || '';
	                          var descV2   = $('#descFilter2N').val() || '';

	                          var percOp   = ($('#percOperatorN').val() || 'eq').toLowerCase();
	                          var percV1   = $('#percFilter1N').val() || '';
	                          var percV2   = $('#percFilter2N').val() || '';

	                          var dedOp    = ($('#dedOperatorN').val() || 'eq').toLowerCase();
	                          var dedV1    = $('#dedFilter1N').val() || '';
	                          var dedV2    = $('#dedFilter2N').val() || '';

	                          // === AGREGADO: Nuevos Filtros ===
	                          var exentasOp = ($('#exentasOperatorN').val() || 'eq').toLowerCase();
	                          var exentasV1 = $('#exentasFilter1N').val() || '';
	                          var exentasV2 = $('#exentasFilter2N').val() || '';

	                          var gravadasOp = ($('#gravadasOperatorN').val() || 'eq').toLowerCase();
	                          var gravadasV1 = $('#gravadasFilter1N').val() || '';
	                          var gravadasV2 = $('#gravadasFilter2N').val() || '';

	                          var otrosOp    = ($('#otrosOperatorN').val() || 'eq').toLowerCase();
	                          var otrosV1    = $('#otrosFilter1N').val() || '';
	                          var otrosV2    = $('#otrosFilter2N').val() || '';
	                          // ================================

	                          // ==== D) Helper de hidden inputs
	                          var $form = $(document.frmNominaReporte);
	                          function put(id, name, val){
	                            var el = document.getElementById(id);
	                            if(!el){
	                              el = document.createElement('input');
	                              el.type = 'hidden';
	                              el.id   = id;
	                              el.name = name;
	                              $form.append(el);
	                            }
	                            el.value = (val == null ? '' : val);
	                          }

	                          // ==== E) Básicos
	                          put('rfc_Nomina_Reporte',          'rfc',          rfc);
	                          put('razonSocial_Nomina_Reporte',  'razonSocial',  razonSocial);
	                          put('folio_Nomina_Reporte',        'folio',        folio);
	                          put('serie_Nomina_Reporte',        'serie',        serie);
	                          put('fechaInicial_Nomina_Reporte', 'fechaInicial', fechaInicial);
	                          put('fechaFinal_Nomina_Reporte',   'fechaFinal',   fechaFinal);
	                          put('uuid_Nomina_Reporte',         'uuid',         uuid);
	                          put('idRegistroReporte_Nomina',    'idRegistro',   uuidRegistro);

	                          // ==== F) Operadores / valores avanzados
	                          put('rfcOperator_Nomina_Reporte',    'rfcOperator',    rfcOp);
	                          put('razonOperator_Nomina_Reporte',  'razonOperator',  razonOp);
	                          put('serieOperator_Nomina_Reporte',  'serieOperator',  serieOp);
	                          put('uuidOperator_Nomina_Reporte',   'uuidOperator',   uuidOp);

	                          put('dateOperator_Nomina_Reporte',   'dateOperator',   dateOp);
	                          put('dateV1_Nomina_Reporte',         'dateV1',         dateV1);
	                          put('dateV2_Nomina_Reporte',         'dateV2',         dateV2);

	                          put('folioOperator_Nomina_Reporte',  'folioOperator',  folioOp);
	                          put('folioV1_Nomina_Reporte',        'folioV1',        folioV1);
	                          put('folioV2_Nomina_Reporte',        'folioV2',        folioV2);

	                          put('totalOperator_Nomina_Reporte',  'totalOperator',  totalOp);
	                          put('totalV1_Nomina_Reporte',        'totalV1',        totalV1);
	                          put('totalV2_Nomina_Reporte',        'totalV2',        totalV2);

	                          put('subOperator_Nomina_Reporte',    'subOperator',    subOp);
	                          put('subV1_Nomina_Reporte',          'subV1',          subV1);
	                          put('subV2_Nomina_Reporte',          'subV2',          subV2);

	                          put('descOperator_Nomina_Reporte',   'descOperator',   descOp);
	                          put('descV1_Nomina_Reporte',         'descV1',         descV1);
	                          put('descV2_Nomina_Reporte',         'descV2',         descV2);

	                          put('percOperator_Nomina_Reporte',   'percOperator',   percOp);
	                          put('percV1_Nomina_Reporte',         'percV1',         percV1);
	                          put('percV2_Nomina_Reporte',         'percV2',         percV2);

	                          put('dedOperator_Nomina_Reporte',    'dedOperator',    dedOp);
	                          put('dedV1_Nomina_Reporte',          'dedV1',          dedV1);
	                          put('dedV2_Nomina_Reporte',          'dedV2',          dedV2);

	                          // === AGREGADO: Enviar nuevos filtros al form ===
	                          // Exentas
	                          put('exentasOperator_Nomina_Reporte', 'exentasOperator', exentasOp);
	                          put('exentasV1_Nomina_Reporte',       'exentasV1',       exentasV1);
	                          put('exentasV2_Nomina_Reporte',       'exentasV2',       exentasV2);

	                          // Gravadas
	                          put('gravadasOperator_Nomina_Reporte', 'gravadasOperator', gravadasOp);
	                          put('gravadasV1_Nomina_Reporte',       'gravadasV1',       gravadasV1);
	                          put('gravadasV2_Nomina_Reporte',       'gravadasV2',       gravadasV2);

	                          // Otros Pagos
	                          put('otrosOperator_Nomina_Reporte',    'otrosOperator',    otrosOp);
	                          put('otrosV1_Nomina_Reporte',          'otrosV1',          otrosV1);
	                          put('otrosV2_Nomina_Reporte',          'otrosV2',          otrosV2);
	                          // ===============================================

	                          // ==== G) Submit
	                          document.frmNominaReporte.submit();
	                      } else {
	                          Swal.fire({
	                              title: '¡Rango de fechas no valido!',
	                              html: '<p>'+data.mensajeError+'</p>',    
	                              icon: 'info'
	                          });
	                      }
	                  }
	              },
	              error : function(xhr, ajaxOptions, thrownError) {
	                  alert('validarFechas()_'+thrownError);
	              }
	          }); 
	      }catch(e){
	        alert('reporteNomina()_' + e);
	      }
	  }

	 
	 
	 function getElementosFilterEmitidos(){
		 var llavesUUID = '';
		 try{
			 var dataSelect = tablaDetalleNomina.rows('.selected').data(); 
				$.each(dataSelect, function(key, row) {
					llavesUUID+= row.uuid + ";"		
			    });

		 }catch(e){
			 alert('getElementosFilterEmitidos()_'+e);
		 }
		 return llavesUUID;
	 }

	 
	 function getElementosEmitidos(){
			var llaveRegistros = '';
			try{
				 var table = $('#tablaDetalleNomina').DataTable();
				 var bandPrimero = true;
				 table.column(11, { search:'applied' }).data().each(function(value, index) {
					 if (bandPrimero){
						 llaveRegistros = value;
					 }else{
						 llaveRegistros = llaveRegistros +  ";"  + value;
					 }
					 bandPrimero = false;
				 });
			}catch(e){
				alert('getElementosEmitidos()_'+e);
			}
			return llaveRegistros;
		}	
	 
		
	 function obtenerFechasFiltroNomina(){
		//console.log('ENTRO');
			$.ajax({
				url  : '/siarex247/cumplimientoFiscal/boveda/nomina/consultarFechasNomina.action',
				type : 'POST', 
							data : null,
							dataType : 'json',
							success  : function(data) {
								if($.isEmptyObject(data)) {
								   
								} else {
									// $('#fechaInicial_Recibidos').val(data.fechaInicial);
									// $('#fechaFinal_Recibidos').val(data.fechaFinal);
									// var fechas = data.fechaInicial + '  a  ' + data.fechaFinal;
									// $('#CRMDateRangeN').val(fechas);
									obtenerFechasMinimaNomina(data.fechaInicial, data.fechaFinal);
									
								}
							},
							error : function(xhr, ajaxOptions, thrownError) {
								alert('obtenerFechasFiltro()_'+thrownError);
							}
						});	
			
	    }
	 
	function validarFechas_Nomina(){
		var fechaInicial = obtenerFechaIni_Nomina();
		var fechaFinal = obtenerFechaFin_Nomina();
		$.ajax({
			url  : '/siarex247/cumplimientoFiscal/boveda/recibidos/validarFechas.action',
			data : {
				fechaInicial : fechaInicial,
				fechaFinal  : fechaFinal
			},
			type : 'POST', 
			dataType : 'json',
			success  : function(data) {
				if($.isEmptyObject(data)) {
				   
				} else {
					if (data.codError == '000') {
						window.__copiarTheadAGlobalesN();
						refrescarBovedaNomina();
					} else {
						Swal.fire({
  			                title: '¡Rango de fechas no valido!',
  			                html: '<p>'+data.mensajeError+'</p>',	
  			                icon: 'info'
  			            });
					}
				}
			},
			error : function(xhr, ajaxOptions, thrownError) {
				alert('validarFechas()_'+thrownError);
			}
		});	
		
    }
	
	
	function consultarFechaNomina(){
		$.ajax({
			url  : '/siarex247/cumplimientoFiscal/boveda/nomina/consultarFechaNomina.action',
			type : 'POST', 
			data : null,
			dataType : 'json',
			success  : function(data) {
				if($.isEmptyObject(data)) {
				   
				} else {
					
					document.getElementById("BOVEDA_NOMINA_ETQ7").innerHTML = LABEL_BOVEDA_NOMINA_ETQ7 + ' ' + data.fechaDescarga;
					
					
					
				}
			},
			error : function(xhr, ajaxOptions, thrownError) {
				alert('buscaCatalogo()_'+thrownError);
			}
		});	
		
    }
	


	// Debounce + lock para evitar múltiples llamadas (Nómina)
	//let __nominaBusy = false;
	//let __nominaDebounce = null;

	function refrescarBovedaNomina(){
	  try{
	    if (__nominaDebounce) clearTimeout(__nominaDebounce);
	    __nominaDebounce = setTimeout(function(){
	      if (__nominaBusy) return; // ya hay un request en vuelo
	      const dt = $('#tablaDetalleNomina').DataTable();
	      if (!dt) return;

	      __nominaBusy = true;

	      // Solo recarga el ajax; no limpiar ni redibujar manual
		  //tablaDetalleNomina.page('first').draw('page');
	      dt.ajax.reload(function(){
	        __nominaBusy = false;
	      }, true); // false = conserva la página actual
	    }, 120); // pequeño debounce por tecleo rápido
	  }catch(e){
	    alert('refrescarBovedaNomina()_ ' + e);
	    __nominaBusy = false;
	  }
	}

	
	

	function obtenerRFC_Nomina(){
		return $('#rfc_Nomina').val();
	}
	
	function obtenerRazon_Nomina(){
		return $('#razonSocial_Nomina').val();
	}
	
	function obtenerFolio_Nomina(){
		return $('#folio_Nomina').val();
	}
	
	function obtenerSerie_Nomina(){
		return $('#serie_Nomina').val();
	}
	
	function obtenerFechaIni_Nomina(){
		return $('#fechaInicial_Nomina_Filtro').val();
	}
	
	
	function obtenerFechaFin_Nomina(){
		return $('#fechaFinal_Nomina_Filtro').val();
	}
	
	function obtenerUUID_Nomina(){
		return $('#uuid_Nomina').val();
	}
	
	
	// == Bóveda Nómina: limpiar todos los filtros del thead y campos globales ==
	function limpiarNomina(){
	  try{
	    // ===== 1) Campos “globales” (Hidden) que consume el backend =====
	    $('#rfc_Nomina, #razonSocial_Nomina, #folio_Nomina, #serie_Nomina, #uuid_Nomina').val('');
	    $('#fechaInicial_Nomina, #fechaFinal_Nomina').val('');

	    // ===== 2) Helper para operador + etiqueta (texto) =====
	    const setOp = (hiddenSel, labelSel, val, labelHtml) => {
	      $(hiddenSel).val(val);
	      // Si el botón de operador existe, actualiza su etiqueta
	      if ($(labelSel).length) { $(labelSel).html(labelHtml); }
	    };

	    // ===== 3) Filtros TEXTO del thead (Visuales) =====
	    // Agregamos .trigger('change') para asegurar que visualmente se borren
	    $('#rfcFilterInputN, #razonFilterInputN, #serieFilterInputN, #uuidFilterInputN').val('').trigger('change');
	    
	    // Reseteamos los iconos de lupa
	    setOp('#rfcOperatorN',   '#rfcOpBtnN .op-label',   'contains', '<i class="fas fa-search"></i>');
	    setOp('#razonOperatorN', '#razonOpBtnN .op-label', 'contains', '<i class="fas fa-search"></i>');
	    setOp('#serieOperatorN', '#serieOpBtnN .op-label', 'contains', '<i class="fas fa-search"></i>');
	    setOp('#uuidOperatorN',  '#uuidOpBtnN .op-label',  'contains', '<i class="fas fa-search"></i>');

	    // ===== 4) Helper para numéricos (valor 1/2 + operador + etiqueta) =====
	    function resetNum(opSel, v1Sel, v2Sel, btnSel){
	      $(opSel).val('eq'); // Reset operador a "="
	      $(v1Sel).val('').trigger('change'); // Limpia valor 1
	      // Oculta y limpia el 2do campo por si el operador anterior era "between"
	      $(v2Sel).val('').trigger('change').addClass('d-none');
	      
	      // Resetea la etiqueta del botón a "="
	      if ($(btnSel + ' .op-label').length) {
	        $(btnSel + ' .op-label').text('=');
	      }
	    }
	    
	    // -- Limpieza de Numéricos Existentes --
	    resetNum('#folioOperatorN', '#folioFilter1N', '#folioFilter2N', '#folioOpBtnN');
	    resetNum('#totalOperatorN', '#totalFilter1N', '#totalFilter2N', '#totalOpBtnN');
	    resetNum('#subOperatorN',   '#subFilter1N',   '#subFilter2N',   '#subOpBtnN');
	    resetNum('#descOperatorN',  '#descFilter1N',  '#descFilter2N',  '#descOpBtnN');
	    resetNum('#percOperatorN',  '#percFilter1N',  '#percFilter2N',  '#percOpBtnN');
	    resetNum('#dedOperatorN',   '#dedFilter1N',   '#dedFilter2N',   '#dedOpBtnN');

	    // -- NUEVOS AGREGADOS (Estos faltaban en tu archivo) --
	    resetNum('#exentasOperatorN',  '#exentasFilter1N',  '#exentasFilter2N',  '#exentasOpBtnN');
	    resetNum('#gravadasOperatorN', '#gravadasFilter1N', '#gravadasFilter2N', '#gravadasOpBtnN');
	    resetNum('#otrosOperatorN',    '#otrosFilter1N',    '#otrosFilter2N',    '#otrosOpBtnN');

	    // ===== 5) Fecha con operador =====
	    $('#dateOperatorN').val('eq');
	    $('#dateFilter1N').val('').trigger('change');
	    $('#dateFilter2N').val('').trigger('change').addClass('d-none');
	    
	    // Reset etiqueta botón fecha
	    const $dateLabelN = $('#dateOpBtnN .op-label');
	    const $dateLabel  = $('#dateOpBtn .op-label'); // Soporte legacy
	    if ($dateLabelN.length) $dateLabelN.text('=');
	    if ($dateLabel.length)  $dateLabel.text('=');

	    // Si tu lógica de fechas depende de algún calculador central:
	    if (typeof obtenerFechasFiltroNomina === 'function') {
	      obtenerFechasFiltroNomina(); 
	    }

	    // ===== 6) Cierra cualquier menú de operador abierto =====
	    $('#tablaDetalleNomina thead .dx-like-menu, .dtfh-floatingparent thead .dx-like-menu').removeClass('show');

	    // ===== 7) Recarga tabla sin perder la página =====
	    if (typeof refrescarBovedaNomina === 'function') {
		  validarFechas_Nomina(); // Esto recargará la tabla usando las fechas limpias
	    } else if ($.fn.DataTable.isDataTable('#tablaDetalleNomina')) {
	      $('#tablaDetalleNomina').DataTable().ajax.reload(null, true);
	    }
	  } catch(e){
	    // Log silencioso o alert para debug
	    if (window.console && console.error) {
	      console.error('[BOVEDA_NOMINA] limpiarNomina error:', e);
	    }
	  }
	}

	
	
	function cargaProveedoresNomina() {
		try {
			$.ajax({
	           url: '/siarex247/cumplimientoFiscal/boveda/nomina/catProveedores.action',
	           type: 'POST',
	            dataType : 'json',
			    success: function(data){
			    	$('#rfc_Nomina').empty();
			    	$.each(data.data, function(key, text) {
			    		$('#rfc_Nomina').append($('<option></option>').attr('value', text.rfcReceptor).text(text.razonSocialReceptor));	
			    		
			      	});
			    }
			});
		}
		catch(e) {
			alert('cargaProveedoresNomina()_'+e);
		} 
	}
	
	/* =========================================
	 * Bóveda Nómina – Filtros (como Emitidos)
	 * - Cambiar operador recarga SOLO si hay 1+ carácter.
	 * - ENTER siempre recarga (si hay 1+ carácter).
	 * - Copia thead -> inputs globales antes de recargar.
	 * ========================================= */

	/* ---- Guard + debounce/lock ---- */
	window.__nominaBusy     = window.__nominaBusy     || false;
	window.__nominaDebounce = window.__nominaDebounce || null;

	/* ========= Helpers ========= */
	function __cerrarMenusNomina(){
	  $('#tablaDetalleNomina thead .dx-like-menu, .dtfh-floatingparent thead .dx-like-menu').removeClass('show');
	}
	function __valorPresenteN($filter){
	  // Alguno de los inputs/selects del filtro con 1+ carácter (no espacios)
	  const $inputs = $filter.find('input[type=text],input[type=number],input[type=date],select');
	  let ok = false;
	  $inputs.each(function(){
	    const v = ($(this).val() || '').trim();
	    if (v.length >= 1){ ok = true; return false; }
	  });
	  return ok;
	}
	function __copiarTheadAGlobalesN(){
	  const mapTxt = [
	    ['#rfcFilterInputN',   '#rfc_Nomina'],
	    ['#razonFilterInputN', '#razonSocial_Nomina'],
	    ['#serieFilterInputN', '#serie_Nomina'],
	    ['#uuidFilterInputN',  '#uuid_Nomina']
	  ];
	  mapTxt.forEach(([from, to]) => {
	    if ($(from).length && $(to).length) $(to).val($(from).val());
	  });

	  if ($('#dateFilter1N').length && $('#fechaInicial_Nomina').length) {
	    $('#fechaInicial_Nomina').val($('#dateFilter1N').val());
	  }
	  if ($('#dateFilter2N').length && $('#fechaFinal_Nomina').length) {
	    $('#fechaFinal_Nomina').val($('#dateFilter2N').val());
	  }
	}

	/* ========= Inicializadores de inputs ========= */
	window.initDxLikeFilterN = function ({ inputId, hiddenOpId, targetInput }) {
	  const $input = $(inputId), $op = $(hiddenOpId);
	  if (!$input.length || !$op.length) return;
	  if (!$op.val()) $op.val('contains'); // textos default

	  const ns = '.dxTxtEnterN';
	  $input.off('keydown' + ns).on('keydown' + ns, e => {
	    if (e.key === 'Enter') {
	      e.preventDefault();
	      const val = ($input.val() || '').trim();
	      if (val.length === 0) return; // NO recarga si está vacío/espacios
	      if (targetInput) $(targetInput).val($input.val());
	      __copiarTheadAGlobalesN();
		  //tablaDetalleNomina.page('first').draw('page');
	      if (typeof refrescarBovedaNomina === 'function') validarFechas_Nomina(); //refrescarBovedaNomina();
	    }
	  });
	};

	window.initNumericDxFilterN = function ({ v1Id, v2Id, opHiddenId }) {
	  const $v1 = $(v1Id), $v2 = $(v2Id), $op = $(opHiddenId);
	  if (!$v1.length || !$op.length) return;
	  if (!$op.val()) $op.val('eq');

	  const ns = '.dxNumEnterN';
	  const onEnter = e => {
	    if (e.key === 'Enter'){
	      e.preventDefault();
	      const v1 = ($v1.val() || '').trim();
	      const v2 = ($v2.val() || '').trim();
	      if (v1.length === 0 && v2.length === 0) return;
	      __copiarTheadAGlobalesN();
		  //tablaDetalleNomina.page('first').draw('page');
	      if (typeof refrescarBovedaNomina === 'function') validarFechas_Nomina();
	    }
	  };
	  $v1.off('keydown' + ns).on('keydown' + ns, onEnter);
	  if ($v2.length) $v2.off('keydown' + ns).on('keydown' + ns, onEnter);
	};

	window.initDxLikeDateFilterN = function ({ input1Id, input2Id, hiddenOpId }) {
	  const $d1 = $(input1Id), $d2 = $(input2Id), $op = $(hiddenOpId);
	  if (!$d1.length || !$op.length) return;
	  if (!$op.val()) $op.val('eq');

	  const ns = '.dxDateEnterN';
	  const onEnter = e => {
	    if (e.key === 'Enter'){
	      e.preventDefault();
	      const v1 = ($d1.val() || '').trim();
	      const v2 = ($d2.val() || '').trim();
	      if (v1.length === 0 && v2.length === 0) return;
	      __copiarTheadAGlobalesN();
	      if (typeof refrescarBovedaNomina === 'function') validarFechas_Nomina();
	    }
	  };
	  $d1.off('keydown' + ns).on('keydown' + ns, onEnter);
	  if ($d2.length) $d2.off('keydown' + ns).on('keydown' + ns, onEnter);
	};

	/* ========= Delegados (normal + FixedHeader) ========= */
	(function () {

	  function isNumericMenu(id){ return /(folio|total|sub|desc|perc|ded)OpMenuN$/i.test(id||''); }
	  function isDateMenu(id){   return /dateOpMenuN$/i.test(id||''); }
	  function hiddenForMenu($menu){
	    const id = $menu.attr('id') || '';           // p.ej. rfcOpMenuN, folioOpMenuN, dateOpMenuN
	    return '#'+id.replace('OpMenu','Operator');  // -> #rfcOperatorN, #folioOperatorN, #dateOperatorN
	  }
	  function defaultOp(menuId){ return (isNumericMenu(menuId) || isDateMenu(menuId)) ? 'eq' : 'contains'; }
	  function showSecond($f, show){
	    const $second = $f.find('#folioFilter2N,#totalFilter2N,#subFilter2N,#descFilter2N,#percFilter2N,#dedFilter2N,#dateFilter2N');
	    if (show) $second.removeClass('d-none'); else $second.addClass('d-none').val('');
	  }

	  /* --- abrir/cerrar menú (cierra los demás) --- */
	  $(document)
	    .off('click.dxNMenuToggle')
	    .on('click.dxNMenuToggle',
	      '#tablaDetalleNomina thead .op-btn, .dtfh-floatingparent thead .op-btn',
	      function(e){
	        e.stopPropagation();
	        const $btn  = $(this);
	        const $menu = $btn.siblings('.dx-like-menu');
	        __cerrarMenusNomina();
	        $menu.addClass('show').css({ position:'absolute', zIndex: 1090 });

	        const menuW = $menu.outerWidth();
	        const thW   = $btn.closest('th').outerWidth();
	        if (menuW > thW) $menu.css({ left: 0, right: 'auto' });
	      }
	    );

	  /* --- cerrar al hacer click fuera/scroll/resize/draw --- */
	  $(document).off('click.dxNMenuClose').on('click.dxNMenuClose', function(){ __cerrarMenusNomina(); });
	  $(window).off('scroll.dxNMenuClose resize.dxNMenuClose')
	           .on('scroll.dxNMenuClose resize.dxNMenuClose', function(){ __cerrarMenusNomina(); });
	  $('#tablaDetalleNomina').off('draw.dt.dxNMenuClose')
	                          .on('draw.dt.dxNMenuClose', function(){ __cerrarMenusNomina(); });

	  /* --- selección de operador (recarga SOLO si hay valor) --- */
	  $(document)
	    .off('click.dxNSelectOp')
	    .on('click.dxNSelectOp',
	      '#tablaDetalleNomina thead .dx-like-menu li, .dtfh-floatingparent thead .dx-like-menu li',
	      function(e){
	        e.stopPropagation();

	        const $li     = $(this);
	        const op      = String($li.data('op')||'').toLowerCase();
	        const $menu   = $li.closest('.dx-like-menu');
	        const mid     = $menu.attr('id') || '';
	        const $f      = $menu.closest('.dx-like-filter');
	        const $hidden = $(hiddenForMenu($menu));
	        const $label  = $f.find('.op-label');

	        if (!$hidden.length) return;

	        if (op === 'reset'){
	          const def = defaultOp(mid);
	          $hidden.val(def);
	          $label.html((isNumericMenu(mid) || isDateMenu(mid)) ? '=' : '<i class="fas fa-search"></i>');
	          $f.find('input[type=text],input[type=number],input[type=date]').val('');
	          showSecond($f, false);
	          __cerrarMenusNomina();
	          __copiarTheadAGlobalesN(); // limpiezas también al global
			  validarFechas_Nomina();
	          //if (typeof refrescarBovedaNomina === 'function') {alert('***** entro 3 ***'); refrescarBovedaNomina()};
	          return;
	        }

	        // Cambiar operador normal
	        $hidden.val(op);
	        const firstToken = $.trim($li.text()).split(/\s+/)[0];
	        $label.text(firstToken);
	        const needSecond = isDateMenu(mid) ? (op === 'bt') : (op === 'between' || op === 'bt');
	        showSecond($f, needSecond);

	        __cerrarMenusNomina();

	        // Solo recarga si hay valor presente
	        if (__valorPresenteN($f)) {
	          __copiarTheadAGlobalesN();
			  validarFechas_Nomina();
	          //if (typeof refrescarBovedaNomina === 'function') {alert('***** entro 4 ***');refrescarBovedaNomina()};
	        }
	      }
	    );

	  /* --- ENTER global en inputs/selects del thead --- */
	  $(document)
	    .off('keydown.nominaEnterLikeEmitidos')
	    .on('keydown.nominaEnterLikeEmitidos',
	      '#tablaDetalleNomina thead tr.filters :input, .dtfh-floatingparent thead tr.filters :input',
	      function(e){
			
	      });

	  /* --- Inicializa defaults y handlers por campo --- */
	  /* --- Inicializa defaults y handlers por campo --- */
	  $(function(){
	      // 1. Filtros de TEXTO (Si usas menús desplegables en texto, agrega btnId y menuId aquí también, si no, déjalos así)
	      initDxLikeFilterN({ inputId:'#rfcFilterInputN',   hiddenOpId:'#rfcOperatorN',   targetInput:'#rfc_Nomina' });
	      initDxLikeFilterN({ inputId:'#razonFilterInputN', hiddenOpId:'#razonOperatorN', targetInput:'#razonSocial_Nomina' });
	      initDxLikeFilterN({ inputId:'#uuidFilterInputN',  hiddenOpId:'#uuidOperatorN',  targetInput:'#uuid_Nomina' });
	      initDxLikeFilterN({ inputId:'#serieFilterInputN', hiddenOpId:'#serieOperatorN', targetInput:'#serie_Nomina' }); // Faltaba Serie

	      // 2. Filtros NUMÉRICOS (Estándar) - Agregué los IDs de botones y menús para que funcionen perfecto
	      initNumericDxFilterN({ btnId:'#totalOpBtnN', menuId:'#totalOpMenuN', v1Id:'#totalFilter1N', v2Id:'#totalFilter2N', opHiddenId:'#totalOperatorN' });
	      initNumericDxFilterN({ btnId:'#subOpBtnN',   menuId:'#subOpMenuN',   v1Id:'#subFilter1N',   v2Id:'#subFilter2N',   opHiddenId:'#subOperatorN' });
	      initNumericDxFilterN({ btnId:'#descOpBtnN',  menuId:'#descOpMenuN',  v1Id:'#descFilter1N',  v2Id:'#descFilter2N',  opHiddenId:'#descOperatorN' });
	      initNumericDxFilterN({ btnId:'#percOpBtnN',  menuId:'#percOpMenuN',  v1Id:'#percFilter1N',  v2Id:'#percFilter2N',  opHiddenId:'#percOperatorN' });
	      initNumericDxFilterN({ btnId:'#dedOpBtnN',   menuId:'#dedOpMenuN',   v1Id:'#dedFilter1N',   v2Id:'#dedFilter2N',   opHiddenId:'#dedOperatorN' });

	      // 3. Filtros NUMÉRICOS (NUEVOS - Exentas, Gravadas, Otros)
	      // ESTA ES LA FORMA CORRECTA (con btnId y menuId):
	      initNumericDxFilterN({ 
	          btnId: '#exentasOpBtnN',  menuId: '#exentasOpMenuN', 
	          v1Id: '#exentasFilter1N', v2Id: '#exentasFilter2N', opHiddenId: '#exentasOperatorN' 
	      });
	      initNumericDxFilterN({ 
	          btnId: '#gravadasOpBtnN', menuId: '#gravadasOpMenuN', 
	          v1Id: '#gravadasFilter1N', v2Id: '#gravadasFilter2N', opHiddenId: '#gravadasOperatorN' 
	      });
	      initNumericDxFilterN({ 
	          btnId: '#otrosOpBtnN',    menuId: '#otrosOpMenuN', 
	          v1Id: '#otrosFilter1N',   v2Id: '#otrosFilter2N',   opHiddenId: '#otrosOperatorN' 
	      });

	      // 4. Fecha
	      initDxLikeDateFilterN({ input1Id:'#dateFilter1N', input2Id:'#dateFilter2N', hiddenOpId:'#dateOperatorN' });
	  });
	})(); // IIFE
	


	
	


	
	
	