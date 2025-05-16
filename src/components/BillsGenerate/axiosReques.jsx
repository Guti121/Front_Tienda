import { baseUrl, deleteRequest, getRequest } from "../axios/generalAxiosRequest";

export const handleFilterBillsRequest = async ({
  token,
  selectedData,
  number,
}) => {
  let url = `${baseUrl}facturas/`; // URL por defecto

  if (selectedData) {
    url += `?date=${selectedData}`; // Filtra por fecha
  } else if (
    number !== undefined &&
    number !== null &&
    !isNaN(Number(number))
  ) {
    url += `${Number(number)}/`; // Convierte y agrega el número
  } else {
    return { data: [] }; // En lugar de lanzar un error, devuelve una lista vacía
  }

  try {
    const request = await getRequest(url, token);
    return request;
  } catch (error) {
    throw error;
  }
};

export async function handleDeleteBill(token,id){
  const url=`${baseUrl}facturas/destroy/${id}/`
  try{
      let request = deleteRequest(url,token)
      return request 
    }catch(error){
      throw error;
    }
}


