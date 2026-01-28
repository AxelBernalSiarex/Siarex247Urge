package com.siarex247.visor.Automatizacion;

import java.io.File;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.sql.Connection;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.log4j.Logger;
import org.json.JSONObject;

import com.siarex247.bd.ConexionDB;
import com.siarex247.bd.ResultadoConexion;
import com.siarex247.catalogos.Proveedores.ProveedoresBean;
import com.siarex247.catalogos.Proveedores.ProveedoresForm;
import com.siarex247.seguridad.Accesos.AccesoBean;
import com.siarex247.seguridad.Accesos.EmpresasForm;
import com.siarex247.utils.Utils;
import com.siarex247.utils.UtilsAPIS;
import com.siarex247.utils.UtilsFile;
import com.siarex247.utils.UtilsPATH;
import com.siarex247.validaciones.ValidacionesFactura;
import com.siarex247.visor.VisorOrdenes.VisorOrdenesBean;

public class CorreoReader {

    private static final Logger logger = Logger.getLogger("siarex247");
    private static final String usuarioHTTP = "proceso.siarex@siarex.com";

    // ================= CÓDIGOS DE ERROR =================
    private static final String E001_ORDEN_VACIA          = "E001";
    private static final String E002_MONEDA_INVALIDA      = "E002";
    private static final String E003_EMPRESA_NO_EXISTE    = "E003";
    private static final String E004_PROV_NO_EXISTE       = "E004";
    private static final String E005_IMPORTE_INVALIDO     = "E005";
    private static final String E006_CLASIF_VACIA         = "E006";
    private static final String E007_REGISTRO_ORDEN_FALLO = "E007";
    private static final String E008_ORDEN_YA_EXISTE      = "E008";
    private static final String E999_ERROR_GENERAL        = "E999";

    // ================= CÓDIGOS NUEVOS PARA BITÁCORA (API/FLUJO) =================
    private static final String E009_DOREGISTER_ERROR     = "E009";
    private static final String E010_DOPURCHASE_ERROR     = "E010";
    private static final String E011_CARGA_FACTURA_ERROR  = "E011";
    private static final String E012_TOKEN_NO_GENERADO    = "E012";

    // ================= VALIDACIONES =================

    private void validarNumeroOrden(OrdenCompraHtmData data) throws ValidacionHtmException {
        String orden = (data != null) ? data.getOrdenCompra() : null;
        if (orden == null || orden.trim().isEmpty()) {
            logger.error("❌ NÚMERO DE ORDEN VACÍO");
            throw new ValidacionHtmException(E001_ORDEN_VACIA, "Número de orden obligatorio");
        }
        logger.info("✔ Número de orden válido: " + orden);
    }

    private void validarMoneda(OrdenCompraHtmData data) throws ValidacionHtmException {
        String moneda = (data != null) ? data.getMoneda() : null;
        if (moneda == null || moneda.trim().isEmpty()) {
            logger.error("❌ MONEDA NULA/VACÍA");
            throw new ValidacionHtmException(E002_MONEDA_INVALIDA, "Moneda obligatoria (MXN o USD)");
        }
        if (!"MXN".equalsIgnoreCase(moneda) && !"USD".equalsIgnoreCase(moneda)) {
            logger.error("❌ MONEDA NO VÁLIDA: " + moneda);
            throw new ValidacionHtmException(E002_MONEDA_INVALIDA, "Moneda no permitida: " + moneda);
        }
        logger.info("✔ Moneda válida: " + moneda);
    }

    private void validarImporte(OrdenCompraHtmData data) throws ValidacionHtmException {
        BigDecimal monto = (data != null) ? data.getMonto() : null;
        if (monto == null) {
            logger.error("❌ IMPORTE NULO");
            throw new ValidacionHtmException(E005_IMPORTE_INVALIDO, "Importe obligatorio");
        }
        if (monto.doubleValue() <= 0) {
            logger.error("❌ IMPORTE INVÁLIDO: " + monto);
            throw new ValidacionHtmException(E005_IMPORTE_INVALIDO, "Importe debe ser mayor a 0");
        }
        logger.info("✔ Importe válido: " + monto);
    }

