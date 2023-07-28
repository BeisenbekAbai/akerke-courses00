import { combineReducers, configureStore } from "@reduxjs/toolkit"
import PopupReducer from './reducers/PopupSlice'
import UserReducer from './reducers/UserSlice'
import LangReducer from './reducers/LangSlice'
import SearchReducer from './reducers/SearchSlice'
import ActiveLesson from "./reducers/ActiveLesson"
import ActiveRes from './reducers/ActiveRes'



const rootReducer = combineReducers({
    PopupReducer,
    UserReducer,
    LangReducer,
    SearchReducer,
    ActiveLesson,
    ActiveRes
})

export const setupStore = () => {
    return configureStore({
        reducer: rootReducer
    })
}


export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']