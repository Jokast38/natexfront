import {configureStore, combineReducers} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {persistReducer, persistStore} from 'redux-persist';
import authReducer from "@/src/redux/slices/authSlice";


const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['auth'],
};

const rootReducer = combineReducers({
    auth: authReducer,
});

// Appliquer Redux Persist au reducer combiné
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
