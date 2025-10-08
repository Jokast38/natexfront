import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {getUser, updateUser} from "@/src/redux/actions/userActions";
import {loadToken, login} from "@/src/redux/actions/authActions";
import {jwtDecode} from "jwt-decode";

interface InitialState {
    user: any ;
    loading: boolean;
    updateLoading: boolean;
    error: string | null;
}

const initialState: InitialState = {
    user: null,
    loading: false,
    error: null,
    updateLoading: false,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(updateUser.pending, (state) => {
                state.updateLoading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action: PayloadAction<any>) => {
                state.updateLoading = false;
                state.user = action.payload; // Mise à jour des données utilisateur
            })
            .addCase(updateUser.rejected, (state, action: PayloadAction<any>) => {
                state.updateLoading = false;
                state.error = action.payload || 'Erreur inconnue';
            })

            .addCase(getUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUser.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.user = action.payload; // Mise à jour des données utilisateur
            })
            .addCase(getUser.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload || 'Erreur inconnue';
            })

            .addCase(login.fulfilled, (state, action: PayloadAction<string>) => {
                state.user = jwtDecode(action.payload)
            })
            .addCase(loadToken.fulfilled, (state, action: PayloadAction<any>) => {
                state.user = jwtDecode(action.payload)
            })
    },
});

export default userSlice.reducer;