import {
  baseUrl,
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from "../axios/generalAxiosRequest";

//request price suggested
export const handleSuggestedRetailPrice = async (price, token) => {
  let url = `${baseUrl}config/calculo/`;
  let data = { valor_mayor: parseInt(price) };

  try {
    const request = await postRequest(url, data, token);
    console.log("estoy en suggested");
    return request;
  } catch (error) {
    console.log("error desde handle", error);
    throw error;
  }
};

//----------------------------------- TIPO PRODUCTO----------------------------------------

//list typeProduct not filter
export const handleTypeProduct = async (token, page = 1) => {
  let url = `${baseUrl}listType/?page=${page}`;
  console.log(token, "this is mi token");
  try {
    const request = await getRequest(url, token);
    console.log("respuesta de getType", request);
    return request;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

//list typeProduct filter
export const handleTypeProductFilter = async (value = "", token, page = 1) => {
  let url = `${baseUrl}typeProductFilter/?page=${page}`;
  // Agregar 'q' si se proporciona un valor
  if (value) {
    url += `&q=${encodeURIComponent(value)}`;
  }
  try {
    console.log("eeste es el token ", token);
    const request = await getRequest(url, token);
    console.log("respuesta de getType", request.data);
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
  console.log(url, data, token);
  try {
    const request = await postRequest(url, data, token);
    console.log(request);
    return request;
  } catch (error) {
    console.log("error:", error);
  }
}
//-----------------------------------PRODUCTO----------------------------------------
//Retrieve Product
export const handleRetrieveProduct = async (id = 0, token) => {
  let url = `${baseUrl}productDetail/${id}/`;
  try {
    const request = await getRequest(url, token);
    console.log(request);
    return request;
  } catch (error) {
    throw error;
  }
};
// create product
export const handleCreateProduct = async (token, date) => {
  let url = `${baseUrl}create/`;
  let data = date;
  try {
    const request = await postRequest(url, data, token);
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
  page = 1,
  filter = ""
) {
  // Construir la URL con parámetros condicionales
  let url = `${baseUrl}product/?page=${page}`;

  // Agregar 'q' si se proporciona un valor
  if (value) {
    url += `&q=${encodeURIComponent(value)}`;
  }

  // Agregar 'orden' si se proporciona un valor
  if (filter) {
    url += `&filter=${encodeURIComponent(filter)}`;
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
