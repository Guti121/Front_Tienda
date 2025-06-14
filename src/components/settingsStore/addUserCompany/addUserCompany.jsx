import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View, ActivityIndicator } from "react-native";
import theme, { width } from "../../themeStyles/theme";
import { checkIcon, iconAddUser, iconDelete } from "../../icons/icons";
import { router } from "expo-router";
import { handleDeleteUserCompany, handleListUsersCompany } from "../axiosRequest";
import { useEffect, useState } from "react";
import { expiredGetToken } from "../../axios/generalAxiosRequest";
import { deleteTokenStorage, expiredTimeToken } from "../../token/token";
import { ModalConfirm } from "../../icons/modalConfirm";
import { BarNotification } from "../../icons/barNotification";

export default function AddUserCompany() {
    const [users, setUsers] = useState([]);
    const [nextPage, setNextPage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modalConfirmDelete,setModalConfirmDelete] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    //bar notification hook
    const [notification,setNotification] = useState(false)
    const redirectModalQr = () => {
        router.push("/modals/modalGenerateQrCodeAddUserCompany");
    };

    useEffect(() => {
        setUsers([])
        setNextPage(null)
        setLoading(false)
        fetchUsers();
    }, []);

    const fetchUsers = async (url = null) => {
        try {
            setLoading(true);
            const token = await expiredGetToken();
            if (!token) {
                deleteTokenStorage();
                return;
            }

            const response = await handleListUsersCompany(token, url);
            const newUsers = response.data.results;

            setUsers(prev => [...prev, ...newUsers]);
            setNextPage(response.data.next);

        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser= async (id)=>{
        try{
            const token = await expiredGetToken();
            if (!token){
                deleteTokenStorage();
                return;
            }
            const response = await handleDeleteUserCompany(token,id)
            setNotificationFunction()
            // Reset and reload users
            setUsers([]);
            setNextPage(null);
            fetchUsers(); // Refresh list

        }catch(error){
            console.error("that's my mistake",error)
        }
    }

    const setNotificationFunction = () => {
        setNotification(true);
        setTimeout(() => {
          setNotification(false);
        }, 1500);
      };

    const renderItem = ({ item }) => (
        <View style={styles.item}>
            <View style={{flex:1}}>

            <Text style={{ fontWeight: "bold" }}>{item.name} {item.last_name}</Text>
            <Text>{item.email}</Text>
            <Text style={[item.tipo_usuario === 'admin' && {color:'blue'}]}>{item.tipo_usuario === "worker" ? 'Cajero':'Administrador'}</Text>
            <Text>{item.company}</Text>
            </View>
            <Pressable onPressOut={()=>{ 
                setSelectedUserId(item.id);
                setModalConfirmDelete(true);
                }} style={{width:'auto',height:'auto'}}>
                    {iconDelete()}
            </Pressable>
        </View>
    );

    const handleEndReached = () => {
        if (nextPage && !loading) {
            fetchUsers(nextPage);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.backgroundColorPrincipal.backgroundColor }}>
            {notification && (
                    <BarNotification
                      icon={checkIcon()}
                      message={"Aliado eliminado con exito !"}
                    />
                  )}
            <View style={{ flex: 1, margin: 10, padding: 10, borderRadius: 20 }}>
                <View style={{ height: 'auto', paddingVertical: 10 }}>
                    <Text style={{ ...theme.textTitle }}>Mis usuarios Aliados</Text>
                    <Text>En esta vista podrás añadir un usuario a tu compañía con el rol que necesites, también podrás ver los usuarios vinculados.</Text>
                </View>

                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', paddingVertical: 10, alignItems: 'center', justifyContent: 'flex-start' }}>
                        <TextInput
                            placeholder="Buscar Aliado"
                            style={styles.textInput}
                        />
                        <Pressable onPressOut={() => redirectModalQr()} style={{ marginHorizontal: 10 }}>
                            {iconAddUser({ size: 24 })}
                        </Pressable>
                    </View>

                    <FlatList
                        data={users}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        onEndReached={handleEndReached}
                        onEndReachedThreshold={0.9}
                        ListFooterComponent={
                            loading ? <ActivityIndicator size="large" color="#0000ff" style={{ marginVertical: 20 }} /> : null
                        }
                    />
                </View>
            </View>
            {modalConfirmDelete && (
                <ModalConfirm
                  state={modalConfirmDelete}
                  message={'Deseas eliminar este aliado de tu tienda?'}
                  handleIPositiveButton={() => {
                    handleDeleteUser(selectedUserId);
                    setModalConfirmDelete(false);
                  }}
                  onClose={() => setModalConfirmDelete(false)}
                />
              )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    textInput: {
        ...theme.textInputGlobal,
        height: 40,
        maxWidth: width * 0.8,
        minWidth: width * 0.6,
        padding: 5,
        textTransform: "capitalize",
    },
    item: {
        flexDirection:'row',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
});
