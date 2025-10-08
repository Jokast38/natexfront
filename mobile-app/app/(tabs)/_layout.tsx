import {Redirect, Tabs} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import React from 'react';
import {jwtDecode} from "jwt-decode";
import {useSelector} from "react-redux";
import {AppDispatch, RootState} from "@/src/redux/store";

/**
 * Vérifie si un token JWT est valide
 * @param {string} token - Le JWT à vérifier
 * @returns {boolean} - True si le token est valide, false sinon
 */
const isTokenValid = (token: any): boolean => {
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Temps actuel en secondes

        return decoded.exp! > currentTime;
    } catch (error) {
        return false; // Si une erreur se produit, le token n'est pas valide
    }
};

export default function TabLayout() {
    const {token} = useSelector((state: RootState) => state.auth);

    if (!token || !isTokenValid(token)) {
        return <Redirect href="/login"/>;
    }
    return (
        <Tabs screenOptions={{tabBarActiveTintColor: '#3E8E68', headerShown: false}}>
            <Tabs.Screen name="photos" options={{
                tabBarLabel: "Photos",
                tabBarIcon: ({color, size}) => <Ionicons name="images" color={color} size={size}/>
            }}/>
            <Tabs.Screen name="map" options={{
                tabBarLabel: "Carte",
                tabBarIcon: ({color, size}) => <Ionicons name="map" color={color} size={size}/>
            }}/>
            <Tabs.Screen name="camera" options={{
                tabBarLabel: "Camera",
                tabBarIcon: ({color, size}) => <Ionicons name="camera" color={color} size={size}/>
            }}/>
            <Tabs.Screen name="calendar" options={{
                tabBarLabel: "Calendrier",
                tabBarIcon: ({color, size}) => <Ionicons name="calendar" color={color} size={size}/>
            }}/>
            <Tabs.Screen name="profile" options={{
                tabBarLabel: "Profil",
                tabBarIcon: ({color, size}) => <Ionicons name="person" color={color} size={size}/>
            }}/>
        </Tabs>
    );
}