    private void validarClasificacion(OrdenCompraHtmData data) throws ValidacionHtmException {
        String clasificacion = (data != null) ? data.getClasificacionCodigo() : null;
        if (clasificacion == null || clasificacion.trim().isEmpty()) {
            logger.error("❌ CLASIFICACIÓN VACÍA");
            throw new ValidacionHtmException(E006_CLASIF_VACIA, "Clasificación obligatoria");
        }
        logger.info("✔ Clasificación válida: " + clasificacion);
    }

    /**
     * 3) Valida que la razón social (DESDE) del HTM exista en EMPRESAS.NOMBRE_LARGO
     */
    private EmpresasForm validarEmpresaDesdeHTM(OrdenCompraHtmData data)
            throws ValidacionHtmException {

        String razonHtm = data.getDesde();

        if (razonHtm == null || razonHtm.trim().isEmpty()) {
            throw new ValidacionHtmException(E003_EMPRESA_NO_EXISTE,
                    "Razón social (DESDE) vacía");
        }

        try {
            AccesoBean accesoBean = new AccesoBean();
            EmpresasForm empresa = accesoBean
                .consultaEmpresaPorRazonSocialAccesos(razonHtm);

            if (empresa == null) {
                throw new ValidacionHtmException(E003_EMPRESA_NO_EXISTE,
                    "Empresa no registrada en ACCESOS: " + razonHtm);
            }

            logger.info("✔ Empresa DESDE válida: "
                + empresa.getNombreLargo()
                + " RFC=" + empresa.getRfc());

            return empresa;

        } catch (ValidacionHtmException vex) {
            throw vex;
        } catch (Exception e) {
            throw new ValidacionHtmException(E003_EMPRESA_NO_EXISTE,
                "Error validando empresa DESDE: " + e.getMessage(), e);
        }
    }

    /**
     * 4) Valida proveedor por RAZON SOCIAL del "PARA"
     */
    private void validarProveedorPara(OrdenCompraHtmData data, EmpresasForm empresaSesion)
            throws ValidacionHtmException {

        String proveedorRaw = (data != null) ? data.getPara() : null;
        if (proveedorRaw == null || proveedorRaw.trim().isEmpty()) {
            throw new ValidacionHtmException(E004_PROV_NO_EXISTE, "Proveedor (PARA) vacío");
        }

        try {
            ProveedoresBean proveedoresBean = new ProveedoresBean();
            logger.info("Validando proveedor (PARA): [" + proveedorRaw + "] esquema=" + empresaSesion.getEsquema());
            ProveedoresForm provForm = proveedoresBean.obtenerProveedorPorRazonSocial( proveedorRaw, empresaSesion.getEsquema());
            if (provForm.getClaveRegistro() == 0) {
                logger.error("❌ PROVEEDOR NO REGISTRADO: [" + proveedorRaw + "]");
                throw new ValidacionHtmException(E004_PROV_NO_EXISTE, "Proveedor no registrado: " + proveedorRaw);
            }
            logger.info("✔ Proveedor válido (PARA): " + proveedorRaw);
        } catch (ValidacionHtmException vex) {
            throw vex;
        } catch (Exception e) {
            throw new ValidacionHtmException(E004_PROV_NO_EXISTE,
                    "Error validando PROVEEDOR (PARA): " + e.getMessage(), e);
        }
    }

    // ================= EXTRACCIONES =================

