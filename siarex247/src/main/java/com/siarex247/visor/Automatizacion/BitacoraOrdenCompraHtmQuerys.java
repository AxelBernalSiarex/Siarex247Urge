package com.siarex247.visor.Automatizacion;

public class BitacoraOrdenCompraHtmQuerys {

    public static String INSERT_BITACORA (String esquema) {
        return "insert into  " + esquema + ".BITACORA_ORDEN_COMPRA_HTM ("
             + "NUM_ORDEN, COD_ERROR, DESC_ERROR, EMAIL_ORIGEN, ASUNTO, ARCHIVO_HTM"
             + ") values (?,?,?,?,?,?)";
    }
}
