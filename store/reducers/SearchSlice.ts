import { PayloadAction, createSlice } from "@reduxjs/toolkit";



const initialState = {
    searchWords: ''
}

export const searchSlice = createSlice({
    name: 'authpop',
    initialState,
    reducers: {
        setSearchWords(state, action: PayloadAction<string>){
            state.searchWords = action.payload
        }
    }
})

export default searchSlice.reducer