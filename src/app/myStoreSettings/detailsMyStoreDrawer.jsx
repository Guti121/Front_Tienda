import DetailsMyStore from "../../components/settingsStore/detailStore/detailsMyStore";
import { useUserCAAuthRedirect } from "../../redux/viewsPermissions";


export default function DetailsMyStoreDrawer (){
    useUserCAAuthRedirect()
    return(<DetailsMyStore/>)
}