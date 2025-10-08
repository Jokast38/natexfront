import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import {Formik} from "formik";
import React, {useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "@/src/redux/store"
import {login} from "@/src/redux/actions/authActions";
import {LoginSchema} from "@/src/schemas/loginSchema";
import {useResetRouter} from "@/src/hooks/useResetRouter";
import CustomInput from "@/src/components/CustomInput";
import {spacing} from "@/src/theme/spacing";
// import {KeyboardStickyView} from "react-native-keyboard-controller";
import {Link, router} from "expo-router";
import {useSafeAreaInsets, SafeAreaView} from "react-native-safe-area-context";
import {typography} from "@/src/theme/typography";
import {colors} from "@/src/theme/color";

interface Values {
    email: string;
    password: string;
}

export default function LoginScreen() {
    const {loading} = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const {resetTo} = useResetRouter();
    const [registerError, setRegisterError] = useState('');

    const insets = useSafeAreaInsets()

    const offset = {closed: insets.bottom ? -10 : -20, opened: insets.bottom ? 20 : -20};

    const initialValues: Values = {
        email: '',
        password: '',
    }

    const handleSubmit = async (values: Values) => {
        try {
            await dispatch(login(values)).unwrap()
            resetTo('/home')
        } catch (error) {
            setRegisterError(error as string);
        }
    }

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>
            <SafeAreaView style={{flex: 1}}>
                <View style={styles.container}>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={LoginSchema}
                        onSubmit={handleSubmit}
                    >
                        {({handleChange, handleBlur, handleSubmit, values}) => (
                            <View style={{flex: 1, justifyContent: "space-between"}}>
                                <View style={styles.inputsContainer}>
                                    <Text style={styles.title}>Bienvenue!</Text>
                                    <Text style={{fontFamily: typography.fontFamily.bold}}>Connectez-vous à votre compte</Text>
                                    <CustomInput
                                        onChangeText={handleChange('email')}
                                        value={values.email}
                                        keyboardType={"email-address"}
                                        placeholder={"Email ou numero de telephone"}/>

                                    <CustomInput
                                        onChangeText={handleChange('password')}
                                        value={values.password}
                                        isPassword
                                        placeholder={"Mot de passe"}/>
                                    {registerError && <Text style={styles.error}>{registerError}</Text>}
                                </View>
                                {/*<KeyboardStickyView offset={offset} style={styles.buttonsContainer}>*/}
                                <TouchableOpacity style={styles.button} onPress={handleSubmit as any}>
                                    {loading ?
                                        <ActivityIndicator color={"0B4A3F"}/> :
                                        <Text style={{
                                            color: "white",
                                            fontFamily: typography.fontFamily.medium,
                                            fontSize: 16
                                        }}>Connexion</Text>}
                                </TouchableOpacity>
                                <Text>ou</Text>
                                <TouchableOpacity style={{
                                    ...styles.button,
                                    backgroundColor: "white",
                                    borderWidth: 1,
                                    borderColor: "gray"
                                }} onPress={() => router.push("/register/step1")}>
                                    <Text style={{color: colors.text.primary, fontFamily: typography.fontFamily.medium, fontSize: 16}}>Créer
                                        un
                                        compte</Text>
                                </TouchableOpacity>
                                {/*</KeyboardStickyView>*/}
                            </View>
                        )}
                    </Formik>
                </View>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 22,
        fontFamily: typography.fontFamily.bold,
    },
    inputsContainer: {
        gap: spacing.md,
    },
    buttonsContainer: {
        gap: spacing.sm,
        alignItems: "center",
    },
    button: {
        backgroundColor: colors.primary,
        height: 45,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        bottom: 0,
        width: '100%',
    },
    error: {
        fontSize: 10,
        color: "crimson",
        fontFamily: typography.fontFamily.bold,
    }
});
