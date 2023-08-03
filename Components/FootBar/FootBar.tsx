import { useAppDispatch, useAppSelector } from '@/store/hooks/redux'
import styles from './FootBar.module.scss'
import { FootBarProps } from './FootBar.props'
import { CourseIcon, HomeIcon, SubsIcon } from '@/public/Icons'
import { popupSlice } from '@/store/reducers/PopupSlice'
import { useEffect, useState } from 'react'




export const FootBar = ({...props}: FootBarProps): JSX.Element => {
    const dispatch = useAppDispatch()
    const { setPopupType } = popupSlice.actions
    const { id } = useAppSelector(state => state.UserReducer)
    const { langtype } = useAppSelector(state => state.LangReducer)
    const [windowHeight, setWindowHeight] = useState<number>(0)
    

    /* Логика для перехода по страницам */
    const goToPage = (page: string) => {
        const currentDomain = window.location.hostname
        if(page === ''){
            if(currentDomain === 'localhost'){
                window.location.href = `http://${window.location.hostname}:3000/${page}`
            } else {
                window.location.href = `https://${window.location.hostname}/${page}`
            }
        } else if (!id){
            dispatch(setPopupType('login'))
        } else {
            if(currentDomain === 'localhost'){
                window.location.href = `http://${window.location.hostname}:3000/${page}`
            } else {
                window.location.href = `https://${window.location.hostname}/${page}`
            }
        }
    }

    useEffect(() => {
        if(window.innerHeight){
            setWindowHeight(window.innerHeight - 40)
        }
    }, [])
    
    return(
        <div {...props}>
            <div className={styles.wrapper}>
                <button className={styles.btn} onClick={() => goToPage('')}><HomeIcon/>{(langtype=='kz')?"Басты бет":"Главная"}</button>
                <button className={styles.btn} onClick={() => goToPage('courses')}><CourseIcon/>{(langtype=='kz')?"Курстар":"Курсы"}</button>
                <button className={styles.btn} onClick={() => goToPage('subscriptions')}><SubsIcon/>{(langtype=='kz')?"Жазылымдар":"Мои подписки"}</button>
            </div>
        </div>
    )
}