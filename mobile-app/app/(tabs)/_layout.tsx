import {Tabs} from 'expo-router';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{tabBarActiveTintColor: 'blue', headerShown: false}}>
            <Tabs.Screen name="photos" options={{tabBarLabel: "Photos"}}/>
            <Tabs.Screen name="map" options={{tabBarLabel: "Carte"}}/>
            <Tabs.Screen name="camera" options={{tabBarLabel: "Camera"}}/>
            <Tabs.Screen name="calendar" options={{tabBarLabel: "Calendrier"}}/>
            <Tabs.Screen name="profile" options={{tabBarLabel: "Profil"}}/>
        </Tabs>
    );
}
