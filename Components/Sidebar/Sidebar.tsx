import { useAppDispatch, useAppSelector } from '@/store/hooks/redux'
import styles from './Sidebar.module.scss'
import cn from 'classnames'
import { popupSlice } from '@/store/reducers/PopupSlice'
import { useState } from 'react'
import { SidebarProps } from './Sidebar.props'



export const Sidebar = ({image, name, page, ...props}: SidebarProps): JSX.Element => {
    const [activePage, setActivePage] = useState<string>(page)
    const { id } = useAppSelector(state => state.UserReducer)
    const dispatch = useAppDispatch()
    const { setPopupType } = popupSlice.actions
    const { langtype } = useAppSelector(state => state.LangReducer)


    /* Логика для перехода по страницам */
    const goToPage = (page: string) => {
        const currentDomain = window.location.hostname
        if(page === 'profile' && !id){
            dispatch(setPopupType('login'))
        } else if (page === 'my_subs' && !id){
            dispatch(setPopupType('login'))
        } else {
            if(currentDomain === 'localhost'){
                window.location.href = `http://${window.location.hostname}:3000/${page}`
            } else {
                window.location.href = `https://${window.location.hostname}/${page}`
            }
        }
    }

    return(
        <div {...props}>
            <div className={styles.sidebar}>
                <div className={styles.profile}>
                    <div className={styles.profile__ava} style={{backgroundImage: `url(${image})`}}/>
                    <div className={styles.profile__name}>{name}</div>
                </div>
                <div className={styles.links}>
                    <button className={cn(styles.links__link, {[styles.links__active]: activePage==='home'})}
                        onClick={() => {goToPage(''), setActivePage('home')}}>{(langtype=='kz')?"Басты бет":"Главная"}</button>
                    <button className={cn(styles.links__link, {[styles.links__active]: activePage==='courses'})}
                        onClick={() => {goToPage('courses'), setActivePage('courses')}}>{(langtype=='kz')?"Курстар":"Курсы"}</button>
                    <button className={cn(styles.links__link, {[styles.links__active]: activePage==='profile'})}
                        onClick={() => {goToPage('profile'), setActivePage('profile')}}>{(langtype=='kz')?"Профиль":"Профиль"}</button>
                    <button className={cn(styles.links__link, {[styles.links__active]: activePage==='subscriptions'})}
                        onClick={() => {goToPage('subscriptions'), setActivePage('subscriptions')}}>{(langtype=='kz')?"Жазылымдар":"Мои подписки"}</button>
                </div>
            </div>
        </div>
    )
}