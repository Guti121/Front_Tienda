import { baseUrl, postRequest } from "../axios/generalAxiosRequest";
import { getRequest } from "../axios/generalAxiosRequest";

// Se realiza el llamado a la funcion get para obtener la lista de objetos filtrados
export async function handleListProductFilter(value, token) {
  const url = `${baseUrl}listfilter/?q=${value}`;

  try {
    let request = await getRequest(url, token);
    return request.data;
  } catch {
    return null;
  }
}

export async function filterCodeBar(date, token) {
  console.log(date);
  const url = `${baseUrl}facturas/codigo_de_barras_text/`;
  const data = {
    codigoBarras: date,
  };
  try {
    const request = await postRequest(url, data, token);
    return request.data;
  } catch (error) {
    console.log(error, "este es mi error");
    return false;
  }
}

export async function handleInvoice(date, token) {
  const url = `${baseUrl}facturas/create/`;
  const data = {
    detalles: date,
  };
  try {
    const request = await postRequest(url, data, token);
    console.log(data);
    console.log("exito en la factuarcion", request);
    return request;
  } catch (error) {
    console.log("error desde query facturacion", error.response.data.error);
    throw error.response.data.error;
  }
}
