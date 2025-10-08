import {
    View,
    Text,
    Keyboard,
    TouchableWithoutFeedback,
    ActivityIndicator,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import {Formik} from "formik";
import React, {useState} from 'react';
import {router, useLocalSearchParams} from "expo-router";
import {StepTwoSchema} from "@/src/schemas/registerSchema";
import {register} from "@/src/redux/actions/authActions";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "@/src/redux/store";
import {useResetRouter} from "@/src/hooks/useResetRouter";
import CustomInput from "@/src/components/CustomInput";
import HeaderBack from "@/src/components/HeaderBack";
import {spacing} from "@/src/theme/spacing";
import CrossIcon from "@/src/svg/createAlert/CrossIcon";
import {checkPasswordStrength, getPasswordErrorMessage} from "@/src/utils/passwordStrength";
import {SafeAreaView} from "react-native-safe-area-context";

interface StepTwoValues {
    email: string;
    password: string;
}

export default function StepThreeScreen() {
    const params: any = useLocalSearchParams();
    const {loading} = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const {resetTo} = useResetRouter();
    const [loginError, setLoginError] = useState('');
    const [passwordCriteria, setPasswordCriteria] = useState({
        hasLowercase: false,
        hasUppercase: false,
        hasNumber: false,
        hasMinLength: false,
        hasSpecialChar: false
    });

    const [valuesError, setValuesError] = useState<any>({
        email: null,
    });

    const initialValues: StepTwoValues = {
        email: '',
        password: '',
    }

    const handleSubmit = async (values: StepTwoValues) => {
        setLoginError('');
        try {
            await dispatch(register({...params, password: values.password})).unwrap()
            resetTo("/login");
        } catch (error) {
            setLoginError(error as string);
        }
    }

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <SafeAreaView style={{flex: 1, paddingHorizontal: 20}}>
                <HeaderBack title={"Email & Mot de passe"}/>
                <View style={styles.container}>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={StepTwoSchema}
                        onSubmit={handleSubmit}
                    >
                        {({handleChange, handleSubmit, values, errors}) => (
                            <View style={styles.inputsContainer}>
                                <Text style={{fontFamily: "PoppinsRegular"}}>Entrez votre email & mot de passe</Text>

                                <View>
                                    <CustomInput
                                        onChangeText={(text) => {
                                            handleChange("email")(text);
                                            setValuesError((prev) => ({...prev, email: null}));
                                        }}
                                        value={values.email}
                                        keyboardType={"email-address"}
                                        placeholder={"Adresse mail"}/>
                                    {errors.email && <Text style={styles.error}>{errors.email}</Text>}
                                </View>

                                <CustomInput
                                    onChangeText={(text) => {
                                        handleChange('password')(text);
                                        setPasswordCriteria(checkPasswordStrength(text));
                                    }}
                                    value={values.password}
                                    isPassword
                                    placeholder={"Mot de passe"}
                                />

                                <TouchableOpacity style={styles.button} onPress={handleSubmit as any}>
                                    {loading ?
                                        <ActivityIndicator color={"white"}/> :
                                        <Text style={{
                                            color: "white",
                                            fontFamily: "PoppinsMedium",
                                            fontSize: 16
                                        }}>Suivant</Text>}
                                </TouchableOpacity>
                                {loginError && <Text style={styles.error}>{loginError}</Text>}

                                <View style={{paddingRight: 30, gap: 4}}>
                                    {getPasswordErrorMessage(passwordCriteria) && (
                                        <Text>{getPasswordErrorMessage(passwordCriteria)}</Text>
                                    )}
                                </View>
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
        marginTop: 10,
    },
    title: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: 'PoppinsBold',
    },
    button: {
        backgroundColor: '#4881ea',
        height: 45,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    error: {
        fontSize: 12,
        color: "crimson",
        fontFamily: 'PoppinsMedium',
    },
    success: {
        color: "green",
    },
    inputsContainer: {
        gap: spacing.md,
    },
});