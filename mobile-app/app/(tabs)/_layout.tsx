import {Tabs} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{tabBarActiveTintColor: '#3E8E68', headerShown: false}}>
            <Tabs.Screen name="photos" options={{tabBarLabel: "Photos", tabBarIcon: ({color,size}) => <Ionicons name="images" color={color} size={size} />}}/>
            <Tabs.Screen name="map" options={{tabBarLabel: "Carte", tabBarIcon: ({color,size}) => <Ionicons name="map" color={color} size={size} />}}/>
            <Tabs.Screen name="camera" options={{tabBarLabel: "Camera", tabBarIcon: ({color,size}) => <Ionicons name="camera" color={color} size={size} />}}/>
            <Tabs.Screen name="calendar" options={{tabBarLabel: "Calendrier", tabBarIcon: ({color,size}) => <Ionicons name="calendar" color={color} size={size} />}}/>
            <Tabs.Screen name="profile" options={{tabBarLabel: "Profil", tabBarIcon: ({color,size}) => <Ionicons name="person" color={color} size={size} />}}/>
        </Tabs>
    );
}