    private BigDecimal extraerCantidadUnidad(String html) {
        try {
            Pattern p = Pattern.compile(
                "<span[^>]*>\\s*(\\d+(?:\\.\\d+)?)\\s*</span>\\s*<span>\\s*\\(EA\\)\\s*</span>",
                Pattern.CASE_INSENSITIVE
            );
            Matcher m = p.matcher(html);
            if (m.find()) return new BigDecimal(m.group(1));
        } catch (Exception e) {
            logger.error("Error extrayendo Cant. (Unidad)", e);
        }
        return BigDecimal.ONE;
    }

    private String leerArchivoComoString(File archivo) throws Exception {
        return Files.readString(archivo.toPath(), StandardCharsets.UTF_8);
    }

    // ================= HELPERS =================

    /*
    private String normalizarBasica(String texto) {
        return texto == null ? null :
            texto.toLowerCase()
                 .replace(".", "")
                 .replace(",", "")
                 .replaceAll("\\s+", " ")
                 .trim();
    }
    */

    private String obtenerRfcProveedorPorRazonSocial(String esquemaEmpresa, String razonSocial)
            throws ValidacionHtmException {
        try {
            ProveedoresBean provBean = new ProveedoresBean();
            ProveedoresForm provForm = provBean.obtenerProveedorPorRazonSocial(razonSocial, esquemaEmpresa);
            if (provForm == null || provForm.getRfc() == null || provForm.getRfc().trim().isEmpty()) {
                logger.error("❌ Proveedor sin RFC: " + razonSocial);
                throw new ValidacionHtmException(E004_PROV_NO_EXISTE,
                        "Proveedor sin RFC registrado: " + razonSocial);
            }
            logger.info("✔ RFC proveedor obtenido: " + provForm.getRfc()
                    + " razonSocial=" + razonSocial);
            return provForm.getRfc();
        } catch (ValidacionHtmException vex) {
            throw vex;
        } catch (Exception e) {
            logger.error("Error obteniendo RFC proveedor: " + razonSocial, e);
            throw new ValidacionHtmException(E004_PROV_NO_EXISTE,
                    "Error obteniendo RFC proveedor: " + razonSocial, e);
        }
    }

 // ================= BITÁCORA (ERRORES) =================

    private void bitacorarErrorHtm(String nombreEsquemaEmpresa,
                                   String numOrden,
                                   String codError,
                                   String descError,
                                   String emailOrigen,
                                   String asunto,
                                   File archivoHtm) {

        try {
            if (nombreEsquemaEmpresa == null || nombreEsquemaEmpresa.trim().isEmpty()) {
                logger.warn("bitacorarErrorHtm: esquemaEmpresa vacío, no se inserta bitácora. codError=" + codError);
                return;
            }

            BitacoraOrdenCompraHtmForm form = new BitacoraOrdenCompraHtmForm();

            // Límites EXACTOS según DDL
            form.setNumOrden(trunc(Utils.noNulo(numOrden), 50));
            form.setCodError(trunc(Utils.noNulo(codError), 20));
            form.setDescError(trunc(Utils.noNulo(descError), 500));
            form.setEmailOrigen(trunc(Utils.noNulo(emailOrigen), 255));
            form.setAsunto(trunc(Utils.noNuloNormal(asunto), 255));

            // IMPORTANTE: ARCHIVO_HTM es varchar(500) -> guardar ruta/nombre, NO el HTML completo
            form.setArchivoHtm(obtenerContenidoHtmParaBitacora(archivoHtm)); // <= 500

            BitacoraOrdenCompraHtmBean bean = new BitacoraOrdenCompraHtmBean();
            boolean ok = bean.insertar(form, nombreEsquemaEmpresa);

            logger.info("bitacorarErrorHtm -> esquema=" + nombreEsquemaEmpresa
                    + " numOrden=" + form.getNumOrden()
                    + " codError=" + form.getCodError()
                    + " insertOk=" + ok);

        } catch (Exception e) {
            logger.error("❌ No se pudo insertar BITACORA_ORDEN_COMPRA_HTM", e);
        }
    }

