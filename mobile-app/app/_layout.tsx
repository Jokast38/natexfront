import {Stack} from "expo-router";
import {useFonts} from "expo-font";
import {useEffect} from "react";
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
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

    // Global handlers: catch some native module errors (e.g. keep-awake activation failures)
    useEffect(() => {
        const onUnhandledRejection = (event: any) => {
            try {
                const reason = event?.reason || event;
                const msg = String(reason?.message || reason || '');
                // Ignore known keep-awake activation error
                if (msg.includes('Unable to activate keep awake')) {
                    console.warn('Ignored keep-awake activation error');
                    return;
                }
            } catch (e) { /* ignore */ }
            // let the default handler continue for other errors
        };

        // For React Native, use global rejection handler
        (global as any).onunhandledrejection = onUnhandledRejection;

        // Also attach a global error handler (React Native) to swallow keep-awake activation errors
        const defaultHandler = (ErrorUtils as any)?.getGlobalHandler ? (ErrorUtils as any).getGlobalHandler() : undefined;
        const customHandler = (error: any, isFatal?: boolean) => {
            try {
                const msg = String(error?.message || error || '');
                if (msg.includes('Unable to activate keep awake')) {
                    console.warn('Ignored keep-awake activation error (global handler)');
                    return;
                }
            } catch (e) { /* ignore */ }
            if (defaultHandler) defaultHandler(error, isFatal);
        };
        try {
            (ErrorUtils as any).setGlobalHandler(customHandler);
        } catch (e) {
            // Environment may not support ErrorUtils setting
        }

        return () => {
            try { (global as any).onunhandledrejection = undefined; } catch (e) { }
            try { if ((ErrorUtils as any)?.setGlobalHandler) (ErrorUtils as any).setGlobalHandler(defaultHandler); } catch (e) { }
        };
    }, []);

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