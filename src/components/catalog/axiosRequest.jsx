import axios from "axios";
import { baseUrl } from "../axios/generalAxiosRequest";

// Function to request the catalog by name
export const catalogRequest = async (name,tipoId = null,nextPage=null) => {
    let url= `${baseUrl}catalogo/list/${name}?fecha=desc`;
    if (tipoId) {
        url += `&tipo=${tipoId}`;
    }else if (nextPage) {
        url = nextPage;
    }
    try {
        const response = await axios.get(url);
        return response;
    } catch (error) {
        throw error; 
    }
}


// Function to request company information by name
export const companyInfoRequest = async (name) => {
    const url = `${baseUrl}catalogo/company/${name}`;
    try {
        const response = await axios.get(url);
        return response;
    } catch (error) {
        throw error; 
    }
}

export const typeProductRequest = async (name,nextPageType=null) => {
    let url = `${baseUrl}catalogo/tipo-producto/${name}`;
    if (nextPageType) {
        url = nextPageType;
    }
    try {
        const response = await axios.get(url);
        return response;
    } catch (error) {
        throw error; 
    }
}

export const productDetailRequest = async (name, id) => {
    const url = `${baseUrl}catalogo/product/${name}/${id}`;
    try {
        const response = await axios.get(url);
        return response;
    } catch (error) {
        throw error; 
    }
}