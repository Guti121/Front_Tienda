import { baseUrl, deleteRequest, getRequest, patchRequest, postRequest } from "../axios/generalAxiosRequest"


// Se requaliza esta funcion con el fin de consultar los detalles de la compañia a la que petenece el usuario
export async  function handleListDetailStore (token){
    const url=`${baseUrl}store/retrieveCompany/`

    try{
        let request = await getRequest(url,token)
        return request 
    }
    catch (error) {
    console.error("Error en la solicitud:", error);
}
}


export async function handleUpdateStore(token,updateFields){
    const url=`${baseUrl}store/updateCompany/`
    try{
        let request= await patchRequest(url,updateFields,token)
        return request
    }catch (error){
        throw error
    }
}

export async function handleDeleteCompany(token){
    const url=`${baseUrl}store/destroyCompany/`
    try{
        let request=await deleteRequest(url,token)
        return request
    }
    catch (error){
        throw error
    }
}

// Costs Store request -----------------------------------------------------------------------

export async function handleCostsStore(token){
    const url= `${baseUrl}config/retrive/`
    try{
        let request = await getRequest(url,token)
        return request
    }
    catch (error){
        throw error
    }
}

export async function handleCreateCostsStore(token,data) {
    const url=`${baseUrl}config/`
    try{
        let request= await postRequest(url,data,token)
        return request
    }catch(error){
        throw error
    }
}


export async function handleDeleteCostsStore(token){
    const url=`${baseUrl}config/destroy/`
    try{
        let request = await deleteRequest(url,token)
        return request
    }catch(error)
    {
        throw error
    }
}

// View Users addUsersCompamy--------------------------------------------------------------------


//Generate Qr code
export async function handleGenerateQrCode(token,email,typeUser) {
    const url=`${baseUrl}store/generar_qr/`
    const data={
        email:email,
        type_user:typeUser
    }
    try{
        let request = await postRequest(url,data,token)
        return request
    }catch(error){
       throw error
    }
    
}   

// Read Qr
export async function handleReadQrCode(token,tokenQr){
    const url =`${baseUrl}store/validar_qr/?token=${tokenQr}`
   

    try{
        let request = await getRequest(url,token)
        return request
    }catch(error){
        throw error
    }
}

//List User Comapany 

export async function handleListUsersCompany(token,url= null){
    const finalUrl = url ?? `${baseUrl}base/listUsersCompany/`;

    try {
        let request = await getRequest(finalUrl,token)
        return request 
    }catch(error){
        throw error
    }
}

//DeleteUserCompany 

export async function handleDeleteUserCompany(token,id){
    const url= `${baseUrl}base/DestroyUsersCompany/${id}/`
    const data={data:null}
    try{
        let request = await patchRequest(url,data,token)
        return request 
    }catch(error){
        throw error
    }
}