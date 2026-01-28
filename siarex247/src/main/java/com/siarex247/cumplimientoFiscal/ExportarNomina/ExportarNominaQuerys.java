package com.siarex247.cumplimientoFiscal.ExportarNomina;

public class ExportarNominaQuerys {

	
//	private static String consultarUUID =  "select A.ESTATUS_PAGO, A.NOMBRE_XML, A.NOMBRE_PDF, A.CLAVE_PROVEEDOR, A.UUID, A.TOTAL, A.SUB_TOTAL, B.RAZON_SOCIAL, B.RFC, A.FOLIO_EMPRESA, A.TIPO_MONEDA, C.NOMBRE_XML, C.NOMBRE_PDF, C.TOTAL_COMPLEMENTO, UUID_COMPLEMENTO from ORDENES A inner join PROVEEDORES B on A.CLAVE_PROVEEDOR = B.CLAVE_PROVEEDOR left join COMPLEMENTARIA C on A.FOLIO_ORDEN = C.FOLIO_ORDEN where (A.FOLIO_EMPRESA = ? or upper(A.UUID) = ?)";
	private static String consultarUUID =  "select UUID, RECEPTOR_NOMBRE, SUB_TOTAL, TOTAL, RECEPTOR_RFC, ID_REGISTRO, TIPO_COMPROBANTE, MONEDA, FECHA_PAGO, FECHA_INICIAL_PAGO, FECHA_FINAL_PAGO from BOVEDA_NOMINA where UUID = ?";
	private static String consultarRFC =  "select RFC from EMPRESAS where ESQUEMA = ?";
	private static String grabarDescarga =  "insert into DESCARGA_XML (RUTA_ARCHIVO, USUARIO) values (?,?)";
	private static String consultarDescarga =  "select RUTA_ARCHIVO, FECHAALTA from DESCARGA_XML where CLAVE_REGISTRO = ? and USUARIO = ?";
	
	
	private static String consultarBovedaNomina =  "select UUID, RECEPTOR_NOMBRE, SUB_TOTAL, TOTAL, RECEPTOR_RFC, ID_REGISTRO, TIPO_COMPROBANTE, MONEDA, FECHA_PAGO, FECHA_INICIAL_PAGO, FECHA_FINAL_PAGO from BOVEDA_NOMINA where RECEPTOR_RFC = ? and FECHA_FACTURA between ? and ?";
	private static String guardarBitacoraXML =  "insert into <<esquema>>.BITACORA_EXPORTAR_XML (UUID, RFC_RECEPTOR, RAZON_SOCIAL, TIPO_COMPROBANTE, MENSAJE_VALIDACION, CODE_OPERACION, USUARIO_TRAN) values (?,?,?,?,?,?,?)";
	private static String consultarBitacora =  "select UUID, RFC_RECEPTOR, RAZON_SOCIAL, TIPO_COMPROBANTE, MENSAJE_VALIDACION from <<esquema>>.BITACORA_EXPORTAR_XML where CODE_OPERACION = ?";
	private static String comboEmpleados  =  "select RECEPTOR_RFC, RECEPTOR_NOMBRE from BOVEDA_NOMINA group by RECEPTOR_RFC, RECEPTOR_NOMBRE order by RECEPTOR_RFC";
	
	
	public static String getConsultarUUID(String esquema) {
		return consultarUUID.replaceAll("<<esquema>>", esquema);
	}
	
	
	
	public static String getConsultarRFC(String esquema) {
		return consultarRFC.replaceAll("<<esquema>>", esquema);
	}
	
	
	public static String getGrabarDescarga(String esquema) {
		return grabarDescarga.replaceAll("<<esquema>>", esquema);
	}
	
	public static String getConsultarDescarga(String esquema) {
		return consultarDescarga.replaceAll("<<esquema>>", esquema);
	}

	
	public static String getConsultarBovedaNomina(String esquema) {
		return consultarBovedaNomina.replaceAll("<<esquema>>", esquema);
	}
	
	public static String getGuardarBitacoraXML(String esquema) {
		return guardarBitacoraXML.replaceAll("<<esquema>>", esquema);
	}
	
	public static String getConsultarBitacora(String esquema) {
		return consultarBitacora.replaceAll("<<esquema>>", esquema);
	}
	

	public static String getComboEmpleados(String esquema) {
		return comboEmpleados.replaceAll("<<esquema>>", esquema);
	}
	
}
