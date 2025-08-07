import { useEffect, useState } from "react";
import { ActivityIndicator, Button, FlatList, Pressable, SafeAreaView, Text, View } from "react-native";
import { handleDailyStockTaking, handleDailyStockTakingMonth } from "./axiosRequest";
import theme from "../themeStyles/theme";
import { expiredGetToken } from "../axios/generalAxiosRequest";
import { deleteTokenStorage } from "../token/token";
import { ModalCalendar, ModalCalendarMonth, MonthPickerModal } from "../themeStyles/modalsCalendar";
import { iconCalendar } from "../icons/icons";
import { formatToCOP, pesosFormat } from "../icons/functionFormat";
import { showSessionAlert } from "../themeStyles/alerts";


export default function DailyStockTaking() {
    const [data, setData] = useState([]);
    const [nextPage,setNextPage] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [selectedData, setSelectedData] = useState(null); 
    const [modalVisible, setModalVisible] = useState(false);
    const [resumeMonth,setResumeMonth] = useState(null)



    const handleRequest = async () => {
        try {
            const token = await expiredGetToken();
            if (!token) {
            deleteTokenStorage();
            router.replace("/login");
            return;
            }

            const year = selectedData ? selectedData.year : new Date().getFullYear();
            const month = selectedData ? selectedData.month : new Date().getMonth() +1
            const request = await handleDailyStockTaking({
            token,
            month,
            year,
            nextPage,
            });

            const newResults = request.data.results;
            if (nextPage) {
            setData((prevData) => [...prevData, ...newResults]);
            } else {
            setData(newResults);
            }
            setNextPage(request.data.next);

            const requestMonth = await handleDailyStockTakingMonth({
                token,month, year});
                console.log(requestMonth)
            setResumeMonth(requestMonth.data.resumen)

        } catch (error) {
            showSessionAlert('Error','Error al obtener datos de stock')
        }
    };


    const handleClose = (data) => {
        setModalVisible(false);

        if (data) {
        setSelectedData(data);
        setNextPage(null);
        }
      
    };


    const handleLoadMore = async () => {

        if (nextPage && !loadingMore) {
            setLoadingMore(true);
            await handleRequest();
            setLoadingMore(false);
        }
        };

    useEffect(() => {
        handleRequest();
    }, [selectedData]);

    return(
        <SafeAreaView style={{flex:1,...theme.backgroundColorPrincipal}}>
            <View style={{flex: 1,margin:20, ...theme.backgroundColorPrincipal}}>
                <View style={{backgroundColor:theme.colors.backgroundColorWarning, padding:20, borderRadius:10, borderColor:theme.colors.primary, ...theme.shadow, borderWidth:1}}>
                    <Text style={{color:theme.colors.textPrimary, fontSize:18, fontWeight:'bold'}}>
                        Inventario Diario   
                    </Text>
                    <Text style={{color:theme.colors.textSecundary, marginTop:10}}>
                        Esta sección te permite revisar la facturacion diaria de tu tienda y el inventario de productos vendidos.
                    </Text>
                    {selectedData && (
                        <Text style={{...theme.textTitle,color:theme.colors.textPrimary, marginTop: 20 }}>
                         {selectedData.month}/{selectedData.year}
                        </Text>
                    )}
                </View>
                <Pressable
                        onPressOut={() => setModalVisible(true)}
                        style={{
                            marginTop: 20,
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 10,
                            backgroundColor: theme.colors.primary,
                            borderRadius: 8,
                        }}
                      >
                        {iconCalendar({ size: 30, color: "white" })}
                </Pressable>
            <View style={{flex:1,marginTop:20}}>
            
            <FlatList
                data={data}
                keyExtractor={(item) => item.fecha}
                ListEmptyComponent={<Text style={{color:theme.colors.primary, textAlign:'center', marginTop:20}}>No hay datos disponibles</Text>}
                ListHeaderComponent={() => (
                        <View
                            style={{
                            marginBottom: 10,
                            padding: 16,
                            backgroundColor: theme.colors.backgroundColorWarning,
                            borderRadius: 10,
                            borderColor: theme.colors.primary,
                            ...theme.shadow,
                            }}
                        >
                            <Text
                            style={{
                                color: theme.colors.textPrimary,
                                fontSize: 18,
                                fontWeight: "bold",
                                marginBottom: 10,
                            }}
                            >
                            Resumen de facturación mensual
                            </Text>

                            <View style={{ gap: 6 }}>
                            <Text style={{ color: theme.colors.textSecundary }}>
                                • Total Productos vendidos en el mes: {resumeMonth?.productos_vendidos ?? "-"}
                            </Text>
                            <Text style={{ color: theme.colors.textSecundary }}>
                                • Valor Total de ventas en el mes : {pesosFormat(resumeMonth?.total_ventas) ?? "-"}
                            </Text>
                            <Text style={{ color: theme.colors.textSecundary }}>
                                • Valor Total al por mayor: {pesosFormat(resumeMonth?.valor_al_por_mayor) ?? "-"}
                            </Text>
                            <Text style={{ color: theme.colors.textSecundary }}>
                                Segun el resumen mensual de {selectedData ? `${selectedData.month}/${selectedData.year}` : 'este mes,'} los costos fijos cubiertos son de {pesosFormat(resumeMonth?.costos_fijos_cubiertos)}, las ganancias netas fueron de {pesosFormat(resumeMonth?.total_ventas-resumeMonth?.valor_al_por_mayor-resumeMonth?.costos_fijos_cubiertos) }
                            </Text>
                            </View>
                        </View>
                )}

            
                renderItem={({ item }) => (
                    <View
                    style={{
                        backgroundColor: "#fff",
                        padding: 16,
                        borderRadius: 12,
                        marginBottom: 12,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                    }}
                    >
                    <Text style={{ fontSize: 16, fontWeight: "bold", color: theme.colors.primary, marginBottom: 12 }}>
                        Fecha: {item.fecha}
                    </Text>

                    <Text style={{ fontWeight: "600", color: theme.colors.backgroundColor }}>Total facturas:</Text>
                    <Text style={{ marginBottom: 8, color: theme.colors.textTerciary }}>{item.facturas_total}</Text>

                    <Text style={{ fontWeight: "600", color: theme.colors.backgroundColor }}>Productos vendidos:</Text>
                    <Text style={{ marginBottom: 8, color: theme.colors.textTerciary }}>{item.productos_vendidos}</Text>

                    <Text style={{ fontWeight: "600", color: theme.colors.backgroundColor }}>Subtotal del día:</Text>
                    <Text style={{ color: theme.colors.textTerciary }}>{pesosFormat(item.total_subtotal)}</Text>
                    </View>
                )}

                ListFooterComponent={() => loadingMore && (
                    <ActivityIndicator size="large" color="#5e5ce6" style={{ marginVertical: 20 }} />
                            )}
                 // Detecta el final del scroll
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
            />
            </View>
            </View>

            <MonthPickerModal visible={modalVisible} onClose={handleClose} />
        </SafeAreaView>
    )
}