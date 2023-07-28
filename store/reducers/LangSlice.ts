import { createSlice } from "@reduxjs/toolkit"




const initialState = {
    langtype: 'rus' || 'kz'
}

export const langSlice = createSlice({
    name: 'language',
    initialState,
    reducers: {
        setLangType(state, action){
            state.langtype = action.payload
        }
    }
})

export default langSlice.reducer