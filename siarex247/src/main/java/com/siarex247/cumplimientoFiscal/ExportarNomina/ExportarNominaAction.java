package com.siarex247.cumplimientoFiscal.ExportarNomina;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.PrintWriter;
import java.sql.Connection;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;

import org.apache.struts2.ServletActionContext;
import org.apache.struts2.action.Action;
import org.json.JSONObject;

import com.siarex247.bd.ResultadoConexion;
import com.siarex247.catalogos.Proveedores.ProveedoresForm;
import com.siarex247.catalogos.Proveedores.ProveedoresModel;
import com.siarex247.registro.RegistroBean;
import com.siarex247.seguridad.Accesos.AccesoBean;
import com.siarex247.seguridad.Accesos.EmpresasForm;
import com.siarex247.seguridad.Lenguaje.LenguajeBean;
import com.siarex247.seguridad.Usuarios.UsuariosBean;
import com.siarex247.seguridad.Usuarios.UsuariosForm;
import com.siarex247.session.ObtenerSession;
import com.siarex247.session.SiarexSession;
import com.siarex247.utils.Utils;
import com.siarex247.utils.UtilsFechas;
import com.siarex247.utils.UtilsFile;
import com.siarex247.utils.UtilsPATH;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Part;

public class ExportarNominaAction extends ExportarNominaSupport{

