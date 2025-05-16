import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { iconCheckBox } from "../../components/icons/icons";
import { useEffect, useState } from "react";
import theme, { width } from "../../components/themeStyles/theme";
import { expiredGetToken } from "../../components/axios/generalAxiosRequest";
import { deleteTokenStorage } from "../../components/token/token";
import { handleGenerateQrCode } from "../../components/settingsStore/axiosRequest";


export default function ModalGenerateQrCodeAddUserCompany() {
    const [checkBox, setCheckBox] = useState(false);
    const [error, setError] = useState(false);
    const [errorRequest, setErrorRequest] = useState(false);
    const [email, setEmail] = useState(null);
    const [typeUser, setTypeUser] = useState(1);
    const [qrCode, setQrCode] = useState(false);

    useEffect(() => {
        if (qrCode) {
            setEmail(null)
            setError(false)
            setTypeUser(1)
            setCheckBox(false)
        }
    }, [qrCode]);

    const handleRequest = async () => {
        try {
            const token = await expiredGetToken();
            if (!token) {
                deleteTokenStorage();
                return;
            }
            let request = await handleGenerateQrCode(token, email, typeUser);
            console.log(request.data)
            setQrCode(request.data.qr_base64);
            console.log(qrCode)
        } catch (error) {
            setErrorRequest(error.message);
        }
    };

    const validateEmail = (text) => {
        setEmail(text);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setError(emailRegex.test(text) ? "" : "Correo inválido. Debe contener una '@' y al menos un '.'");
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={{flex:1}}>

            <View style={styles.container}>
                <View style={styles.viewContainerInfo}>
                    <Text style={styles.title}>Datos del Aliado</Text>
                    <Text style={styles.description}>
                        Asegúrate de ingresar los datos correctamente para evitar otorgar permisos no deseados al nuevo aliado.
                    </Text>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Correo Electrónico del Aliado</Text>
                    <TextInput
                        value={email}
                        style={styles.textInput}
                        placeholder="Correo electrónico"
                        placeholderTextColor="#888"
                        onChangeText={(text) => validateEmail(text.toLowerCase())}
                        autoCapitalize='none'
                        keyboardType="email-address"
                        autoCorrect={false}
                    />
                    {error && <Text style={styles.errorText}>{error}</Text>}
                </View>

                <View style={styles.roleContainer}>
                    <Text style={styles.label}>Asígnale un rol</Text>
                    <Pressable 
                        style={[styles.pressableSet, !checkBox && styles.selected]} 
                        onPress={() => { setCheckBox(false); setTypeUser(1); }}
                    >
                        <Text style={!checkBox ? styles.selectedText : styles.unselectedText}>Cajero</Text>
                        {!checkBox && iconCheckBox({ size: 20, color: "rgb(60, 196, 60)" })}
                    </Pressable>

                    <Pressable 
                        style={[styles.pressableSet, checkBox && styles.selected]} 
                        onPress={() => { setCheckBox(true); setTypeUser(2); }}
                    >
                        <Text style={checkBox ? styles.selectedText : styles.unselectedText}>Administrador</Text>
                        {checkBox && iconCheckBox({ size: 20, color: "rgb(60, 196, 60)" })}
                    </Pressable>
                </View>

                <Pressable 
                    disabled={!!error || !email} 
                    style={[styles.generateButton, (error || !email) && styles.buttonDisabled]}
                    onPress={handleRequest}
                >
                    <Text style={styles.generateButtonText}>Generar</Text>
                </Pressable>

                {qrCode !==false && (
                    <View style={styles.qrContainer}>
                        <Image 
                            source={{ uri: `data:image/png;base64,${qrCode}` }} 
                            style={styles.qrImage} 
                            resizeMode="contain"
                        />
                    </View>
                )}
            </View>
                </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.backgroundColorPrincipal.backgroundColor,
    },
    container: {
        flex: 1,
        margin: 10,
        padding: 15,
        alignItems: "center",
    },
    viewContainerInfo: {
        alignItems: "center",
        padding: 15,
        borderRadius: 15,
        backgroundColor: theme.pressableColor.backgroundColor,
        marginBottom: 20,
        width: "100%",
    },
    title: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    description: {
        color: "white",
        textAlign: "center",
        marginTop: 5,
    },
    inputContainer: {
        width: "100%",
        marginBottom: 20,
    },
    label: {
        color: "black",
        fontSize: 16,
        marginBottom: 5,
        fontWeight: "500",
    },
    textInput: {
        ...theme.textInputGlobal,
        width: width * 0.9,
        borderColor: "#ccc",
    },
    errorText: {
        color: "red",
        fontSize: 14,
        marginTop: 5,
    },
    roleContainer: {
        width: "100%",
    },
    pressableSet: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginTop: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "#f9f9f9",
    },
    selected: {
        backgroundColor: "rgba(60, 196, 60, 0.2)",
        borderColor: "rgb(60, 196, 60)",
    },
    selectedText: {
        color: "rgb(60, 196, 60)",
        fontWeight: "bold",
    },
    unselectedText: {
        color: "black",
    },
    generateButton: {
        marginTop: 20,
        backgroundColor: theme.pressableColor.backgroundColor,
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 10,
        alignItems: "center",
    },
    buttonDisabled: {
        backgroundColor: "#ccc",
    },
    generateButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    qrContainer: {
        padding:30,
        
        marginTop: 20,
        alignItems: "center",
    },
    qrImage: {
        width:300,
        height: 300,
    },
});
