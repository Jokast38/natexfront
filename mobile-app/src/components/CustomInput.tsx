import React, { useState } from 'react';
import { TextInput, StyleSheet, TextInputProps, View, TouchableOpacity } from 'react-native';
// import EyeIcon from "@/src/svg/createAlert/EyeIcon";
import {Feather} from "@expo/vector-icons";

interface CustomInputProps extends TextInputProps {
    style?: object;
    isPassword?: boolean; // Ajout de l'option mot de passe
}

const CustomInput = ({ style, isPassword = false, ...rest }: CustomInputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const [secureText, setSecureText] = useState(isPassword);

    return (
        <View style={[styles.container, style]}>
            <TextInput
                style={[
                    styles.input,
                    isFocused && styles.inputFocused,
                ]}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                secureTextEntry={secureText}
                clearButtonMode="while-editing"
                {...rest}
            />
            {isPassword && (
                <TouchableOpacity onPress={() => setSecureText(!secureText)} style={styles.eyeButton}>
                    {secureText ? <Feather name="eye" size={24} color="black" /> : <Feather name="eye-off" size={24} color="black" />}
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    input: {
        flex: 1,
        height: 45,
        backgroundColor: '#efefef',
        paddingHorizontal: 10,
        borderRadius: 15,
        fontFamily: 'PoppinsMedium',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    inputFocused: {
        borderColor: '#3498db',
        borderWidth: 1,
    },
    eyeButton: {
        position: 'absolute',
        right: 20,
        padding: 10,
    },
});

export default CustomInput;