	private static final long serialVersionUID = -8787969302367805763L;

	
	public String exportarFacturas(){
    	HttpServletResponse response = ServletActionContext.getResponse();
    	HttpServletRequest request = ServletActionContext.getRequest();
    	SiarexSession session = ObtenerSession.getSession(request);
    	Connection con = null;
		ResultadoConexion rc = null;
		
		// Connection conSiarex = null;
		// ResultadoConexion rcSiarex = null;
		
		ExportarNominaBean exportarXMLBean = new ExportarNominaBean();
		
		LenguajeBean lenguajeBean = LenguajeBean.instance();
		
    	try{
			PrintWriter out = response.getWriter();
			if ("".equals(session.getEsquemaEmpresa())){
				return Action.LOGIN;
			}
			else{
				
				response.setContentType("text/html; charset=UTF-8");
				response.setCharacterEncoding("UTF-8");

				rc = getConnection(session.getEsquemaEmpresa());
				con = rc.getCon();
				
				// rcSiarex = getConnectionSiarex();
				// conSiarex = rcSiarex.getCon();
				
				ExportarNominaModel exportarModel = new ExportarNominaModel();
				
				String modoAgrupar = getModoAgrupar();
				if (modoAgrupar == null || "".equalsIgnoreCase(modoAgrupar)) {
					modoAgrupar = "NONE";
				}
				
				String CORREO_RESPONSABLE = getCorreoResponsable();
				
				String validarSAT = getValidarSAT();
				
				
				String descargarFacturas = Utils.noNulo(getDescargarFacturas());
				
				String rfcEmpleado = Utils.noNulo(getRfcEmpleado());
				String fechaInicial = Utils.noNulo(getFechaInicial());
				String fechaFinal = Utils.noNulo(getFechaFinal());
				String tipoBusqueda = Utils.noNulo(getTipoExportacion());
				
				
				if ("on".equalsIgnoreCase(validarSAT)) {
					validarSAT = "S";
				}else {
					validarSAT = "N";
				}
				
				
				
				
				if ("on".equalsIgnoreCase(descargarFacturas)) {
					descargarFacturas = "S";
				}else {
					descargarFacturas = "N";
				}
				
				logger.info("modoAgrupar-------->"+modoAgrupar);
				logger.info("CORREO_RESPONSABLE-------->"+CORREO_RESPONSABLE);
				logger.info("validarSAT-------->"+validarSAT);
				logger.info("descargarFacturas-------->"+descargarFacturas);
				logger.info("rfcEmpleado-------->"+rfcEmpleado);
				logger.info("fechaInicial-------->"+fechaInicial);
				logger.info("fechaFinal-------->"+fechaFinal);
				logger.info("tipoBusqueda-------->"+tipoBusqueda);
				
				boolean cumpleValidaciones = true;
				File fileXMLDest = null;
				String rutaXMLProcesar = "";
				long codeOperacion = 0;
				
				HashMap<String, String> mapaLenguaje = lenguajeBean.obtenerEtiquetas(session.getLenguaje(), "EXPORTAR_NOMINA");
				
				if ("TEXTO".equalsIgnoreCase(tipoBusqueda)) {
					
					Part filePart = request.getPart("fileTXT");
	            	File fileTXT = UtilsFile.getFileFromPart(filePart);
	            	
					
					if (fileTXT == null) {
						exportarModel.setCodError("001");
						//exportarModel.setMensajeError("Error el procesar la información, debe especifica un archivo TXT continuar.");
						exportarModel.setMensajeError(Utils.noNuloNormal(mapaLenguaje.get("MSG1")));
						cumpleValidaciones = false;
					}else {
						exportarModel.setCodError("000");
						exportarModel.setMensajeError("El registro se ha guardado satisfactoriamente.");
						
						String rutaDest =  UtilsPATH.RUTA_PUBLIC_LAYOUT +fileTXT.getName();
						
						fileXMLDest = new File(rutaDest);
						UtilsFile.moveFileDirectory(fileTXT, fileXMLDest, true, true, true, false);
						
					}
				}else if ("XML".equalsIgnoreCase(tipoBusqueda)) {
					logger.info("Exportando por XML............");
					
					Collection<Part> colectionPart  = request.getParts();
			        ArrayList<File> listFilesXML = com.siarex247.utils.UtilsFile.getFilesFromPart(colectionPart);
			          
					
					if (listFilesXML == null || listFilesXML.size() == 0) {
						exportarModel.setCodError("001");
						// exportarModel.setMensajeError("Error el procesar la información, debe especificar los XML a procesar.");
						exportarModel.setMensajeError(Utils.noNuloNormal(mapaLenguaje.get("MSG2")));
						cumpleValidaciones = false;
					}else {
						exportarModel.setCodError("000");
						exportarModel.setMensajeError("El registro se ha guardado satisfactoriamente.");
						
						codeOperacion = System.currentTimeMillis();
						rutaXMLProcesar = UtilsPATH.RUTA_PUBLIC_HTML + session.getEsquemaEmpresa() + File.separator + "TEMP_FACTURAS" + File.separator + codeOperacion + File.separator;
						String rutaDestinoXML = null;
						int nameXML = 1; 
						for (File fileXML : listFilesXML) {
							
							rutaDestinoXML = rutaXMLProcesar + "XML_"+nameXML+".xml";
							fileXMLDest = new File(rutaDestinoXML); // XML
							UtilsFile.moveFileDirectory(fileXML, fileXMLDest, true, true, true, false);
							nameXML++;
							// String nameExtencion = FilenameUtils.getExtension(rutaDestinoXML);
						}
					}
					
				}else { // es por RFC
					
					if ("".equalsIgnoreCase(rfcEmpleado)) {
						exportarModel.setCodError("001");
						// exportarModel.setMensajeError("Error el procesar la información, debe especifica un RFC para continuar.");
						exportarModel.setMensajeError(Utils.noNuloNormal(mapaLenguaje.get("MSG3")));
						cumpleValidaciones = false;
					}else if ("".equalsIgnoreCase(fechaInicial)) {
						exportarModel.setCodError("001");
						// exportarModel.setMensajeError("Error el procesar la información, debe especifica una Fecha Inicial para continuar.");
						exportarModel.setMensajeError(Utils.noNuloNormal(mapaLenguaje.get("MSG4")));
						cumpleValidaciones = false;
					}else if ("".equalsIgnoreCase(fechaFinal)) {
						exportarModel.setCodError("001");
						// exportarModel.setMensajeError("Error el procesar la información, debe especifica una Fecha Final para continuar.");
						exportarModel.setMensajeError(Utils.noNuloNormal(mapaLenguaje.get("MSG5")));
						cumpleValidaciones = false;
					}else if (!UtilsFechas.compararFechaMayor(fechaFinal, fechaInicial)) {
						exportarModel.setCodError("001");
						// exportarModel.setMensajeError("Error el procesar la información, la fecha inicial no debe ser mayor que la fecha final.");
						exportarModel.setMensajeError(Utils.noNuloNormal(mapaLenguaje.get("MSG6")));
						cumpleValidaciones = false;
					}else {
						exportarModel.setCodError("000");
						exportarModel.setMensajeError("El registro se ha guardado satisfactoriamente.");
						cumpleValidaciones = true;
					}
				}
				
				if (cumpleValidaciones) {
					AccesoBean accesoBean = new AccesoBean();
					EmpresasForm empresasForm = accesoBean.consultaEmpresaEsquema(session.getEsquemaEmpresa());

					UsuariosBean usuariosBean = new UsuariosBean();
			        UsuariosForm usuariosForm = usuariosBean.datosUsuario(con, rc.getEsquema(), getUsuario(request)); 
			        
					exportarXMLBean.procesaArchivo(fileXMLDest, session.getEsquemaEmpresa(), getUsuario(request),
							empresasForm.getEmailDominio(), empresasForm.getPwdCorreo(), usuariosForm.getNombreCompleto(),
		                     CORREO_RESPONSABLE, modoAgrupar, validarSAT, descargarFacturas, 
		                     tipoBusqueda, rfcEmpleado, fechaInicial, fechaFinal, rutaXMLProcesar, codeOperacion );
				}
				
				JSONObject json = new JSONObject(exportarModel);
				out.print(json);
				out.flush();
				out.close();
			}
		}
    	catch(Exception e){
			Utils.imprimeLog("", e);
		}
    	finally{
			try{
				if (con != null){
					con.close();
				}
				con = null;
			}catch(Exception e){
				con = null;
			}
		}
		return SUCCESS;
    }
	
	
	
