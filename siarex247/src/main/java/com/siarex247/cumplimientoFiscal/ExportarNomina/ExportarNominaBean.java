package com.siarex247.cumplimientoFiscal.ExportarNomina;

import java.io.File;
import java.io.FileOutputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;

import org.apache.log4j.Logger;
import org.apache.poi.hssf.usermodel.HSSFFont;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.streaming.SXSSFSheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.json.simple.JSONObject;

import com.itextpdf.xmltopdf.Comprobante;
import com.itextpdf.xmltopdf.CreaPDF;
import com.itextpdf.xmltopdf.LeerXML;
import com.siarex247.bd.ConexionDB;
import com.siarex247.bd.ResultadoConexion;
import com.siarex247.catalogos.Proveedores.ProveedoresForm;
import com.siarex247.configSistema.ConfigAdicionales.ConfigAdicionalesBean;
import com.siarex247.cumplimientoFiscal.Boveda.BovedaBean;
import com.siarex247.cumplimientoFiscal.BovedaEmitidos.BovedaEmitidosBean;
import com.siarex247.cumplimientoFiscal.ExportarXML.ExportarPorXML;
import com.siarex247.cumplimientoFiscal.ExportarXML.ValidacionXMLForm;
import com.siarex247.seguridad.Accesos.AccesoBean;
import com.siarex247.seguridad.Accesos.EmpresasForm;
import com.siarex247.utils.EnviaCorreoGrid;
import com.siarex247.utils.Utils;
import com.siarex247.utils.UtilsColor;
import com.siarex247.utils.UtilsFechas;
import com.siarex247.utils.UtilsFile;
import com.siarex247.utils.UtilsHTML;
import com.siarex247.utils.UtilsPATH;
import com.siarex247.utils.ZipFiles;
import com.siarex247.validaciones.UtilsSAT;

import ws_api.descarga.DescargaMasiva;

public class ExportarNominaBean {

	
	public static final Logger logger = Logger.getLogger("siarex247");
	private final String ENCONTRADO = "ENCONTRADO";
	private final String NO_ENCONTRADO = "NO ENCONTRADO";
	private final String VACIO = "";
	private HashMap<String, String> MAPA_VALIDACION_SAL = new HashMap<>();
	private String usuarioHTTP = "proceso.exportar@siarex.com";
	
	public ArrayList<ArrayList<String>> obtenerUUID(File fileTXT, String esquema){
		PreparedStatement stmt = null;
		ResultSet rs = null;
		ArrayList<String> listaXML = null;
		ArrayList<ArrayList<String>> resultado = new ArrayList<ArrayList<String>>();
		ConexionDB connPool = null;
		ResultadoConexion rc = null;
		Connection con = null;
		String directorioXML = null;
		String directorioPDF = null;
		String directorioXML_Complemento = null;
		String directorioPDF_Complemento = null;
		
		String directorioXML_NotaCredito = null;
		String directorioPDF_NotaCredito = null;
		
		
		String rutaArchivoXML = null;
		String rutaArchivoPDF = null;
		
		try{

			connPool = new ConexionDB();
			rc = connPool.getConnection(esquema);
			con = rc.getCon();
			ArrayList<String> infoUUID = UtilsFile.leeArchivoTXT(fileTXT.getAbsolutePath());
			//ArrayList<String> infoUUID = UtilsFile.leeArchivoTXT("C:\\Users\\TIJUANA\\Desktop\\ORDENES DE PRUEBA\\UUID.txt");
			stmt = con.prepareStatement(ExportarNominaQuerys.getConsultarUUID(esquema));
			//String rowTXT [] = null;
			
			String uuidXML = "";
			
			for (int x = 0; x < infoUUID.size(); x++ ){
				listaXML = new ArrayList<String>();
				//rowTXT = infoUUID.get(x).toUpperCase().split(";");
				stmt.setString(1, infoUUID.get(x).trim());
				
				rs = stmt.executeQuery();
				
				if (rs.next()){
					uuidXML = Utils.noNuloNormal(rs.getString(1));
					listaXML.add(uuidXML);
					listaXML.add(VACIO);
					listaXML.add(ENCONTRADO);
					listaXML.add(VACIO);
					listaXML.add(Utils.noNulo(rs.getString(2)));
					listaXML.add(rs.getString(3));
					listaXML.add(rs.getString(4));
					listaXML.add(uuidXML + " _ "+ ENCONTRADO);	
					listaXML.add(Utils.noNulo(rs.getString(5)));
					listaXML.add(VACIO);
					listaXML.add(VACIO);
					listaXML.add(uuidXML); // UUID Solo
					listaXML.add(rs.getString(8)); // TIPO DE MONEDA
					listaXML.add(Utils.noNulo(rs.getString(9))); // FECHA DE PAGO
					listaXML.add(Utils.noNulo(rs.getString(10))); // FECHA DE INICIAL DE PAGO
					listaXML.add(Utils.noNulo(rs.getString(11))); // FECHA DE FINAL DE PAGO
					listaXML.add(VACIO); 
					resultado.add(listaXML);
					listaXML = new ArrayList<>();
				}else {
					uuidXML = infoUUID.get(x).trim();
					listaXML.add(uuidXML);
					listaXML.add(VACIO);
					listaXML.add(NO_ENCONTRADO);
					listaXML.add(VACIO);
					listaXML.add(VACIO);
					listaXML.add(VACIO);
					listaXML.add(VACIO);
					listaXML.add(uuidXML + " _ "+ NO_ENCONTRADO);	
					listaXML.add(VACIO);
					listaXML.add(VACIO);
					listaXML.add(VACIO);
					listaXML.add(uuidXML); // UUID Solo
					listaXML.add(VACIO); // TIPO DE MONEDA
					listaXML.add(VACIO); // FECHA DE PAGO
					listaXML.add(VACIO); // FECHA DE INICIAL DE PAGO
					listaXML.add(VACIO); // FECHA DE FINAL DE PAGO
					listaXML.add(VACIO);  
					resultado.add(listaXML);
					listaXML = new ArrayList<>();
				}
				
				 if(rs != null){
		            rs.close();
		            rs = null;
				 }
			}

		}catch(Exception e){
			Utils.imprimeLog("", e);
		}finally{
	        try{
	            if(rs != null)
	                rs.close();
	            rs = null;
	            if(stmt != null)
	                stmt.close();
	            stmt = null;
	            if(con != null)
	                con.close();
	            con = null;
	        }catch(Exception e){
	            rs = null;
	            stmt = null;
	            con = null;
	        }
        }
		return resultado;
	}
	
	
	/*
	public ArrayList<ArrayList<String>> obtenerUUIDPorRFC(String esquema, String rfc, String fechaInicial){
		PreparedStatement stmt = null;
		ResultSet rs = null;
		ArrayList<String> listaXML = new ArrayList<>();
		ArrayList<ArrayList<String>> resultado = new ArrayList<ArrayList<String>>();
		ConexionDB connPool = null;
		ResultadoConexion rc = null;
		Connection con = null;
		// DecimalFormat decimalFormat = new DecimalFormat("###,###.##");
		try{

			connPool = new ConexionDB();
			rc = connPool.getConnection(esquema);
			con = rc.getCon();
			stmt = con.prepareStatement(ExportarXMLQuerys.getConsultarBoveda(esquema));
			stmt.setString(1, rfc);
			stmt.setString(2, fechaInicial + " 01:01:01");
			
			logger.info("stmt===>"+stmt);
			rs = stmt.executeQuery();
			
			
			while (rs.next()){
				listaXML.add(Utils.noNuloNormal(rs.getString(1)));
				listaXML.add("");
				listaXML.add(NO_ENCONTRADO);
				resultado.add(listaXML);
				listaXML = new ArrayList<>();
			}
				
			
			

		}catch(Exception e){
			Utils.imprimeLog("", e);
		}finally{
	        try{
	            if(rs != null)
	                rs.close();
	            rs = null;
	            if(stmt != null)
	                stmt.close();
	            stmt = null;
	            if(con != null)
	                con.close();
	            con = null;
	        }catch(Exception e){
	            rs = null;
	            stmt = null;
	            con = null;
	        }
        }
		return resultado;
	}
	*/
	
	
	

