<%@page import="com.siarex247.seguridad.Usuarios.UsuariosForm"%>
<%@page import="com.siarex247.seguridad.Usuarios.UsuariosAction"%>
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
    
	    
	<%
	
		UsuariosAction usuariosAction = new  UsuariosAction();
		UsuariosForm userForm = usuariosAction.consultaPermisosJSP(request);
		
	%>
    
</head>

<div class="card mb-3" style="box-shadow: none; margin-bottom: 0rem !important;">

	<div class="card-header">
		<div class="row flex-between-end">
			<div class="col-auto align-self-center">
				<h5 class="mb-0" data-anchor="data-anchor" >Exportar XML</h5>
			</div>
			<div class="col-auto d-flex">
			</div>
		</div>
	</div>
	
	
	<div class="card-body bg-light pt-0" style="padding-top: 10px !important;">
		
		<div class="tab-content" style="">
					
			<div class="card overflow-hidden">
			
				<div class="card-header p-0 scrollbar-overlay border-bottom">
					<ul class="nav nav-tabs border-0 flex-column flex-sm-row" id="tabAlarmas" role="tablist">
					   <%if ("ADM".equalsIgnoreCase(userForm.getNombreCortoPerfil()) || "010".equalsIgnoreCase(userForm.getNombreCortoPerfil())) { %>
						<li class="nav-item text-nowrap" role="presentation">
							<a class="nav-link mb-0 d-flex align-items-center gap-1 py-3 px-x1 active" id="tabExportarRecibidos" data-bs-toggle="tab" href="#exportarRecibidos" role="tab" aria-controls="exportarRecibidos" aria-selected="true">
								<span class="fas fa-file-invoice text-600"></span>
								<h6 class="mb-0 text-600 fontTituloTab" style="padding-left: 10px;" >Recibidos / Emitidos</h6>
							</a>
						</li>
						<li class="nav-item text-nowrap" role="presentation">
							<a class="nav-link mb-0 d-flex align-items-center gap-1 py-3 px-x1" id="tabExportarNomina" data-bs-toggle="tab" href="#exportarNomina" role="tab" aria-controls="exportarNomina" aria-selected="false">
								<span class="fas fa-money-check-alt icon text-600"></span>
								<h6 class="mb-0 text-600 fontTituloTab" style="padding-left: 10px;" >Nomina</h6>
                      		</a>
                      	</li>
                      <%}else if ("002".equalsIgnoreCase(userForm.getNombreCortoPerfil()) || "008".equalsIgnoreCase(userForm.getNombreCortoPerfil())){ %>
						<li class="nav-item text-nowrap" role="presentation">
							<a class="nav-link mb-0 d-flex align-items-center gap-1 py-3 px-x1 active" id="tabExportarRecibidos" data-bs-toggle="tab" href="#exportarRecibidos" role="tab" aria-controls="exportarRecibidos" aria-selected="true">
								<span class="fas fa-file-invoice text-600"></span>
								<h6 class="mb-0 text-600 fontTituloTab" style="padding-left: 10px;" >Recibidos / Emitidos</h6>
							</a>
						</li>
                      	
                      <%}else if ("007".equalsIgnoreCase(userForm.getNombreCortoPerfil()) || "009".equalsIgnoreCase(userForm.getNombreCortoPerfil())){ %>
                      		<li class="nav-item text-nowrap" role="presentation">
								<a class="nav-link mb-0 d-flex align-items-center gap-1 py-3 px-x1 active" id="tabExportarNomina" data-bs-toggle="tab" href="#exportarNomina" role="tab" aria-controls="exportarNomina" aria-selected="true">
									<span class="fas fa-money-check-alt icon text-600"></span>
									<h6 class="mb-0 text-600 fontTituloTab" style="padding-left: 10px;" >Nomina</h6>
	                      		</a>
                      		</li>
                      	
                      <%} %>
             	 
					</ul>
				</div>
                
                <div class="tab-content">
                	<%if ("ADM".equalsIgnoreCase(userForm.getNombreCortoPerfil()) || "010".equalsIgnoreCase(userForm.getNombreCortoPerfil())) { %>
		                	<div class="card-body bg-light tab-pane active" id="exportarRecibidos" role="tabpanel" aria-labelledby="tabExportarRecibidos">
		                		<h6 class="mb-0 text-700">Recibidos / Emitidos</h6>
		                	</div>
	                	
		                	<div class="card-body bg-light tab-pane" id="exportarNomina" role="tabpanel" aria-labelledby="tabExportarNomina">
		                		<h6 class="mb-0 text-700"> Nomina </h6>
		                	</div>
                	
                	<%}else if ("002".equalsIgnoreCase(userForm.getNombreCortoPerfil()) || "008".equalsIgnoreCase(userForm.getNombreCortoPerfil())){ %>
		                	<div class="card-body bg-light tab-pane active" id="exportarRecibidos" role="tabpanel" aria-labelledby="tabExportarRecibidos">
		                		<h6 class="mb-0 text-700">Recibidos / Emitidos</h6>
		                	</div>
	                	
                	<%}else if ("007".equalsIgnoreCase(userForm.getNombreCortoPerfil()) || "009".equalsIgnoreCase(userForm.getNombreCortoPerfil())){ %>
	                	<div class="card-body bg-light tab-pane active" id="exportarNomina" role="tabpanel" aria-labelledby="tabExportarNomina">
	                		<h6 class="mb-0 text-700"> Nomina </h6>
	                	</div>
                	 <%} %>
                </div>
			</div>
		</div> <!-- tab-content -->
	</div> <!-- card-body -->
</div><!-- card mb-3 -->

<script type="text/javascript">

//alarmaUsuario.html

	$(document).ready(function() {
		<%if ( (!"007".equalsIgnoreCase(userForm.getNombreCortoPerfil()) && !"009".equalsIgnoreCase(userForm.getNombreCortoPerfil()) ) || "ADM".equalsIgnoreCase(userForm.getNombreCortoPerfil())) { %>
			$("#exportarRecibidos").load('/siarex247/jsp/estatusXML/exportarXML/recibidos/exportarRecibidos.jsp');
		<%}else {%>
			$("#exportarNomina").load('/siarex247/jsp/estatusXML/exportarXML/nomina/exportarNomina.jsp');
		<%}%>
		
		$(".nav-tabs a").click(function(){
		    $(this).tab('show');
		});
				
		$('.nav-tabs a').on('shown.bs.tab', function(event){
			var target = event.target || event.srcElement;
			var id = target.id
			if (id == "tabExportarRecibidos") {
				<%if ( (!"007".equalsIgnoreCase(userForm.getNombreCortoPerfil()) && !"009".equalsIgnoreCase(userForm.getNombreCortoPerfil()) ) || "ADM".equalsIgnoreCase(userForm.getNombreCortoPerfil())) { %>
				$("#exportarRecibidos").load('/siarex247/jsp/estatusXML/exportarXML/recibidos/exportarRecibidos.jsp');
				<%}%>
			} else if (id == "tabExportarNomina"){
				<%if ("007".equalsIgnoreCase(userForm.getNombreCortoPerfil()) || "009".equalsIgnoreCase(userForm.getNombreCortoPerfil()) || "010".equalsIgnoreCase(userForm.getNombreCortoPerfil()) || "ADM".equalsIgnoreCase(userForm.getNombreCortoPerfil())){ %>  
					$("#exportarNomina").load('/siarex247/jsp/estatusXML/exportarXML/nomina/exportarNomina.jsp');
				<%}%>
			} 
		});
		
				
	});
	
	

	 
</script>

</html>