import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {loadToken, login, logout, register} from "@/src/redux/actions/authActions";

type AuthState = {
    token: string | null;
    loading: boolean;
    error: string | null;
};

const initialState: AuthState = {
    token: null,
    loading: false,
    error: null,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action: PayloadAction<string>) => {
                state.loading = false;
                state.token = action.payload
            })
            .addCase(login.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(register.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(loadToken.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadToken.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.token = action.payload
            })
            .addCase(loadToken.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(logout.fulfilled, (state) => {
                // state.user = null;
                state.token = null
            })

            // .addCase(updateUser.fulfilled, (state, action) => {
            //     if (state.user) {
            //         state.user = {...state.user, ...action.payload}; // Synchroniser les informations utilisateur
            //     }
            // });
    },
});

export default authSlice.reducer;
