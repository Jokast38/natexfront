import {Stack} from "expo-router";
import {useFonts} from "expo-font";
import {useEffect} from "react";
import * as SplashScreen from 'expo-splash-screen';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider, useDispatch, useSelector} from 'react-redux';
import {AppDispatch, persistor, RootState, store} from '@/src/redux/store';


export default function RootLayout() {
    return <Root/>;
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
        <Provider store={store}>
            <SafeAreaProvider>
                <Stack screenOptions={{headerShown: false, contentStyle: {backgroundColor: 'white'}}}/>
            </SafeAreaProvider>
        </Provider>
    );
}