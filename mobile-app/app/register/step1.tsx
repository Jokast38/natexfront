import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity, Keyboard, TouchableWithoutFeedback
} from 'react-native';
import {Formik} from "formik";
import React from 'react';
import {router} from "expo-router";
import {StepOneSchema} from "@/src/schemas/registerSchema";
import CustomInput from "@/src/components/CustomInput";
import HeaderBack from "@/src/components/HeaderBack";
import {spacing} from "@/src/theme/spacing";
import {SafeAreaView} from "react-native-safe-area-context";
import {colors} from "@/src/theme/color";

interface StepOneValues {
    firstName: string;
    lastName: string;
}

export default function StepOneScreen() {
    const initialValues: StepOneValues = {
        firstName: '',
        lastName: '',
    }

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <SafeAreaView style={{flex: 1, paddingHorizontal: 20}}>
                <HeaderBack title={"Nom complet"}/>
                <View style={styles.container}>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={StepOneSchema}
                        onSubmit={(values) => {
                            router.push({pathname: "/register/step2", params: {...values}});
                        }}
                    >
                        {({handleChange, handleBlur, handleSubmit, values, errors}) => (
                            <View style={styles.inputsContainer}>
                                <Text style={{fontFamily: "PoppinsRegular"}}>Entrez votre nom et prénom</Text>
                                <View>
                                    <CustomInput
                                        onChangeText={handleChange('firstName')}
                                        value={values.firstName}
                                        placeholder={"Prénom"}
                                    />
                                    {errors.firstName && <Text style={styles.error}>{errors.firstName}</Text>}
                                </View>
                                <View>

                                    <CustomInput
                                        onChangeText={handleChange('lastName')}
                                        // onBlur={handleBlur('lastName')}
                                        value={values.lastName}
                                        placeholder={"Nom"}
                                    />
                                    {errors.lastName && <Text style={styles.error}>{errors.lastName}</Text>}
                                </View>

                                <TouchableOpacity style={styles.button} onPress={handleSubmit as any}>
                                    <Text style={{
                                        color: colors.text.inverse,
                                        fontFamily: "PoppinsMedium",
                                        fontSize: 16
                                    }}>Suivant</Text>
                                </TouchableOpacity>
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
        marginTop: 10
        // padding: 20,
    },
    title: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: 'PoppinsBold',
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
        fontFamily: 'PoppinsMedium',
    },
    inputsContainer: {
        gap: spacing.md,
    },
});