	public ArrayList<ArrayList<String>> obtenerUUIDPorRFC(String esquema, String rfc, String fechaInicial, String fechaFinal){
		PreparedStatement stmt = null;
		ResultSet rs = null;
		ArrayList<String> listaXML = new ArrayList<>();
		ArrayList<ArrayList<String>> resultado = new ArrayList<ArrayList<String>>();
		ConexionDB connPool = null;
		ResultadoConexion rc = null;
		Connection con = null;
		// DecimalFormat decimalFormat = new DecimalFormat("###,###.##");
		try{

			connPool = new ConexionDB();
			rc = connPool.getConnection(esquema);
			con = rc.getCon();
			stmt = con.prepareStatement(ExportarNominaQuerys.getConsultarBovedaNomina(esquema));
			stmt.setString(1, rfc);
			stmt.setString(2, fechaInicial + " 01:01:01");
			stmt.setString(3, fechaFinal + " 23:59:59");
			logger.info("stmt===>"+stmt);
			rs = stmt.executeQuery();
			
			String uuidXML = null;
			
			 while (rs.next()){
				uuidXML = Utils.noNuloNormal(rs.getString(1));
				
				listaXML.add(uuidXML);
				listaXML.add(VACIO);
				listaXML.add(ENCONTRADO);
				listaXML.add(VACIO);
				listaXML.add(Utils.noNulo(rs.getString(2)));
				listaXML.add(rs.getString(3));
				listaXML.add(rs.getString(4));
				listaXML.add(uuidXML + " _ "+ ENCONTRADO);	
				listaXML.add(Utils.noNulo(rs.getString(5)));
				listaXML.add(VACIO);
				listaXML.add(VACIO);
				listaXML.add(uuidXML); // UUID Solo
				listaXML.add(rs.getString(8)); // TIPO DE MONEDA
				listaXML.add(Utils.noNulo(rs.getString(9))); // FECHA DE PAGO
				listaXML.add(Utils.noNulo(rs.getString(10))); // FECHA DE INICIAL DE PAGO
				listaXML.add(Utils.noNulo(rs.getString(11))); // FECHA DE FINAL DE PAGO
				listaXML.add(VACIO); // UUID_COMPLEMENTO COMPLEMENTO
				
				resultado.add(listaXML);
				
				listaXML = new ArrayList<>();
					
			}
				
		}catch(Exception e){
			Utils.imprimeLog("", e);
		}finally{
	        try{
	            if(rs != null)
	                rs.close();
	            rs = null;
	            if(stmt != null)
	                stmt.close();
	            stmt = null;
	            if(con != null)
	                con.close();
	            con = null;
	        }catch(Exception e){
	            rs = null;
	            stmt = null;
	            con = null;
	        }
        }
		return resultado;
	}
	 
	
	
	public int grabarDescarga(String esquema, String usuario, String rutaArchivo)
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        int resultado = 0;
        ConexionDB connPool = null;
		ResultadoConexion rc = null;
		Connection con = null;
		
