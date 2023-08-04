import { Header } from '@/Components/Header/Header'
import styles from './ProfilePage.module.scss'
import { ProfilePageProps } from './ProfilePage.props'
import cn from 'classnames'
import { AddImageIcon, Arrow3Icon } from '@/public/Icons'
import { useAppSelector } from '@/store/hooks/redux'
import { useEffect, useRef, useState } from 'react'
import { getDatabase, onValue, ref, set } from 'firebase/database'
import { useDispatch } from 'react-redux'
import { popupSlice } from '@/store/reducers/PopupSlice'
import { langSlice } from '@/store/reducers/LangSlice'
import { getAuth } from 'firebase/auth'
import { userSlice } from '@/store/reducers/UserSlice'
import { getDownloadURL, getStorage, ref as sRef, uploadBytes } from 'firebase/storage'
import { Footer } from '@/Components/Footer/Footer'


/* Функциональный компонент поле ввода с счетчиком */
//@ts-ignore
const InputWithCounter = ({autofill, count, title, name, ...props}): JSX.Element => {
    const [letCount, setLetCount] = useState<number>(count)
    const [inpText, setInpText] = useState<string>('')

    /* Счетчиков символов */
    useEffect(() => {
        if(inpText.length <= count){
            setLetCount(count - inpText.length)
        } else {
            setInpText(inpText.slice(0, count))
        }
    }, [inpText])

    /* Автозаполнение */
    useEffect(() => {
        if(autofill){
            setInpText(autofill)
        }
    }, [autofill])

    /* Регулируем высоту текстового поля */
    const handleTextChange = (e: any) => {
        setInpText(e.target.value)
        if(e){
            e.target.style.height = 'inherit'
            e.target.style.height = `${e.target.scrollHeight}px`
        }
    }

    return(
        <div {...props}>
            <div className={styles.countInp}>
                <label className={styles.labels__label}>
                    <input type='text' name={name} className={styles.input}
                        onChange={handleTextChange} value={inpText} autoComplete="off"/>
                    <div className={cn(styles.input__title, {[styles.input__title_active]: inpText != ''})}>{title}</div>
                </label>
                <div className={styles.countInp__int}>{letCount}</div>
            </div>
        </div>
    )
}


/* Функциональный компонент длинного поле ввода */
const InputLong = ({...props}): JSX.Element => {
    const [text, setText] = useState<string>('')
    const textRef = useRef(null)
    const { id } = useAppSelector(state => state.UserReducer)
    const db = getDatabase()
    const { langtype } = useAppSelector(state => state.LangReducer)

    /* Получаем дополнительные сведения(если есть) для автозаполнения */
    useEffect(() => {
        if(id){
            onValue(ref(db, `users/${id}/additionalInfo`), (data) => {
                setText(data.val())
            })
        }
    }, [id])

    /* Регулируем высоту текстового поля */
    const handleTextChange = (e: any) => {
        setText(e.target.value)
        if(e){
            e.target.style.height = 'inherit'
            e.target.style.height = `${e.target.scrollHeight}px`
        }
    }

    /* Сохраняем */
    const handleSubmit = () => {
        console.log(text)
        if(id){
            set(ref(db, `users/${id}/additionalInfo`), text)
        }
    }

    return(
        <div {...props}>
            <div className={styles.longText}>
                <div className={styles.longText__title}>{(langtype=='kz')?"Қосымша мәліметтер":"Дополнительные сведения"}</div>
                <label className={styles.longText__textarea_wrapper}>
                    <textarea className={styles.longText__textarea} rows={1}
                        placeholder={(langtype=='kz')?"Печенье мен шай ішкенді ұнатамын":'Люблю есть печенье с чаем'}
                        onChange={handleTextChange} ref={textRef} value={text} autoComplete="off"/>
                </label>
            </div>
            <button onClick={handleSubmit} className={styles.info__submit}>{(langtype=='kz')?"Сақтау":"Сохранить"}</button>
        </div>
    )
}


