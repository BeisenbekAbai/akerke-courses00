import { Arrow1Icon, GlobeIcon } from '@/public/Icons'
import styles from './Header.module.scss'
import { useEffect, useState } from 'react'
import cn from 'classnames'
import { HeaderProps } from './Header.props'
import { useAppDispatch, useAppSelector } from '@/store/hooks/redux'
import { popupSlice } from '@/store/reducers/PopupSlice'
import { EmailAuthProvider, getAuth, reauthenticateWithCredential } from 'firebase/auth'
import { userSlice } from '@/store/reducers/UserSlice'
import { getDatabase, onValue, ref, set } from 'firebase/database'
import { AuthPop } from '../AuthPop/AuthPop'
import { langSlice } from '@/store/reducers/LangSlice'
import { AddComPop } from '../AddComPop/AddComPop'
import { DeleteCourse } from '../DeleteCourse/DeleteCourse'
import { DeleteVideo } from '../DeleteVideo/DeleteVideo'
import { BannerPop } from '../BannerPop/BannerPop'
import { HowGoPop } from '../HowGoPop/HowGoPop'
import { FootBar } from '../FootBar/FootBar'
import { AddResourcesPop } from '../AddResourcesPop/AddResourcesPop'
import { AddResCard } from '../AddResCard/AddResCard'



export const Header = ({...props}:HeaderProps): JSX.Element => {
    const [opened, setOpened] = useState<boolean>(false)
    const dispatch = useAppDispatch()
    const { setPopupType } = popupSlice.actions
    const { setUser } = userSlice.actions
    const [currentUser, setCurrentUser] = useState(null)
    const { id } = useAppSelector(state => state.UserReducer)
    const { langtype } = useAppSelector(state => state.LangReducer)
    const { setLangType } = langSlice.actions
    const db = getDatabase()
    const [userName, setUserName] = useState<string>('')
    const [userImage, setUserImage] = useState<string>('')

    /* Автоматический вход */
    useEffect(() => {
        const auth = getAuth()
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                // @ts-ignore
                setCurrentUser(user);
            }
        });
    }, []);
    useEffect(() => {
        if(currentUser){
            dispatch(setUser({
                // @ts-ignore
                email: currentUser?.email,
                // @ts-ignore
                token: currentUser?.accessToken,
                // @ts-ignore
                id: currentUser?.uid,
                // @ts-ignore
                dispName: currentUser?.displayName
            }))
        }
    }, [currentUser])

    /* Загружаем данные о пользователе */
    useEffect(() => {
        if(id){
            onValue(ref(db, `users/${id}/displayName`), (data) => {
                setUserName(data.val())
            })
            onValue(ref(db, `users/${id}/photoUrl`), (data) => {
                setUserImage(data.val())
            })
            onValue(ref(db, `users/${id}/language`), (data) => {
                if(!data.val()){
                    dispatch(setLangType('rus'))
                }
            })
        }
    }, [id])

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

    /* Получаем выбранный язык */
    useEffect(() => {
        if(id){
            onValue(ref(db, `users/${id}/language`), (data) => {
                dispatch(setLangType(data.val()))
            })
        }
    }, [id])

    /* Сохраняем выбранный язык */
    const changeLang = (lang: string) => {
        set(ref(db, `users/${id}/language`), lang)
    }
    

    return(
        <div {...props}>
            <div className={styles.popups}>
                <AuthPop/>
                <AddComPop/>
                <DeleteCourse/>
                <DeleteVideo/>
                <BannerPop/>
                <HowGoPop/>
                <FootBar/>
                <AddResourcesPop/>
                <AddResCard resnum={0}/>
            </div>
            <div className={styles.wrapper}>
                <div className={styles.container}>
                    <button className={styles.logotype} onClick={() => goToPage('')}>logotype</button>
                    <div className={styles.central}>
                        <button className={styles.central__link} onClick={() => goToPage('')}>{(langtype=='kz')?"Басты бет":"Главная"}</button>
                        <button className={styles.central__link} onClick={() => goToPage('courses')}>{(langtype=='kz')?"Курстар":"Курсы"}</button>
                        <button className={styles.central__link2} onClick={() => goToPage('profile')}>{(langtype=='kz')?"Профиль":"Профиль"}</button>
                        <button className={styles.central__link} onClick={() => goToPage('subscriptions')}>{(langtype=='kz')?"Жазылымдар":"Мои подписки"}</button>
                    </div>
                    <div className={styles.container__left}>
                        <div className={styles.langlist__wrapper}>
                            <button className={styles.langlist} onClick={() => setOpened(!opened)}>
                                <GlobeIcon/>
                                <span className={styles.langlist__selected}>{(langtype=='rus')?'Русский':'Қазақ тілі'}</span>
                                <div className={cn(styles.langlist__arr, {[styles.down]: opened})}><Arrow1Icon/></div>
                            </button>
                            <div className={styles.langlist__options_wrapper}>
                                <div className={cn(styles.langlist__options, {[styles.down1]: opened})}>
                                    <button className={cn(styles.langlist__opt1, {[styles.langlist__active]:langtype=='rus'})} 
                                        onClick={() => {changeLang('rus'); setOpened(false)}}>Русский</button>
                                    <button className={cn(styles.langlist__opt, {[styles.langlist__active]:langtype=='kz'})} 
                                        onClick={() => {changeLang('kz'); setOpened(false)}}>Қазақ тілі</button>
                                </div>
                            </div>
                        </div>
                        <div className={styles.auth}>
                            {id?(
                                <button className={styles.profile} onClick={() => goToPage('profile')}>
                                    <div className={styles.profile__image} style={{backgroundImage: `url(${userImage})`}}/>
                                    <div className={styles.profile__name}>{userName}</div>
                                </button>
                            )
                            :(
                                <>
                                    <button className={styles.auth__btn} onClick={() => dispatch(setPopupType('login'))} style={{marginRight: '15px'}}>{(langtype=='kz')?"Кіру":"Войти"}</button>
                                    <button className={styles.auth__btn} onClick={() => dispatch(setPopupType('signin'))}>{(langtype=='kz')?"Тіркелу":"Регистрация"}</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}