    private String obtenerContenidoHtmParaBitacora(File archivoHtm) {
        if (archivoHtm == null) return null;

        // Guardamos la ruta absoluta (o nombre), porque el HTML completo NO cabe en varchar(500)
        String ruta = archivoHtm.getAbsolutePath();

        // Por si acaso la ruta crece mucho, truncamos a 500 (límite exacto)
        return trunc(ruta, 500);
    }

    private String trunc(String s, int max) {
        if (s == null) return null;
        if (s.length() <= max) return s;
        return s.substring(0, max);
    }


    // ================= USO EXTERNO =================

    public void procesarHtmArchivo(File archivoHtm,
                                   EmpresasForm empresaSesion,
                                   String emailOrigen,
                                   String asunto) throws ValidacionHtmException {

        if (archivoHtm == null || !archivoHtm.exists()) {
            // Bitácora también para archivo inexistente
            bitacorarErrorHtm(
                    empresaSesion != null ? empresaSesion.getEsquema() : null,
                    "0",
                    E999_ERROR_GENERAL,
                    "Archivo HTM no existe: " + (archivoHtm != null ? archivoHtm.getAbsolutePath() : "null"),
                    emailOrigen,
                    asunto,
                    archivoHtm
            );

            throw new ValidacionHtmException(E999_ERROR_GENERAL,
                    "Archivo HTM no existe: " + (archivoHtm != null ? archivoHtm.getAbsolutePath() : "null"));
        }

        OrdenCompraHtmData data = null;
       // String fileName = archivoHtm.getName();

        try {
            AribaHtmParser parser = new AribaHtmParser();
            data = parser.parse(archivoHtm);

            validarNumeroOrden(data);
            validarMoneda(data);
            validarImporte(data);
            validarClasificacion(data);
            EmpresasForm empresaDesde = validarEmpresaDesdeHTM(data);
            validarProveedorPara(data, empresaSesion);

            registrarNuevaOrdenDesdeHtm(empresaSesion, data, archivoHtm, emailOrigen, asunto);

            llamarServicioDoRegister(
                empresaSesion,
                data,
                Long.parseLong(data.getOrdenCompra()),
                emailOrigen,
                asunto,
                archivoHtm
            );
            
            if (archivoHtm.exists()) {
            	archivoHtm.delete();
            }

        } catch (ValidacionHtmException vex) {

            // ===== BITÁCORA en validaciones/errores de negocio =====
            String numOrden = (data != null) ? data.getOrdenCompra() : "0";
            bitacorarErrorHtm(
                    empresaSesion != null ? empresaSesion.getEsquema() : null,
                    numOrden,
                    vex.getCodigoError(),
                    vex.getMessage(),
                    emailOrigen,
                    asunto,
                    archivoHtm
            );

            throw vex;

        } catch (Exception ex) {

            // ===== BITÁCORA error general =====
            String numOrden = (data != null) ? data.getOrdenCompra() : "0";
            bitacorarErrorHtm(
                    empresaSesion != null ? empresaSesion.getEsquema() : null,
                    numOrden,
                    E999_ERROR_GENERAL,
                    "Error general procesando HTM: " + ex.getMessage(),
                    emailOrigen,
                    asunto,
                    archivoHtm
            );

            throw new ValidacionHtmException(E999_ERROR_GENERAL,
                    "Error general procesando HTM: " + ex.getMessage(), ex);
        }
    }

    // ================= REGISTRO ORDEN =================

