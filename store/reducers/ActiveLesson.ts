import { PayloadAction, createSlice } from "@reduxjs/toolkit"




const initialState = {
    activeLesson: 0
}

export const activeLessonSlice = createSlice({
    name: 'activeLesson',
    initialState,
    reducers: {
        setActiveLesson(state, action: PayloadAction<number>){
            state.activeLesson = action.payload
        }
    }
})

export default activeLessonSlice.reducer