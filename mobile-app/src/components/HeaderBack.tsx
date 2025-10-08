import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {AntDesign} from "@expo/vector-icons";
import {router} from "expo-router";

interface HeaderBackProps {
    title: string;
}

function HeaderBack({title}: HeaderBackProps) {
    return (
        <View style={styles.container}>
            {/* Icône de retour */}
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <AntDesign name="left-circle" size={24} color="black"/>
            </TouchableOpacity>

            {/* Titre centré */}
            <Text style={styles.title}>{title}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 40,
        position: "relative", // Nécessaire pour positionner `absolute`
    },
    backButton: {
        position: "absolute",
        left: 0, // Aligné à gauche
    },
    title: {
        fontSize: 16,
        fontFamily: 'PoppinsMedium',
        textAlign: "center", // Pour bien centrer le texte
    },
});

export default HeaderBack;