	public String iniciarDescarga() throws Exception {
		HttpServletRequest request = ServletActionContext.getRequest();
		
		Connection conSiarex = null;
		ResultadoConexion rcSiarex = null;
		
		ExportarNominaBean exportarBean = new ExportarNominaBean();
		
		RegistroBean registroBean = new RegistroBean();
		
		String retorno = "success";
		try{
			
			logger.info("********* DESCARGANDO ARCHIVO ********************");
			rcSiarex = getConnectionSiarex();
			conSiarex = rcSiarex.getCon(); 
			String pathArchivo = exportarBean.consultarDescarga(conSiarex, "", getIdArchivo(), getUsuario(request));
			
			// String pwdUsuario = Utils.dobleEncryptarMD5(Utils.noNuloNormal(getPwdUsuario()));
			boolean isCorrecto = registroBean.validarUsuarioDescarga(conSiarex, "", getUsuario(request));
			
			if ("".equalsIgnoreCase(pathArchivo)) {
				setMensajeError("Codigo de acceso invalido.");
				retorno = "ERROR";
			}else if (!isCorrecto) {
				setMensajeError("Acceso denegado.");
				retorno = "ERROR";
			}else {
				
				String documentoZip = UtilsPATH.RUTA_PUBLIC_PRINCIPAL + pathArchivo;   
				logger.info("********* documentoZip ********************"+documentoZip); 
				// File archivo =  new File(documentoZip);
				 InputStream inputStream = new FileInputStream(new File(documentoZip));
				 setInputStream(inputStream);
				
			}
			
            
		}catch(Exception e){
			Utils.imprimeLog("", e);
		}finally{
			try{
				
				if (conSiarex != null){
					conSiarex.close();
				}
				conSiarex = null;
			}catch(Exception e){
				conSiarex = null;
			}
		}
		return retorno;
	}
	
	
	public String comboEmpleados(){
        Connection con = null;
        ResultadoConexion rc = null;
        HttpServletResponse response = ServletActionContext.getResponse();
    	HttpServletRequest request = ServletActionContext.getRequest();
    	ExportarNominaBean exportarBean = new ExportarNominaBean();
        try{
        	response.setCharacterEncoding("UTF-8");
        	SiarexSession session = ObtenerSession.getSession(request);
        	PrintWriter out = response.getWriter();
            rc = getConnection(session.getEsquemaEmpresa());
            con = rc.getCon();

            ProveedoresModel provModel = new ProveedoresModel();
            ArrayList<ProveedoresForm> listaCombo = exportarBean.comboEmpleados(con, rc.getEsquema(), session.getLenguaje());  
            provModel.setData(listaCombo);
            
			JSONObject json = new JSONObject(provModel);
			out.print(json);
            out.flush();
            out.close();
            
        }
        catch(Exception e){
        	Utils.imprimeLog("comboProveedoresExt(): ", e);
        }finally {
	        try{
	            if(con != null) {
	                con.close();
	            }
	            con = null;
	        }
	        catch(Exception e){
	            con = null;
	        }
		}
        return null;
    }
	
	
}