    private void registrarNuevaOrdenDesdeHtm(EmpresasForm empresaSesion,
            OrdenCompraHtmData data,
            File archivoHtm,
            String emailOrigen,
            String asunto) throws ValidacionHtmException {

        ResultadoConexion rc = null;
        Connection con = null;

        try {
            long folioEmpresa = Long.parseLong(data.getOrdenCompra().trim());

            logger.info("ENTRO A REGISTRAR ORDEN DE COMPRA");

            ConexionDB connPool = new ConexionDB();
            rc = connPool.getConnection(empresaSesion.getEsquema());
            con = rc.getCon();

            ProveedoresBean provBean = new ProveedoresBean();
            ProveedoresForm provForm = provBean.obtenerProveedorPorRazonSocial(Utils.noNulo(data.getPara()), empresaSesion.getEsquema());
           // int claveProveedor = obtenerClaveProveedorPorRazonSocial(
            //        con, rc.getEsquema(), data.getPara());
            
           if (provForm.getClaveRegistro() <= 0) {
                throw new ValidacionHtmException(E004_PROV_NO_EXISTE,
                        "Proveedor no registrado: " + data.getPara());
            }

            VisorOrdenesBean visorBean = new VisorOrdenesBean();
            String nombreArchivo = folioEmpresa+".htm";
            int resultado = visorBean.nuevaOrden(
                con,
                rc.getEsquema(),
                folioEmpresa,
                "",
                data.getMoneda(),
                data.getMonto().doubleValue(),
                provForm.getClaveRegistro(),
                "0",
                "",
                "A5",
                "",
                "",
                usuarioHTTP,
                nombreArchivo
            );

            if (resultado == 1) {
            	String pathTareas = UtilsPATH.REPOSITORIO_DOCUMENTOS + empresaSesion.getEsquema() +"/TAREAS_SIAREX/"+nombreArchivo;
            	
            	File fileTareas = new File(pathTareas);
            	UtilsFile.moveFileDirectory(archivoHtm,fileTareas, true, false, true,false);
            	return;
            }else if (resultado == 1062 || resultado == -1062) {
                throw new ValidacionHtmException(E008_ORDEN_YA_EXISTE,
                    "Orden ya existe, se omite reprocesar y timbrar: " + folioEmpresa);
            }


            throw new ValidacionHtmException(E007_REGISTRO_ORDEN_FALLO,
                    "No se pudo registrar orden. Resultado=" + resultado);

        } catch (Exception e) {
            throw new ValidacionHtmException(E007_REGISTRO_ORDEN_FALLO,
                    "Error registrando orden: " + e.getMessage(), e);
        } finally {
            try { 
            	if (con != null) 
            		con.close(); 
            	con = null;
            } catch (Exception ignore) {
            	con = null;
            }
        }
    }

     // ================= DoRegister =================

