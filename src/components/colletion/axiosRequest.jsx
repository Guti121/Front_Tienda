import {
  baseUrl,
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
  postRequestFormData,
} from "../axios/generalAxiosRequest";

//request price suggested
export const handleSuggestedRetailPrice = async (price, token, margen = 0) => {
  const url = `${baseUrl}config/calculo/`;
  const data = {
    valor_mayor: parseInt(price),
    ...(margen != 0 && { margen })
  };

  try {
    const request = await postRequest(url, data, token);
    return request;
  } catch (error) {
    throw error;
  }
};


//----------------------------------- TIPO PRODUCTO----------------------------------------

//list typeProduct not filter
export const handleTypeProduct = async (token, urlPage = null) => {
  let url = urlPage?? `${baseUrl}listType/`;
  try {
    const request = await getRequest(url, token);
    return request;
  } catch (error) {
    throw new Error(error);
  }
};


//list typeProduct filter
export const handleTypeProductFilter = async ({ url = null, token, value = "" }) => {
  let finaleUrl = url ?? `${baseUrl}typeProductFilter/`;
  if (value) {
    finaleUrl += finaleUrl.includes('?') 
      ? `&q=${encodeURIComponent(value)}` 
      : `?q=${encodeURIComponent(value)}`;
  }

  try {
    const request = await getRequest(finaleUrl, token);
    return request.data;
  } catch (error) {
    throw error;
  }
};

export async function handleCreateTypeProduct({ token, nameTypeProduct }) {
  let url = `${baseUrl}createtype/`;
  let data = {
    tipo_producto: nameTypeProduct,
  };
  try {
    const request = await postRequest(url, data, token);
    return request;
  } catch (error) {
    throw error;
  }
}

export async function handleDeleteTypeProduct(token,id){
  let url=`${baseUrl}destroytypeProduct/${id}/`
  try{
    const request = await deleteRequest(url,token)
  }catch(error){
  }
}
//-----------------------------------PRODUCTO----------------------------------------
//Retrieve Product
export const handleRetrieveProduct = async (id = 0, token) => {
  let url = `${baseUrl}productDetail/${id}/`;
  try {
    const request = await getRequest(url, token);
    return request;
  } catch (error) {
    throw error;
  }
};

//barCodeProduct
export const handleBarCode = async (id,token )=>{
  let url=`${baseUrl}facturas/api/barcode/${id}/`
  try {
    const request = await getRequest(url, token);
    return request.data;
  } catch (error) {
    throw error;
  }
}
// create product
export const handleCreateProduct = async (token, formData) => {
  let url = `${baseUrl}create/`;
  try {
    const request = await postRequestFormData(url, formData, token);
    return request;
  } catch (error) {
    throw error;
  }
};

//ListProduct

export const handleListProduct = async (token) => {
  let url = `${baseUrl}list/`;
  try {
    const request = getRequest(url, token);
    return request;
  } catch (error) {
    throw error;
  }
};

// Se realiza el llamado a la funcion get para obtener la lista de objetos filtrados
export async function handleListProductFilterAdmin(
  value = "",
  token,
  page = null,
  filter = ""
) {
  // Construir la URL con parámetros condicionales
  let url = page || `${baseUrl}product/?page=1`;

  // Agregar 'q' si se proporciona un valor
  if (value) {
    url += `&q=${encodeURIComponent(value)}`;
  }

  // Agregar 'orden' si se proporciona un valor
  if (filter) {
    url += `&order=${encodeURIComponent(filter)}`;
  }

  try {
    let request = await getRequest(url, token);
    return request.data;
  } catch (error) {
    throw error;
  }
}

//delete Product
export async function handleDeleteProduct({ id, token }) {
  let url = `${baseUrl}destroyproduct/${id}/`;

  try {
    let request = await deleteRequest(url, token);
    return request;
  } catch (error) {
    throw error;
  }
}

//update units product
export async function handleUpdateUnitsProduct(token, id, date) {
  let url = `${baseUrl}updateProduct/${id}/`;
  let data = { unidades_disponibles: date };
  try {
    let request = await patchRequest(url, data, token);
    return request;
  } catch (error) {
    throw error;
  }
}

export const handlePatchProduct = async (id, data, token) => {
  try{
    const response = await patchRequest(`${baseUrl}updateProduct/${id}/`,data,token);
    return response
  }catch(error){
    console.error("Error al actualizar el producto:", error);
    if (error.response) {
          const status = error.response.status;
          const data = error.response.data;

          // Si el error es un objeto, lo convertimos a string
          const readableError = typeof data === 'object' ? JSON.stringify(data) : data;

          throw new Error(`Error ${status}: ${readableError}`);
        } else {
          throw new Error('Error desconocido en la solicitud PATCH');
        }
      }
};