import { PayloadAction, createSlice } from "@reduxjs/toolkit"




const initialState = {
    activeres: 0
}

export const activeresSlice = createSlice({
    name: 'activeres',
    initialState,
    reducers: {
        setActiveRes(state, action: PayloadAction<number>){
            state.activeres = action.payload
        }
    }
})

export default activeresSlice.reducer