    private void llamarServicioDoRegister(
            EmpresasForm empresaSesion,
            OrdenCompraHtmData data,
            long folioEmpresa,
            String emailOrigen,
            String asunto,
            File archivoHtm) {

      //  Connection con = null;

        try {
            // =========================================================
            // 2) VALIDAR GENERA_FACTURA
            // =========================================================
            boolean generaFactura = proveedorGeneraFactura( empresaSesion.getEsquema(), data.getPara() );

            if (!generaFactura) {
                logger.info("⏭ Proveedor NO genera factura, se omite timbrado y DoPurchase. "
                        + "Proveedor=" + data.getPara()
                        + " | Orden=" + folioEmpresa);
                return;
            }

             // =========================================================
            // 0) TOKEN
            // =========================================================
            String token = UtilsAPIS.generarToken("");
            if (token == null || token.trim().isEmpty()) {
                logger.warn("⚠ No se pudo generar token folio=" + folioEmpresa);

                // ===== BITÁCORA token =====
                bitacorarErrorHtm(
                        empresaSesion != null ? empresaSesion.getEsquema() : null,
                        String.valueOf(folioEmpresa),
                        E012_TOKEN_NO_GENERADO,
                        "No se pudo generar token para flujo DoRegister/DoPurchase",
                        emailOrigen,
                        asunto,
                        archivoHtm
                );

                return;
            }
             
            // =========================================================
            // 3) ARMAR MODEL DoRegister
            // =========================================================
            
            
            DoRegisterModel model = new DoRegisterModel();

            String html = leerArchivoComoString(archivoHtm);
            BigDecimal cantidad = extraerCantidadUnidad(html);
            model.setCantidad(cantidad);

            EmpresasForm empresaDesde = validarEmpresaDesdeHTM(data);

            model.setRfcCliente(empresaDesde.getRfc());
            model.setRazonSocial(empresaDesde.getNombreLargo());
            model.setRfcProveedor( obtenerRfcProveedorPorRazonSocial( empresaSesion.getEsquema(), data.getPara()));
            model.setClaveProducto(data.getClasificacionCodigo());
            model.setMonto(data.getMonto());
            model.setNumeroOrden(String.valueOf(folioEmpresa));
            model.setTipoMoneda(data.getMoneda());

            logger.info("📤 Ejecutando DoRegister folio=" + folioEmpresa);

            // =========================================================
            // 4) LLAMADA DoRegister
            // =========================================================
            JSONObject respDoRegister = UtilsAPIS.doRegister(model, token);

            if (respuestaApiEsError(respDoRegister)) {
                logger.error("❌ Error DoRegister, flujo detenido. "
                        + "folio=" + folioEmpresa
                        + " resp=" + (respDoRegister != null ? respDoRegister.toString() : "null"));

                // ===== BITÁCORA DoRegister =====
                bitacorarErrorHtm(
                        empresaSesion != null ? empresaSesion.getEsquema() : null,
                        String.valueOf(folioEmpresa),
                        E009_DOREGISTER_ERROR,
                        "Error DoRegister resp=" + (respDoRegister != null ? respDoRegister.toString() : "null"),
                        emailOrigen,
                        asunto,
                        archivoHtm
                );

                return; // ⛔ PARAR TODO
            }

            if (respDoRegister == null) {
                logger.error("❌ DoRegister sin respuesta folio=" + folioEmpresa);

                // ===== BITÁCORA DoRegister sin respuesta =====
                bitacorarErrorHtm(
                        empresaSesion != null ? empresaSesion.getEsquema() : null,
                        String.valueOf(folioEmpresa),
                        E009_DOREGISTER_ERROR,
                        "DoRegister sin respuesta (null)",
                        emailOrigen,
                        asunto,
                        archivoHtm
                );

                return;
            }

            logger.info("✔ DoRegister OK folio=" + folioEmpresa
                    + " resp=" + respDoRegister.toString());

            // =========================================================
            // 5) LLAMADA DoPurchase/GenerarFactura
            // =========================================================
            ProveedoresBean provBean = new ProveedoresBean();
            ProveedoresForm provForm = provBean.obtenerProveedorPorRazonSocial(Utils.noNulo(data.getPara()), empresaSesion.getEsquema());
            
            
            JSONObject respDoPurchase =
                    UtilsAPIS.generarFacturaDoPurchase(
                    		provForm.getRfc(),
                            String.valueOf(folioEmpresa),
                            token
                    );

            if (respuestaApiEsError(respDoPurchase)) {
                logger.error("❌ Error DoPurchase/GenerarFactura, flujo detenido. "
                        + "folio=" + folioEmpresa
                        + " resp=" + (respDoPurchase != null ? respDoPurchase.toString() : "null"));

                // ===== BITÁCORA DoPurchase =====
                bitacorarErrorHtm(
                        empresaSesion != null ? empresaSesion.getEsquema() : null,
                        String.valueOf(folioEmpresa),
                        E010_DOPURCHASE_ERROR,
                        "Error DoPurchase/GenerarFactura resp=" + (respDoPurchase != null ? respDoPurchase.toString() : "null"),
                        emailOrigen,
                        asunto,
                        archivoHtm
                );

                return; // ⛔ PARAR
            }

            logger.info("✔ DoPurchase GenerarFactura OK folio=" + folioEmpresa
                    + " resp=" + (respDoPurchase != null ? respDoPurchase.toString() : "null"));

            JSONObject data1 = respDoPurchase.getJSONObject("data");

            String rutaXML = data1.optString("rutaXML");
            String rutaPDF = data1.optString("rutaPDF");
            String codeApi = data1.optString("codigoTimbrado");
            String mensajeTimbrado = data1.optString("mensajeTimbrado");
            

            // Datos fijos que mencionaste
            String lenguaje = "MX";
            int idPerfil = 4;

            cargarFacturaTimbradaAlSistema(
                    empresaSesion.getEsquema(),
                    folioEmpresa,
                    rutaXML,
                    rutaPDF,
                    lenguaje,
                    idPerfil,
                    codeApi,
                    mensajeTimbrado,
                    usuarioHTTP,
                    emailOrigen,
                    asunto,
                    archivoHtm
            );

        } catch (Exception e) {
            logger.error("❌ Error en flujo DoRegister / DoPurchase folio=" + folioEmpresa, e);

            // ===== BITÁCORA error general flujo API =====
            bitacorarErrorHtm(
                    empresaSesion != null ? empresaSesion.getEsquema() : null,
                    String.valueOf(folioEmpresa),
                    E999_ERROR_GENERAL,
                    "Error en flujo DoRegister/DoPurchase: " + e.getMessage(),
                    emailOrigen,
                    asunto,
                    archivoHtm
            );

        }
    }

