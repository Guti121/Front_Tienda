import { baseUrl, getRequest, postRequest } from "../axios/generalAxiosRequest"



export const handleDailyStockTaking = async ({ token, month = null, year = null, nextPage = null }) => {
  try {
    let url = nextPage || `${baseUrl}inventario/`;

    // Si no es paginación, agregamos los filtros por mes y año
    if (!nextPage && month && year) {
      url += `?month=${month}&year=${year}`;
    }

    const response = await getRequest(url, token);
    return response;
  } catch (error) {
    console.error("Error al obtener el inventario diario:", error);
    throw error;
  }
};


export const handleDailyStockTakingMonth =  async ({ token, month=null, year=null })=> {
  let url = `${baseUrl}inventario/resumen/`;
    if (month && year) {
        url += `?month=${month}&year=${year}`;
    }
    try {
        const request = await getRequest(url, token);
        return request;
    }catch (error) {
        throw error;
    }
}

export const handleRequestStookProducts = async(token)=>{
  let url=`${baseUrl}inventario/productos/`
  
  try{
    const request = await postRequest(url,undefined,token);
    return request;
  }catch(error){
    throw error;
  }
}