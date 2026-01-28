package com.siarex247.cumplimientoFiscal.ExportarNomina;

import java.io.InputStream;

import org.apache.struts2.interceptor.parameter.StrutsParameter;

import com.siarex247.bd.ActionDB;

public class ExportarNominaSupport extends ActionDB{

	private static final long serialVersionUID = 3673689896729937848L;

	private String correoResponsable;
	private String modoAgrupar;
	
	private String complementoSAT;
	
	
    
    private int idArchivo;
    
    private String codeDescarga;
	private String mensajeError;
	
	private InputStream inputStream;
	
	
    // boveda
	private String rfc;
	private String folio;
	private String serie;
	private String uuid;
	private String fechaInicial;
	private String fechaFinal;
	private String tipoComprobante;
	private String fechaFactura;
	private String idRegistro;
	private String nombreEmpresa;
	private String descargarFacturas;
	private String validarSAT;
	
	private String rfcEmpleado;
	private String tipoExportacion;
	
	
	public String getCorreoResponsable() {
		return correoResponsable;
	}
	@StrutsParameter
	public void setCorreoResponsable(String correoResponsable) {
		this.correoResponsable = correoResponsable;
	}
	public String getModoAgrupar() {
		return modoAgrupar;
	}
	@StrutsParameter
	public void setModoAgrupar(String modoAgrupar) {
		this.modoAgrupar = modoAgrupar;
	}
	public String getComplementoSAT() {
		return complementoSAT;
	}
	@StrutsParameter
	public void setComplementoSAT(String complementoSAT) {
		this.complementoSAT = complementoSAT;
	}
	public int getIdArchivo() {
		return idArchivo;
	}
	@StrutsParameter
	public void setIdArchivo(int idArchivo) {
		this.idArchivo = idArchivo;
	}
	public String getCodeDescarga() {
		return codeDescarga;
	}
	@StrutsParameter
	public void setCodeDescarga(String codeDescarga) {
		this.codeDescarga = codeDescarga;
	}
	public String getMensajeError() {
		return mensajeError;
	}
	@StrutsParameter
	public void setMensajeError(String mensajeError) {
		this.mensajeError = mensajeError;
	}
	public InputStream getInputStream() {
		return inputStream;
	}
	@StrutsParameter
	public void setInputStream(InputStream inputStream) {
		this.inputStream = inputStream;
	}
	public String getRfc() {
		return rfc;
	}
	@StrutsParameter
	public void setRfc(String rfc) {
		this.rfc = rfc;
	}
	public String getFolio() {
		return folio;
	}
	@StrutsParameter
	public void setFolio(String folio) {
		this.folio = folio;
	}
	public String getSerie() {
		return serie;
	}
	@StrutsParameter
	public void setSerie(String serie) {
		this.serie = serie;
	}
	public String getUuid() {
		return uuid;
	}
	@StrutsParameter
	public void setUuid(String uuid) {
		this.uuid = uuid;
	}
	public String getFechaInicial() {
		return fechaInicial;
	}
	@StrutsParameter
	public void setFechaInicial(String fechaInicial) {
		this.fechaInicial = fechaInicial;
	}
	public String getFechaFinal() {
		return fechaFinal;
	}
	@StrutsParameter
	public void setFechaFinal(String fechaFinal) {
		this.fechaFinal = fechaFinal;
	}
	public String getTipoComprobante() {
		return tipoComprobante;
	}
	@StrutsParameter
	public void setTipoComprobante(String tipoComprobante) {
		this.tipoComprobante = tipoComprobante;
	}
	public String getFechaFactura() {
		return fechaFactura;
	}
	@StrutsParameter
	public void setFechaFactura(String fechaFactura) {
		this.fechaFactura = fechaFactura;
	}
	public String getIdRegistro() {
		return idRegistro;
	}
	@StrutsParameter
	public void setIdRegistro(String idRegistro) {
		this.idRegistro = idRegistro;
	}
	public String getNombreEmpresa() {
		return nombreEmpresa;
	}
	@StrutsParameter
	public void setNombreEmpresa(String nombreEmpresa) {
		this.nombreEmpresa = nombreEmpresa;
	}
	public String getDescargarFacturas() {
		return descargarFacturas;
	}
	@StrutsParameter
	public void setDescargarFacturas(String descargarFacturas) {
		this.descargarFacturas = descargarFacturas;
	}
	public String getValidarSAT() {
		return validarSAT;
	}
	@StrutsParameter
	public void setValidarSAT(String validarSAT) {
		this.validarSAT = validarSAT;
	}
	public String getRfcEmpleado() {
		return rfcEmpleado;
	}
	@StrutsParameter
	public void setRfcEmpleado(String rfcEmpleado) {
		this.rfcEmpleado = rfcEmpleado;
	}
	public String getTipoExportacion() {
		return tipoExportacion;
	}
	@StrutsParameter
	public void setTipoExportacion(String tipoExportacion) {
		this.tipoExportacion = tipoExportacion;
	}
	
	
	
	
	
}