    /**
     * Valida si el proveedor (por RAZON_SOCIAL) tiene habilitado
     * GENERA_FACTURA = 'S'.
     *
     * NOTA: Método preparado para futuras validaciones,
     * NO se invoca todavía en el flujo actual.
     */
    private boolean proveedorGeneraFactura(
            String esquemaEmpresa,
            String razonSocial) throws ValidacionHtmException {

        try {
            ProveedoresBean proveedoresBean = new ProveedoresBean();

            ProveedoresForm provForm = proveedoresBean.obtenerProveedorPorRazonSocial( razonSocial, esquemaEmpresa);
            boolean generaFactura = false;
            if (provForm.getClaveRegistro() > 0 && "S".equalsIgnoreCase(provForm.getGenerarFactura())) {
            	generaFactura = true;	
            }
           
            logger.info("Validación GENERA_FACTURA proveedor="
                    + razonSocial
                    + " resultado=" + generaFactura);

            return generaFactura;

        } catch (Exception e) {
            logger.error("Error validando GENERA_FACTURA proveedor: " + razonSocial, e);
            throw new ValidacionHtmException(
                    E004_PROV_NO_EXISTE,
                    "Error validando proveedor para facturación: " + razonSocial,
                    e
            );
        }
    }

    private boolean respuestaApiEsError(JSONObject resp) {

        if (resp == null) return true;

        String code = resp.optString("code", "");

        // Solo "200" es éxito
        if (!"200".equals(code)) {
            return true;
        }

        // Seguridad extra: data no debe ser null en éxito
        if (resp.isNull("data")) {
            return true;
        }

        return false;
    }

    /**
     * Carga una factura ya timbrada (XML + PDF) al sistema,
     * usando rutas devueltas por DoPurchase.
     */
    
