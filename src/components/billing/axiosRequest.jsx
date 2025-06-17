import { baseUrl, postRequest, postRequestFormData } from "../axios/generalAxiosRequest";
import { getRequest } from "../axios/generalAxiosRequest";

// Se realiza el llamado a la funcion get para obtener la lista de objetos filtrados
export async function handleListProductFilter(value, token) {
  const url = `${baseUrl}listfilter/?q=${value}`;

  try {
    let request = await getRequest(url, token);
    console.log(request)
    return request.data;
  } catch {
    return null;
  }
}

export async function filterCodeBar(date, token) {
  const url = `${baseUrl}facturas/codigo_de_barras_text/`;
  const data = {
    codigoBarras: date,
  };
  try {
    const request = await postRequest(url, data, token);
    return request.data;
  } catch (error) {
    return false;
  }
}

export async function filterCodeBarWeb(date,token){
  const url=`${baseUrl}facturas/codigo_de_barras/`; 
  try{
    const request = await postRequestFormData(url,date,token)
    console.log(request.data.producto)
    return request.data
  }
  catch{
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
    return request;
  } catch (error) {
    throw error.response.data.error;
  }
}