        try
        {
        	connPool = new ConexionDB();
			rc = connPool.getConnectionSiarex();
			con = rc.getCon();
			
            stmt = con.prepareStatement(ExportarNominaQuerys.getGrabarDescarga(esquema), PreparedStatement.RETURN_GENERATED_KEYS);
            stmt.setString(1, rutaArchivo);
            stmt.setString(2, usuario);
            int cant = stmt.executeUpdate();
            if(cant > 0){
                rs = stmt.getGeneratedKeys();
                if(rs.next())
                    resultado = rs.getInt(1);
            }
        }
        catch(Exception e){
            Utils.imprimeLog("", e);
        }finally{
	        try{
	            if(rs != null)
	                rs.close();
	            rs = null;
	            if(stmt != null)
	                stmt.close();
	            stmt = null;
	            if(con != null)
	                con.close();
	            con = null;
	        }catch(Exception e){
	        	rs = null;
	            stmt = null;
	            con = null;
	        }
        }
        return resultado;
    }

	
	public String consultaRFC (String esquema){
		PreparedStatement stmt = null;
		ResultSet rs = null;
		String rfcReceptor = "";
		Connection con = null;
		ResultadoConexion rc = null;
		ConexionDB connPool = null;
		try{
			
			connPool = new ConexionDB();
			rc = connPool.getConnectionSiarex();
			con = rc.getCon();
			
			stmt = con.prepareStatement(ExportarNominaQuerys.getConsultarRFC("siarex"));
			stmt.setString(1, esquema);
			rs = stmt.executeQuery();
			if (rs.next()){
				rfcReceptor = Utils.noNuloNormal(rs.getString(1));
			}
		}catch(Exception e){
			Utils.imprimeLog("", e);
		}finally{
	        try{
	            if(rs != null)
	                rs.close();
	            rs = null;
	            if(stmt != null)
	                stmt.close();
	            stmt = null;
	            if(con != null)
	                con.close();
	            con = null;
	        }catch(Exception e){
	            rs = null;
	            stmt = null;
	            con = null;
	        }
        }
		return rfcReceptor;
	}
	
	
	public String getDescarga (Connection con, String esquema, int idArchivo, String usuarioHttp){
		PreparedStatement stmt = null;
		ResultSet rs = null;
		String fechaGeneracion = "";
		try{
			stmt = con.prepareStatement(ExportarNominaQuerys.getConsultarDescarga(esquema));
			
			stmt.setInt(1, idArchivo);
			stmt.setString(2, usuarioHttp);
			rs = stmt.executeQuery();
			if (rs.next()){
				fechaGeneracion = Utils.noNuloNormal(rs.getString(2));
			}
		}catch(Exception e){
			Utils.imprimeLog("", e);
		}finally{
	        try{
	            if(rs != null)
	                rs.close();
	            rs = null;
	            if(stmt != null)
	                stmt.close();
	            stmt = null;
	            
	        }catch(Exception e){
	            rs = null;
	            stmt = null;
	        }
        }
		return fechaGeneracion;
	}
	
	
	
	public String consultarDescarga (Connection con, String esquema, int idArchivo, String usuarioHttp){
		PreparedStatement stmt = null;
		ResultSet rs = null;
		String pathArchivo = "";
		try{
			stmt = con.prepareStatement(ExportarNominaQuerys.getConsultarDescarga(esquema));
			
			stmt.setInt(1, idArchivo);
			stmt.setString(2, usuarioHttp);
			rs = stmt.executeQuery();
			if (rs.next()){
				pathArchivo = Utils.noNuloNormal(rs.getString(1));
			}
		}catch(Exception e){
			Utils.imprimeLog("", e);
		}finally{
	        try{
	            if(rs != null)
	                rs.close();
	            rs = null;
	            if(stmt != null)
	                stmt.close();
	            stmt = null;
	             
	        }catch(Exception e){
	            rs = null;
	            stmt = null;
	             
	        }
        }
		return pathArchivo;
	}
	
	
	
	public boolean deleteWithChildren(String path) {  
	    File file = new File(path);  
	    if (!file.exists()) {  
	        return true;  
	    }  
	    if (!file.isDirectory()) {  
	        return file.delete();  
	    }  
	    return this.deleteChildren(file) && file.delete();  
	}  
	  
	private boolean deleteChildren(File dir) {  
	    File[] children = dir.listFiles();  
	    boolean childrenDeleted = true;  
	    for (int i = 0; children != null && i < children.length; i++) {  
	        File child = children[i];  
	        if (child.isDirectory()) {  
	            childrenDeleted = this.deleteChildren(child) && childrenDeleted;  
	        }  
	        if (child.exists()) {  
	            childrenDeleted = child.delete() && childrenDeleted;  
	        }  
	    }  
	    return childrenDeleted;  
	}  
	
	
	
	public void generaZIP(ArrayList<ArrayList<String>> listaUUID, String repositorioEmpresa, 
			String usuario, String emailEmpresa, String pwdCorreo, String emailUsuario, String modoAgrupar, 
			String validarSAT, String descargarFacturas, 
			String nombreEmpleado, String tipoBusqueda, long codeOperacion){
		ArrayList<String> rowXML = null;
		//List<String> zipXML = new ArrayList<String>();
		ArrayList<String> zipXML  = new ArrayList<String>();
		ArrayList<ArrayList<String>> zipDatos = new ArrayList<ArrayList<String>>();
		ArrayList<String> xmlNoEncontrados = new ArrayList<String>();
		ConexionDB connPool = new ConexionDB();
		ResultadoConexion rc = null;
		Connection con = null;
		try{
			
			rc = connPool.getConnection(repositorioEmpresa);
			con = rc.getCon();
			
			String repBoveda = UtilsPATH.RUTA_PUBLIC_PRINCIPAL + "/REPOSITORIOS/"+repositorioEmpresa+"/BOVEDA_NOMINA/";
			//rutaBoveda = UtilsPATH.RUTA_PUBLIC_PRINCIPAL + repBoveda;
			String pathXML = "";
			
			for (int x = 0; x < listaUUID.size(); x++){
				rowXML = listaUUID.get(x);
				if (ENCONTRADO.equalsIgnoreCase(rowXML.get(2))){
					pathXML = repBoveda + rowXML.get(0) + ".xml";
					zipXML.add(pathXML); // XML
					zipXML.add(rowXML.get(4)); // Razon Social
					zipXML.add(rowXML.get(6)); // Total
					zipXML.add(rowXML.get(12)); // Tipo de Moneda
					zipXML.add(rowXML.get(0)); // uuid
					zipXML.add(rowXML.get(13)); // FECHA DE PAGO
					zipXML.add(rowXML.get(14)); // FECHA INICIAL DE PAGO
					zipXML.add(rowXML.get(15)); // FECHA FINAL DE PAGO
					
					zipXML.add(ENCONTRADO); // Encontrado
					
					zipDatos.add(zipXML);
					zipXML =  new ArrayList<String>();
				}else{
					xmlNoEncontrados.add(rowXML.get(0));
				}
			}
			
			
			Date fecha = new Date();
			SimpleDateFormat formatDate = new SimpleDateFormat("yyyyMMddHHmm");
			String fechaActual = formatDate.format(fecha);
			
			String rutaArchivos = "/REPOSITORIOS/"+repositorioEmpresa+"/EXPORTAR/" + fechaActual + "/" + usuario +"_"+fechaActual;
			String rutaExportar = UtilsPATH.RUTA_PUBLIC_PRINCIPAL + rutaArchivos + File.separator + "test.txt";
			File fileDir = new File(rutaExportar);
			File parent = new File(fileDir.getParent());
			if (!parent.exists()) {
				parent.mkdirs();

			}
			
			String logo = "logoToyota.png";
			String bandLogo = "S";
			bandLogo = ConfigAdicionalesBean.obtenerValorVariable(con, rc.getEsquema(), "BANDERA_LOGO_TOYOTA");
			if(bandLogo.equalsIgnoreCase("S")) {
				logo = "logoNomina.png";
			} else {
				logo = "logoVacio.png";
			}
			
			try {
				if (con != null) {
					con.close();	
				}
				con = null;
			}catch(Exception e) {
				Utils.imprimeLog("", e);
			}
			
			
			//logger.info("zipDatos----------->"+zipDatos.size());
			logger.info("modoAgrupar----------->"+modoAgrupar);
			
			if (zipDatos.size() > 0) { // si encontro algun XML
				// Seccion para generar los archivos agrupados...			
				
					String rutaDestinoXML = null;
					String rutaDestinoPDF = null;
					ArrayList<String> getDatos = null;
					for (int x = 0; x < zipDatos.size(); x++) {
						getDatos = zipDatos.get(x);
						
						if ("NONE".equalsIgnoreCase(modoAgrupar)) { //  Sin agrupacion de XML
							
							if ("S".equalsIgnoreCase(descargarFacturas)) {
								File fileXML = new File(getDatos.get(0)); // XML
								rutaDestinoXML = UtilsPATH.RUTA_PUBLIC_PRINCIPAL + rutaArchivos + "/" + fileXML.getName();
								File fileXMLDest = new File(rutaDestinoXML); // XML
								UtilsFile.moveFileDirectory(fileXML, fileXMLDest, true, true, true, false);
								fileXML = null;
								fileXMLDest = null;
							}
							
							
							if ("S".equalsIgnoreCase(descargarFacturas)) {
									
									String pathPDF = UtilsPATH.RUTA_PUBLIC_PRINCIPAL + rutaArchivos + "/" + getDatos.get(4) + ".pdf";	
									try {
										String rutaLogo = UtilsPATH.RUTA_PUBLIC_PRINCIPAL + repBoveda + logo;
										new CreaPDF().GenerarByXML(getDatos.get(0).toString(), pathPDF, rutaLogo);
									}catch(Exception e) {
										Utils.imprimeLog("", e);
									}
								
							}
							
							
						}else if ("1".equalsIgnoreCase(modoAgrupar)) { //  Fecha de Pago
							if ("S".equalsIgnoreCase(descargarFacturas)) {
								File fileXML = new File(getDatos.get(0)); // XML
								rutaDestinoXML = UtilsPATH.RUTA_PUBLIC_PRINCIPAL + rutaArchivos + "/" + getDatos.get(5) + "/" +  fileXML.getName();
								File fileXMLDest = new File(rutaDestinoXML); // XML
								UtilsFile.moveFileDirectory(fileXML, fileXMLDest, true, true, true, false);
								fileXML = null;
								fileXMLDest = null;	
							}
							
							
							if ( "S".equalsIgnoreCase(descargarFacturas)) {
								
								String pathPDF = UtilsPATH.RUTA_PUBLIC_PRINCIPAL + rutaArchivos + "/" + getDatos.get(5) + "/" + getDatos.get(4) + ".pdf";	
								try {
									String rutaLogo = UtilsPATH.RUTA_PUBLIC_PRINCIPAL + repBoveda + logo;
									new CreaPDF().GenerarByXML(getDatos.get(0).toString(), pathPDF, rutaLogo);
								}catch(Exception e) {
									Utils.imprimeLog("", e);
								}
							
							}
							
						}else if ("2".equalsIgnoreCase(modoAgrupar)) { //  Fecha de Inicial de Pago
							if ("S".equalsIgnoreCase(descargarFacturas)) {
								File fileXML = new File(getDatos.get(0)); // XML
								rutaDestinoXML = UtilsPATH.RUTA_PUBLIC_PRINCIPAL + rutaArchivos + "/" + getDatos.get(6) + "/" +  fileXML.getName();
								File fileXMLDest = new File(rutaDestinoXML); // XML
								UtilsFile.moveFileDirectory(fileXML, fileXMLDest, true, true, true, false);
								fileXML = null;
								fileXMLDest = null;	
							}
							
							
							if ( "S".equalsIgnoreCase(descargarFacturas)) {
								
								String pathPDF = UtilsPATH.RUTA_PUBLIC_PRINCIPAL + rutaArchivos + "/" + getDatos.get(6) + "/" + getDatos.get(4) + ".pdf";	
								try {
									String rutaLogo = UtilsPATH.RUTA_PUBLIC_PRINCIPAL + repBoveda + logo;
									new CreaPDF().GenerarByXML(getDatos.get(0).toString(), pathPDF, rutaLogo);
								}catch(Exception e) {
									Utils.imprimeLog("", e);
								}
							
							}
						}else if ("3".equalsIgnoreCase(modoAgrupar)) { //  Fecha de Final de Pago
							if ("S".equalsIgnoreCase(descargarFacturas)) {
								File fileXML = new File(getDatos.get(0)); // XML
								rutaDestinoXML = UtilsPATH.RUTA_PUBLIC_PRINCIPAL + rutaArchivos + "/" + getDatos.get(7) + "/" +  fileXML.getName();
								File fileXMLDest = new File(rutaDestinoXML); // XML
								UtilsFile.moveFileDirectory(fileXML, fileXMLDest, true, true, true, false);
								fileXML = null;
								fileXMLDest = null;	
							}
							
							
							if ( "S".equalsIgnoreCase(descargarFacturas)) {
								
								String pathPDF = UtilsPATH.RUTA_PUBLIC_PRINCIPAL + rutaArchivos + "/" + getDatos.get(7) + "/" + getDatos.get(4) + ".pdf";	
								try {
									String rutaLogo = UtilsPATH.RUTA_PUBLIC_PRINCIPAL + repBoveda + logo;
									new CreaPDF().GenerarByXML(getDatos.get(0).toString(), pathPDF, rutaLogo);
								}catch(Exception e) {
									Utils.imprimeLog("", e);
								}
							
							}
						}
					}
	// Termina...
				// Se genera el excel con la informacion				
				// logger.info("UtilsPATH.RUTA_PUBLIC_PRINCIPAL----->"+UtilsPATH.RUTA_PUBLIC_PRINCIPAL);
				// logger.info("usuario----->"+usuario);
				// logger.info("fechaActual----->"+fechaActual);
				
				String rfcEmpresa = consultaRFC(repositorioEmpresa);
				try {
					rc = connPool.getConnection(repositorioEmpresa);
					con = rc.getCon();
				}catch(Exception e) {
					Utils.imprimeLog("", e);
				}

				
				// String rfcReceptor = "PLA720201746"; 
				String rutaDestinoXLS =  generaExcel(con, rc.getEsquema(), listaUUID, UtilsPATH.RUTA_PUBLIC_PRINCIPAL, repositorioEmpresa, usuario, fechaActual, rfcEmpresa, validarSAT);
				if (!"".equals(rutaDestinoXLS )){
					zipXML.add(rutaDestinoXLS); // XLS
				}
				
				String rutaDestinoXLS_Bitacora =  generaExcelBitacora(con, rc.getEsquema(), UtilsPATH.RUTA_PUBLIC_PRINCIPAL, repositorioEmpresa, fechaActual, rfcEmpresa, codeOperacion);
				if (!"".equals(rutaDestinoXLS_Bitacora )){
					zipXML.add(rutaDestinoXLS_Bitacora); // XLS
				}
				
				
				
	            
	// Se Termina			
				boolean bandZIP = false;
				String rutaRep = null;
				
				String rutaZippear = "/REPOSITORIOS/"+repositorioEmpresa+"/EXPORTAR/"+fechaActual;
				// String rutaZipDest = "/REPOSITORIOS/"+esquema+"/EXPORTAR";
				rutaRep = "/REPOSITORIOS/"+repositorioEmpresa+"/EXPORTAR/"+usuario+"_"+fechaActual+".zip";
				
				ZipFiles zipFiles = new ZipFiles();
				String rutaZIP = UtilsPATH.RUTA_PUBLIC_PRINCIPAL + rutaZippear;
				String zipDirName = UtilsPATH.RUTA_PUBLIC_PRINCIPAL + rutaRep;
				
				logger.info("rutaZIP--------->"+rutaZIP);
				File dir = new File(rutaZIP); // origen
		        // String zipDirName = rutaZIPDest + "/" + usuario + "_" + fechaActual + ".zip";   // destino
		        zipFiles.zipDirectory(dir, zipDirName); // se genera el archivo .zip
		        bandZIP = true;
		        
		        String pathDelete = UtilsPATH.RUTA_PUBLIC_PRINCIPAL + rutaZippear;
		        deleteWithChildren(pathDelete); // se elimina el directorio con los archivos...
		        	
				//CorreoBean.passwordEmisorMensaje = pwdCorreo;
		        //CorreoBean.usuarioEmisorMensaje  = emailEmpresa;
		        
		        int idArchivo = 0;
		        if (bandZIP){
		        	idArchivo = grabarDescarga(repositorioEmpresa, usuario, rutaRep);	
				}
		        
		        // String dominio = Utils.getInfoCorreo("DOM");
		        String dominio = UtilsPATH.DOMINIO_PRINCIPAL;
		        String urlZIP = "https://"+UtilsPATH.SUBDOMINIO_LOGIN+"/login/descargarSiarex.jsp?idArchivo="+idArchivo;

		        
		        logger.info("*********** bandZIP **************************"+bandZIP);
		        logger.info("*********** emailUsuario **************************"+emailUsuario);
		        String listaCorreos [] = {emailUsuario};
	        	String sbHTML = UtilsHTML.generaHTMLExport(nombreEmpleado, urlZIP, dominio);
	        	logger.info("*********** sbHTML **************************"+sbHTML);
	        	EnviaCorreoGrid.enviarCorreo(null, sbHTML, false, listaCorreos, null,  "Descarga de Facturas SIAREX", emailEmpresa,pwdCorreo );
			}else {
				String listaCorreos [] = {emailUsuario};
				String sbHTML = "<p style='font-size: 16px; color: #00539f;'>Estimado usuario, le informamos que no se encontro informaci(o)n con los datos proporcionados.</p>";
	        	logger.info("*********** sbHTML **************************"+sbHTML);
	        	EnviaCorreoGrid.enviarCorreo(null, sbHTML, false, listaCorreos, null,  "Descarga de Facturas SIAREX", emailEmpresa,pwdCorreo);
			}
			
        	
		}catch(Exception e){
			Utils.imprimeLog("", e);
		}finally {
			try {
				if (con != null) {
					con.close();
				}
				con = null;
			}catch(Exception e) {
				con = null;
			}
		}
	}
	
	
	 
	public String generaExcel(Connection con, String esquemaBD, ArrayList<ArrayList<String>> listaUUID, String rutaFinal, String repositorioEmpresa, String usuario, String fechaActual, 
			String rfcEmpresa, String validarSAT){
		SXSSFWorkbook  libro = new SXSSFWorkbook(100); // Keep 100 rows in memory
		SXSSFSheet hoja1 = libro.createSheet("Informacion Basica");
	    
		String rutaDestinoXLS = null;
		 Comprobante _comprobante = null;
		try{
			Row header = hoja1.createRow(0);
			
			   CellStyle styleTitulo = libro.createCellStyle();
			   Font headerFont = libro.createFont();
		       headerFont.setFontHeightInPoints((short)10);
		       headerFont.setColor(IndexedColors.WHITE.getIndex());
		       headerFont.setFontName("Arial");
		       headerFont.setBold(true);
		       //styleTitulo.setFillForegroundColor(new XSSFColor(new java.awt.Color(12, 57, 90)));
		       styleTitulo.setFillForegroundColor(new XSSFColor(UtilsColor.getBytes(12, 57, 90)));
		       
		       
		       styleTitulo.setFillPattern(FillPatternType.SOLID_FOREGROUND);
		       styleTitulo.setFont(headerFont);
		       styleTitulo.setAlignment(HorizontalAlignment.CENTER);
		       
		       
		       CellStyle styleSubTitulo = libro.createCellStyle();
			   Font fontSub = libro.createFont();
			   fontSub.setFontHeightInPoints((short)10);
			   fontSub.setFontName("Arial");
			   fontSub.setBold(true);
		       styleSubTitulo.setFont(fontSub);
		       styleSubTitulo.setAlignment(HorizontalAlignment.CENTER);
		       
			   Cell monthCell = header.createCell(0);
			   monthCell.setCellValue("Sistema de Recepcion de XML");
			   monthCell.setCellStyle(styleTitulo);
			   hoja1.addMergedRegion(CellRangeAddress.valueOf("A1:H1"));
			  
			   header = hoja1.createRow(1);
			   header.setHeightInPoints(18);
			   Cell monthCell2 = header.createCell(0);
			   monthCell2.setCellValue("Detalle Boveda Nomina XML");
			   monthCell2.setCellStyle(styleSubTitulo);
			   hoja1.addMergedRegion(CellRangeAddress.valueOf("A2:H2"));
			    
			
			
			String[] headers = new String[]{
		            "UUID",
		            "Empleado",
		            "Sub-Total",
		            "Total",
		            "Status CFDI",
		            "Estado Factura",
		            "Tipo de Comprobante"
		        };
			
			   
			Row headerRow = hoja1.createRow(2);
	        String headerEncabezados = null;
	        Cell cell = null;
	        for (int i = 0; i < headers.length; ++i) {
	        	headerEncabezados = headers[i];
	            cell = headerRow.createCell(i);
	            // cell.setCellStyle(headerStyle);
	            cell.setCellValue(headerEncabezados);
	            
	        }
	        ArrayList<String> rowXML = null;
	        String UUID = null;
	        String UUID_NO_ENCONTRADO = null;
	        String RAZON_SOCIAL = null;
	        String SUB_TOTAL = null;
	       //String TOTAL_FORMATEADO = null;
	        double TOTAL = 0;
	        String ESTATUS_SAT = null;
	        String ESTADO_SAT = null;
	        String ENCONTRADO_ROW = null;
	        String RFCReceptor = null;
	        
	        String datosSAT [] = {"",""};
	        
	        Row dataRow = null;
	        String repBoveda = "/REPOSITORIOS/"+repositorioEmpresa+"/BOVEDA/";
	        String repBovedaEmitidos = "/REPOSITORIOS/"+repositorioEmpresa+"/BOVEDA_EMITIDOS/";
			
	        
			// DecimalFormat decimalFormat = new DecimalFormat("###,###.##");
			
			JSONObject jsonBoveda = null;
			String xmlComprobante = "";
			int numRow = 3;
			
			String rfcValidarSAT = null;
	        for (int i = 0; i < listaUUID.size(); ++i) {
	        	
	        	rowXML = listaUUID.get(i);
	        	
	        	 if (i % 100 == 0 && i != 0) { // Flush every 100 rows (after the first 100)
	                    ((SXSSFSheet) hoja1).flushRows(100); // Retain the last 100 rows in memory
	                }

	            dataRow = hoja1.createRow(numRow++);
	            
	            ESTATUS_SAT = VACIO;
	            ESTADO_SAT = VACIO;
	            ENCONTRADO_ROW = rowXML.get(2);
	            RAZON_SOCIAL = rowXML.get(4);
	            SUB_TOTAL = rowXML.get(5);
	            UUID = rowXML.get(0);
	            RFCReceptor  = rowXML.get(8);
	            UUID_NO_ENCONTRADO = rowXML.get(7);
	            // TOTAL_FORMATEADO = rowXML.get(9);
	            
	            
	            TOTAL = 0;
	            if (ENCONTRADO.equalsIgnoreCase(ENCONTRADO_ROW)){
	              // CALCULA EN EL SAT EL XML
	            	TOTAL = Double.parseDouble( rowXML.get(6));
	            	if ("S".equalsIgnoreCase(validarSAT)) {
	            		datosSAT = UtilsSAT.validaSAT(rfcEmpresa, RFCReceptor, TOTAL, UUID);
	            		ESTATUS_SAT = datosSAT[1];
	            		ESTADO_SAT  = datosSAT[0];
	            	}else {
	            		ESTATUS_SAT = VACIO;
	            		ESTADO_SAT  = VACIO;
	            	}
	            	MAPA_VALIDACION_SAL.put(UUID, ESTADO_SAT);
	            	dataRow.createCell(0).setCellValue(UUID);
	            	dataRow.createCell(6).setCellValue("Nomina");
	            }else {
	            	dataRow.createCell(0).setCellValue(UUID_NO_ENCONTRADO);
	            	dataRow.createCell(6).setCellValue("");
	            }
	            
	            
	            dataRow.createCell(1).setCellValue(RAZON_SOCIAL);
	            dataRow.createCell(2).setCellValue(Utils.convertirDouble(SUB_TOTAL));
	            dataRow.createCell(3).setCellValue(Utils.noNuloDouble(TOTAL));
	            dataRow.createCell(4).setCellValue(ESTATUS_SAT);
	            dataRow.createCell(5).setCellValue(ESTADO_SAT);
	            
	            
	            
	        }

	        // logger.info("rutaDestinoXLS====>"+rutaDestinoXLS);
	        
	      //rutaDestinoXLS = rutaFinal + "/REPOSITORIOS/"+repositorioEmpresa+"/EXPORTAR/"+fechaActual+"/"+usuario+"_"+fechaActual+".xls";
	        // yyyyMMdd HH:mm:ss
	        // yyyyMMddHHmmss
	        String fechaHoy = UtilsFechas.getFechaActualNumero();
			String nombreReporte = rfcEmpresa+"_InformacionBasica_"+fechaHoy.substring(0, 8) + "_" + fechaHoy.substring(8, 12);
	        rutaDestinoXLS = rutaFinal + "/REPOSITORIOS/"+repositorioEmpresa+"/EXPORTAR/"+fechaActual+"/"+nombreReporte+".xlsx";
	        
	        FileOutputStream file = new FileOutputStream(rutaDestinoXLS);
	        libro.write(file);
	        file.close();

	        
		}catch(Exception e){
			Utils.imprimeLog("", e);
		}finally{
			try{
				libro.close();
			}catch(Exception e){
				libro = null;
			}
		}
		return rutaDestinoXLS;
	}
	
	
	
	public String generaExcelBitacora(Connection con, String esquemaBD,  String rutaFinal, String repositorioEmpresa, String fechaActual, String rfcReceptor, long codeOperacion){
		SXSSFWorkbook  workbook = new SXSSFWorkbook(100); // Keep 100 rows in memory
		SXSSFSheet sheet = workbook.createSheet();
		String rutaDestinoXLS = "";
		 ExportarPorXML expXMLBean = new ExportarPorXML();
		try{
			
			workbook.setSheetName(0, "XML no permitidos");
			String[] headers = new String[]{
					"UUID",
		            "RFC",
		            "Razón Social",
		            "Tipo de Comprobante",
		            "Mensaje de Validacion",
		    };
			
			CellStyle headerStyle = workbook.createCellStyle();
			Font font = workbook.createFont();
	        font.setBold(true);
	        headerStyle.setFont(font);
	        
	        CellStyle style = workbook.createCellStyle();
	        style.setFillForegroundColor(IndexedColors.LIGHT_YELLOW.getIndex());
	        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);

	        Font fuente = workbook.createFont();
			fuente.setFontHeightInPoints((short)10);
			fuente.setFontName(HSSFFont.FONT_ARIAL);
			   
	        Row headerRow = sheet.createRow(0);
	        String header = null;
	        Cell cell = null;
	        for (int i = 0; i < headers.length; ++i) {
	            header = headers[i];
	            cell = headerRow.createCell(i);
	            cell.setCellStyle(headerStyle);
	            cell.setCellValue(header);
	            
	        }
	        Row dataRow = null;
			
	        sheet.setColumnWidth(0, 13000);
	        sheet.setColumnWidth(1, 5000);
	        sheet.setColumnWidth(2, 15000);
	        sheet.setColumnWidth(3, 10000);
	        sheet.setColumnWidth(4, 20000);
	        
        	ArrayList<ValidacionXMLForm> listaDetalle = expXMLBean.consultarBitacora(con, esquemaBD, codeOperacion);
        	ValidacionXMLForm valXML = null;
	        for (int i = 0; i < listaDetalle.size(); ++i) {
	        	valXML = listaDetalle.get(i);
	            dataRow = sheet.createRow(i + 1);
	            
	            dataRow.createCell(0).setCellValue(valXML.getUuid());
	            dataRow.createCell(1).setCellValue(valXML.getRfcReceptor());
	            dataRow.createCell(2).setCellValue(valXML.getRazonSocial());
	            dataRow.createCell(3).setCellValue(valXML.getTipoComprobante());
	            dataRow.createCell(4).setCellValue(valXML.getMensajeOperacion());
	            
	            
	        }
	        
	        if (listaDetalle.size() > 0) {
		        String fechaHoy = UtilsFechas.getFechaActualNumero();
				String nombreReporte = rfcReceptor+"_DetalleErroresXML_"+fechaHoy.substring(0, 8) + "_" + fechaHoy.substring(8, 12);
		        rutaDestinoXLS = rutaFinal + "/REPOSITORIOS/"+repositorioEmpresa+"/EXPORTAR/"+fechaActual+"/"+nombreReporte+".xlsx";
		        
		        FileOutputStream file = new FileOutputStream(rutaDestinoXLS);
		        workbook.write(file);
		        file.close();
	        }
		}catch(Exception e){
			Utils.imprimeLog("", e);
		}finally{
			try{
				workbook.close();
			}catch(Exception e){
				workbook = null;
			}
		}
		return rutaDestinoXLS;
	}
	
	
	private Double parseaDoble(String valor){
		double retorno = 0;
		try{
			retorno = Double.parseDouble(valor);
		}catch(Exception e){
			retorno = 0;
		}
		return retorno;
	}
	
	public void procesaArchivo(final File fileTXT, final String esquema, final String usuarioHTTP, 
				final String emailEmpresa, final String pwdCorreo, final String nombreEmpleado, final String emailUsuario, final String modoAgrupar, 
				final String validarSAT, final String descargarFacturas, 
				 final String tipoBusqueda, final String rfcEmpleado, 
				final String fechaInicial, final String fechaFinal, final String rutaXMLProcesar, final long codeOperacion){
		try{
			Thread generaXMLNomina = new Thread(new Runnable() {
				public void run() {
					logger.info("*********** PROCESO DE EXPORTAR ARCHIVO XML NOMINA **************************");
					ArrayList<ArrayList<String>> listaUUID =  null;
					if ("TEXTO".equalsIgnoreCase(tipoBusqueda)) {
						listaUUID =  obtenerUUID(fileTXT, esquema);
						// generaZIP(listaUUID, esquema, usuario, emailEmpresa, pwdCorreo, emailUsuario, modoAgrupar, validarSAT, complementoSAT, notaCreditoSAT, descargarFacturas, descargarComplemento, descargarComplemento, nombreEmpleado, tipoBusqueda);
					}else if ("RFC".equalsIgnoreCase(tipoBusqueda)) {
						listaUUID = obtenerUUIDPorRFC(esquema, rfcEmpleado, fechaInicial, fechaFinal);
					}else if ("XML".equalsIgnoreCase(tipoBusqueda)){
						ExportarPorXML exportarXML = new ExportarPorXML();
						String rfcEmpresa = consultaRFC(esquema);
						listaUUID = exportarXML.obtenerUUIDPorXMLNomina(esquema, rutaXMLProcesar, rfcEmpresa, codeOperacion, usuarioHTTP);
						
					}
					
					generaZIP(listaUUID, esquema, usuarioHTTP, emailEmpresa, pwdCorreo, emailUsuario, modoAgrupar, validarSAT, descargarFacturas, nombreEmpleado, tipoBusqueda, codeOperacion);
					
					logger.info("*********** TERMINO PROCESO DE EXPORTAR NOMINA**************************");
				}
			});
			generaXMLNomina.start();

		}catch(Exception e){
			Utils.imprimeLog("", e);
		}
	}
	
	
	
	private void eliminaArchivo(String rutaArchivo){
		try {
			File file = new File(rutaArchivo);
			logger.info("Eliminando archivo : "+rutaArchivo);
			file.delete();	
		}catch(Exception e) {
			Utils.imprimeLog("", e);
		}
		
	}
	
	private void eliminaDirectorio(String rutaDir){
		try {
			File archivo = new File(rutaDir);
		    deleteFile(archivo);
		}catch(Exception e) {
			Utils.imprimeLog("", e);
		}
	}
	
	private void deleteFile(File file){
	    if (file.exists()) {
	        if (file.isFile())
	            file.delete();
	        else {
	            File f[]=file.listFiles();
	            for (int i = 0; i < f.length; i++) {
	                    deleteFile(f[i]);
	            }
	            file.delete();
	        }
	    }
	       
	}
	
	private String eliminaCaracter(String nombreArchivo){
		String nombreArchivoFinal = nombreArchivo.replaceAll("&=", "");
		return nombreArchivoFinal ;	
	}
	


	private String desEstatus(String claveEstatus){
		if ("A1".equalsIgnoreCase(claveEstatus)){
			return "SERV. NO RECIBIDO";
		}
		if ("A2".equalsIgnoreCase(claveEstatus)){
			return "SERVICIO CON RECIBO Y SIN FACTURA";
		}
		if ("A3".equalsIgnoreCase(claveEstatus)){
			return "LISTO PARA PAGO";
		}
		if ("A4".equalsIgnoreCase(claveEstatus)){
			return "PAGADO";
		}
		if ("A5".equalsIgnoreCase(claveEstatus)){
			return "SERV. SIN RECIBO Y NO FACTURA";
		}
	   return "";	
	}


	
	
	private void descargarXML(Connection conEmpresa, String esquema, String nombreRepositorio, String uuidTXT) {
		DescargaMasiva descargaMasivaBean = new DescargaMasiva();
		String jsonRespuesta = null;
		String baseData64 = null;
		BovedaBean bovedaBean = new BovedaBean();
		Comprobante _comprobante = null;
		BovedaEmitidosBean bovedaEmitidosBean = new BovedaEmitidosBean();
		
		try {
			
			AccesoBean acceesoBean = new AccesoBean();
			EmpresasForm empresaForm = acceesoBean.consultaEmpresaEsquema(nombreRepositorio);
			
			
			String rutaPublicHTML = UtilsPATH.RUTA_PUBLIC_HTML + nombreRepositorio + File.separator;
			long nombreXML = System.currentTimeMillis();
			String apiKey = UtilsPATH.API_KEY_TIMBRADO_DESCARGA;
			String rfcSolicitante = consultaRFC("");
			// String rfcSolicitante = "PLA720201746";
			jsonRespuesta = descargaMasivaBean.recuperaCFDI(rfcSolicitante, apiKey, uuidTXT);
			Integer arrResultado [] = {0,0,0,0,0};
			if (jsonRespuesta != null) {
				org.json.JSONObject jsonArray   = new org.json.JSONObject(jsonRespuesta);
				if (jsonArray.get("data").toString() != null) {
					baseData64 = jsonArray.get("data").toString();
					if (baseData64 == null || "null".equalsIgnoreCase(baseData64)) {
						logger.info("No encontrado UUID===>"+uuidTXT );
					}else {
						String rutaXML = rutaPublicHTML + nombreXML +".xml";
						// logger.info("rutaXML===>"+rutaXML );
						File fileXML = new File(rutaXML);
						descargaMasivaBean.generarXML(rutaXML, baseData64);
						 
						_comprobante = LeerXML.ObtenerComprobante(fileXML.getAbsolutePath());
						/*if ("N".equalsIgnoreCase(_comprobante.getTipoDeComprobante())) {
							ArrayList<File> listaNomina = new ArrayList<File>();
							listaNomina.add(new File(rutaXML));
							bovedaNomina.procesarXmlBoveda(conEmpresa, esquema, empresaForm.getEsquema(), listaNomina, arrResultado, usuarioHTTP);
						}else */ if (empresaForm.getRfc().equalsIgnoreCase(_comprobante.getReceptor().getRfc())){ // es recibido
							bovedaBean.procesarXmlBoveda(conEmpresa, esquema, empresaForm.getEsquema(), fileXML, arrResultado, true);	
						}else {
							bovedaEmitidosBean.procesarXmlBoveda(conEmpresa, esquema, empresaForm.getEsquema(), fileXML, arrResultado, usuarioHTTP, true);	
						}
						
					}
				}
			}
		}catch(Exception e) {
			Utils.imprimeLog("", e);
		}
	}

	
	public ArrayList<ProveedoresForm> comboEmpleados(Connection con, String esquema, String idLengueje) {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        ProveedoresForm proveedoresForm = new ProveedoresForm();
        ArrayList<ProveedoresForm> listaProveedores = new ArrayList<>();
        
        try{
        	proveedoresForm.setRfc("");
	        proveedoresForm.setRazonSocial("Seleccione una Opción");
	        listaProveedores.add(proveedoresForm);
	        proveedoresForm = new ProveedoresForm();
	        
        	
        	StringBuffer sbQuery = new StringBuffer(ExportarNominaQuerys.getComboEmpleados(esquema));
            stmt = con.prepareStatement(sbQuery.toString());
            rs = stmt.executeQuery();
	        
	        while (rs.next()){
	        	
		        proveedoresForm.setRfc(Utils.noNuloNormal(rs.getString(1)));
		        proveedoresForm.setRazonSocial(proveedoresForm.getRfc() + " - " + Utils.regresaCaracteresNormales(Utils.noNulo(rs.getString(2))));
		        listaProveedores.add(proveedoresForm);
		        proveedoresForm = new ProveedoresForm();
	        }
	        
	        
        } catch(Exception e){
        	Utils.imprimeLog("comboProveedores(): ", e);
        } finally{
        	try{
   	        	 if(rs != null) {
   	                rs.close();
   	            }
   	            rs = null;
   	            if(stmt != null) {
   	                stmt.close();
   	            }
   	            stmt = null;
        	}
        	catch(Exception e){
        		rs = null;
        		stmt = null;
        	}
        }
        return listaProveedores;
    }
	

}