    private void cargarFacturaTimbradaAlSistema(
            String esquemaEmpresa,
            long numeroOrden,
            String rutaXML,
            String rutaPDF,
            String lenguaje,        // "MX"
            int idPerfil,           // 4
            String codeApi,
            String mensajeTimbrado,
            String usuarioProceso,  // usuario del sistema
            String emailOrigen,
            String asunto,
            File archivoHtm
    ) {

        try {
            logger.info("📥 Iniciando carga automática de factura al sistema");
            logger.info("   esquema=" + esquemaEmpresa);
            logger.info("   orden=" + numeroOrden);
            logger.info("   rutaXML=" + rutaXML);
            logger.info("   rutaPDF=" + rutaPDF);

            // =============================
            // 1) Validar archivos
            // =============================
            //if (Utils.noNulo(rutaXML).isEmpty() || Utils.noNulo(rutaPDF).isEmpty()) {
            if (!"200".equalsIgnoreCase(codeApi)) {
                logger.error("❌ mensajeTimbrado==>"+mensajeTimbrado);

                bitacorarErrorHtm(
                        esquemaEmpresa,
                        String.valueOf(numeroOrden),
                        E011_CARGA_FACTURA_ERROR,
                        mensajeTimbrado,
                        emailOrigen,
                        asunto,
                        archivoHtm
                );

                return;
            }

            File fileXML = new File(rutaXML);
            File filePDF = new File(rutaPDF);
            
            

            if (!fileXML.exists()) {
                logger.error("❌ XML no existe: " + rutaXML);

                bitacorarErrorHtm(
                        esquemaEmpresa,
                        String.valueOf(numeroOrden),
                        E011_CARGA_FACTURA_ERROR,
                        "XML no existe: " + rutaXML,
                        emailOrigen,
                        asunto,
                        archivoHtm
                );

                return;
            }

            if (!filePDF.exists()) {
                logger.error("❌ PDF no existe: " + rutaPDF);

                bitacorarErrorHtm(
                        esquemaEmpresa,
                        String.valueOf(numeroOrden),
                        E011_CARGA_FACTURA_ERROR,
                        "PDF no existe: " + rutaPDF,
                        emailOrigen,
                        asunto,
                        archivoHtm
                );

                return;
            }
            String rutaXmlDestino= UtilsPATH.RUTA_PUBLIC_HTML + esquemaEmpresa + File.separator + "TEMP_PDF" + File.separator + fileXML.getName();
            String rutapdfDestino= UtilsPATH.RUTA_PUBLIC_HTML + esquemaEmpresa + File.separator + "TEMP_PDF" + File.separator + filePDF.getName();

            
            

			File fileDestXML = new File(rutaXmlDestino);
			File fileDestPDF = new File(rutapdfDestino);
			
			UtilsFile.moveFileDirectory(fileXML,fileDestXML, true, false, true,false);
			UtilsFile.moveFileDirectory(filePDF,fileDestPDF, true, false, true,false);
            

            // =============================
            // 2) Ejecutar validación/carga
            // =============================
            ValidacionesFactura valFacturaBean = new ValidacionesFactura();

            String[] resultado = valFacturaBean.iniciarProceso(
                    esquemaEmpresa,
                    numeroOrden,
                    fileDestXML,
                    fileDestPDF,
                    lenguaje,
                    idPerfil,
                    usuarioProceso
            );

            // =============================
            // 3) Resultado
            // =============================
            if (resultado != null && resultado.length >= 3) {
                if ("ERROR".equalsIgnoreCase(resultado[2])) {
                    logger.error("❌ Error al cargar factura: " + resultado[0]);

                    bitacorarErrorHtm(
                            esquemaEmpresa,
                            String.valueOf(numeroOrden),
                            E011_CARGA_FACTURA_ERROR,
                            "Error al cargar factura: " + resultado[0],
                            emailOrigen,
                            asunto,
                            archivoHtm
                    );

                } else {
                    logger.info("✅ Factura cargada correctamente: " + resultado[0]);
                }
            } else {
                logger.warn("⚠ Resultado inesperado al cargar factura");

                bitacorarErrorHtm(
                        esquemaEmpresa,
                        String.valueOf(numeroOrden),
                        E011_CARGA_FACTURA_ERROR,
                        "Resultado inesperado al cargar factura (null o length<3)",
                        emailOrigen,
                        asunto,
                        archivoHtm
                );
            }

        } catch (Exception e) {
            logger.error("❌ Error cargando factura timbrada al sistema", e);

            bitacorarErrorHtm(
                    esquemaEmpresa,
                    String.valueOf(numeroOrden),
                    E011_CARGA_FACTURA_ERROR,
                    "Excepción cargando factura timbrada: " + e.getMessage(),
                    emailOrigen,
                    asunto,
                    archivoHtm
            );
        }
    }
}
