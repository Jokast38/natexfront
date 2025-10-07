import {Stack} from "expo-router";
import {useFonts} from "expo-font";
import {useEffect} from "react";
import * as SplashScreen from 'expo-splash-screen';

export default function RootLayout() {
  return <Root />;
}

function Root() {
    const [loaded] = useFonts({
        DMSansRegular: require('@/assets/fonts/DMSans-Regular.ttf'),
        DMSansMedium: require('@/assets/fonts/DMSans-Medium.ttf'),
        DMSansBold: require('@/assets/fonts/DMSans-SemiBold.ttf'),
    });

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <Stack screenOptions={{headerShown: false, contentStyle: {backgroundColor: 'white'}}}/>
    );
}