/* Содержание страницы Profile */
export const ProfilePage = ({...props}: ProfilePageProps): JSX.Element => {
    const [userName, setUserName] = useState<string>('')
    const [userImage, setUserImage] = useState<string>('')
    const [userComp, setUserComp] = useState<string>('')
    const [activePage, setActivePage] = useState<string>('profile')
    const [userInpImage, setUserInpImage] = useState(null)
    const { id } = useAppSelector(state => state.UserReducer)
    const db = getDatabase()
    const dispatch = useDispatch()
    const { setPopupType } = popupSlice.actions
    const { langtype } = useAppSelector(state => state.LangReducer)
    const { setLangType } = langSlice.actions
    const { setUser } = userSlice.actions
    const [opened, setOpened] = useState<boolean>(false)

    /* Получаем информацию о пользователе */
    useEffect(() => {
        if(id){
            onValue(ref(db, `users/${id}/displayName`), (data) => {
                setUserName(data.val())
            })
            onValue(ref(db, `users/${id}/photoUrl`), (data) => {
                setUserImage(data.val())
            })
            onValue(ref(db, `users/${id}/competence`), (data) => {
                setUserComp(data.val())
            })
        }
    }, [id])

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
    
    /* Сохраняем */
    const handleSubmitMain = (e: any) => {
        e.preventDefault()
        if(id){
            set(ref(db, `users/${id}/displayName`), e.target.name.value)
            set(ref(db, `users/${id}/competence`), e.target.competence.value)
        }
    }

    /* Выйти из аккаунта */
    const handleLogout = () => {
        const auth = getAuth()
        auth.signOut().then(() => {
            dispatch(setUser({
                email: null,
                token: null,
                id: null
            }))
            if(window.location.hostname === 'localhost'){
                window.location.href = `http://${window.location.hostname}:3000`
            } else {
                window.location.href = `https://${window.location.hostname}`
            }
        })
    }

    /* Сохраняем изменения фотографии */
    useEffect(() => {
        const storage = getStorage()
        const db = getDatabase()
        if(id && userInpImage){
            //@ts-ignore
            const renamedImage = new File([userInpImage], 'displayPhoto', { type: userInpImage.type })
            const uimgPlaceRef = sRef(storage, `profiles/${id}/displayPhoto`)
            uploadBytes(uimgPlaceRef, renamedImage).then(() => {
                getDownloadURL(uimgPlaceRef).then((url) => {
                    setUserImage(url)
                    set(ref(db, `users/${id}/photoUrl`), url).then(() => {
                        setUserInpImage(null)
                    })
                })
            })
        }
    }, [id, userInpImage])

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
            <Header className={styles.header}/>
            <div className={styles.wrapper}>
                <div className={styles.sidebar}>
                    <div className={styles.profile}>
                        <div className={styles.profile__ava} style={{backgroundImage: `url(${userImage})`}}/>
                        <label className={styles.profile__add}>
                            <div className={styles.profile__add_icon}>
                                <AddImageIcon/>
                            </div>
                            <input type='file' className={styles.profile__photo_inp} accept="image/jpeg, image/png"
                                //@ts-ignore
                                onChange={(e) => setUserInpImage(e.target.files[0])}/>
                        </label>
                        <div className={styles.profile__name}>{userName}</div>
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
                <div className={styles.content}>
                    <div className={styles.article}>
                        <div className={styles.article__big}>{(langtype=='kz')?"Қоғамдық профиль":"Публичный профиль"}</div>
                        <div className={styles.article__small}>{(langtype=='kz')?"Өзіңіз туралы ақпаратты қосыңыз":"Добавьте информацию о себе"}</div>
                    </div>
                    <div className={styles.info}>
                        <div className={styles.info__profile}>
                            <div className={styles.profile__ava} style={{backgroundImage: `url(${userImage})`}}/>
                            <label className={styles.profile__add2}>
                                <div className={styles.profile__add_icon}>
                                    <AddImageIcon/>
                                </div>
                                <input type='file' className={styles.profile__photo_inp} accept="image/jpeg, image/png"
                                    //@ts-ignore
                                    onChange={(e) => setUserInpImage(e.target.files[0])}/>
                            </label>
                        </div>
                        <form className={styles.info__mainForm} onSubmit={handleSubmitMain}>
                            <div className={styles.info__title}>{(langtype=='kz')?"Негізгі мәліметтер":"Основные сведения"}</div>
                            <InputWithCounter autofill={userName} count={16} title={(langtype=='kz')?"Аты":'Имя'} name='name'/>
                            <InputWithCounter autofill={userComp} count={60} title={(langtype=='kz')?"Негізгі құзыреттілік":'Основная компетенция'} name='competence'/>
                            <button type='submit' className={styles.info__submit}>{(langtype=='kz')?"Сақтау":"Сохранить"}</button>
                        </form>
                        <InputLong/>
                        <div className={styles.lang__wrapper}>
                            <button className={styles.lang} onClick={() => setOpened(!opened)}>
                                <div className={styles.lang__title}>{(langtype=='rus')?'Русский':'Қазақ тілі'}</div>
                                <div className={cn(styles.lang__arrow, {[styles.lang__arrow_active]: opened})}><Arrow3Icon/></div>
                            </button>
                            <div className={styles.lang__list_wrapper}>
                                <div className={cn(styles.lang__list, {[styles.lang__opened]: opened})}>
                                    <button onClick={() => {setOpened(false); changeLang('rus')}}
                                        className={cn(styles.lang__btn, {[styles.lang__btn_active]:langtype=='rus'})}>Русский</button>
                                    <button onClick={() => {setOpened(false); changeLang('kz')}}
                                        className={cn(styles.lang__btn2, {[styles.lang__btn_active]:langtype=='kz'})}>Қазақ тілі</button>
                                </div>
                            </div>
                        </div>
                        <button onClick={handleLogout} className={styles.logout}>{(langtype=='kz')?"Аккаунттан шығу":"Выйти из аккаунта"}</button>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    )
}