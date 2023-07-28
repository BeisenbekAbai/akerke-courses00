import { PayloadAction, createSlice } from "@reduxjs/toolkit";



const initialState = {
    popupType: ''
}

export const popupSlice = createSlice({
    name: 'popup',
    initialState,
    reducers: {
        setPopupType(state, action: PayloadAction<string>){
            state.popupType = action.payload
        }
    }
})

export default popupSlice.reducer