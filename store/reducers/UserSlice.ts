import { createSlice } from "@reduxjs/toolkit"




const initialState = {
    email: null,
    token: null,
    id: null,
    avaUrl: null,
    dispName: null
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser(state, action){
            state.email = action.payload.email
            state.token = action.payload.token
            state.id = action.payload.id
            state.avaUrl = action.payload.avaUrl
            state.dispName = action.payload.dispName
        },
        removeUser(state){
            state.email = null
            state.token = null
            state.id = null
            state.avaUrl = null
            state.dispName = null
        }
    }
})

export default userSlice.reducer