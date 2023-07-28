import { useAppDispatch, useAppSelector } from '@/store/hooks/redux'
import styles from './AuthPop.module.scss'
import { AuthPopProps } from './AuthPop.props'
import { popupSlice } from '@/store/reducers/PopupSlice'
import cn from 'classnames'
import { CloseIcon, EyeIcon } from '@/public/Icons'
import { useEffect, useRef, useState } from 'react'
import { browserLocalPersistence, browserSessionPersistence, createUserWithEmailAndPassword, getAuth, setPersistence, signInWithEmailAndPassword } from 'firebase/auth'
import { getDatabase, onValue, ref, set } from 'firebase/database'
import { userSlice } from '@/store/reducers/UserSlice'
import { getDownloadURL, getStorage, ref as sRef } from 'firebase/storage'



export const AuthPop = ({...props}: AuthPopProps): JSX.Element => {
    const { popupType } = useAppSelector(state => state.PopupReducer)
    const { setPopupType } = popupSlice.actions
    const [errorText, setErrorText] = useState<string>('')
    const db = getDatabase()
    const storage = getStorage()
    const { email, token, id, avaUrl, dispName } = useAppSelector(state => state.UserReducer)
    const { setUser } = userSlice.actions
    const dispatch = useAppDispatch()
    const [showPass, setShowPass] = useState({first: false, second: false})
    const formRef = useRef(null)
    const { langtype } = useAppSelector(state => state.LangReducer)


    /* Вносим пользователя в базу данных */
    useEffect(() => {
        onValue(ref(db, 'users/' + id), (userData) => {
            const data = userData.val()
            /* Если у он уже есть в БД, но не хватает каких-то данных */
            if(data){
                if(!data.email && email && id){
                    set(ref(db, 'users/' + id + '/email'), email)
                }
                if(!data.uid && id){
                    set(ref(db, 'users/' + id + '/uid'), id)
                }
                if(!data.photoUrl && id){
                    getDownloadURL(sRef(storage, 'usersImage/defUserImage.jpg')).then(url => {
                        set(ref(db, 'users/' + id + '/photoUrl'), url)
                    })
                }
                if(!data.displayName && id){
                    if(dispName){
                        set(ref(db, 'users/' + id + '/displayName'), dispName)
                    } else {
                        //@ts-ignore
                        set(ref(db, 'users/' + id + '/displayName'), `user_${id.slice(0, 5)}`)
                    }
                }
            /* Если его нет в БД */
            } else if (id) {
                set(ref(db, 'users/' + id + '/email'), email)
                set(ref(db, 'users/' + id + '/uid'), id)
                getDownloadURL(sRef(storage, 'usersImage/defUserImage.jpg')).then(url => {
                    set(ref(db, 'users/' + id + '/photoUrl'), url)
                })
            }
        })
    }, [email, token, id, avaUrl, dispName])
    

    const handleSubmit = (event: any) => {
        event.preventDefault();
        setErrorText('')
        const auth = getAuth();
        /* Вход */
        if (popupType === "login") {
            signInWithEmailAndPassword(auth, event.target.email.value, event.target.password.value)
                /* После авторизации: */
                .then((userCard) => {
                    dispatch(setUser({
                        // @ts-ignore
                        token: userCard.user.accessToken,
                        email: userCard.user.email,
                        id: userCard.user.uid,
                        avaUrl: userCard.user.photoURL,
                        dispName: userCard.user.displayName
                    }))
                    /* Сохраняем сессию в локальном хранилище браузера */
                    setPersistence(auth, browserLocalPersistence)
                    dispatch(setPopupType(''))
                })
                /* Ловим возможные ошибки авторизации */
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    if (errorCode === "auth/invalid-email") {
                        setErrorText((langtype=='kz')?"Электрондық пошта форматы дұрыс емес.":"Неверный формат электронной почты.");
                    } else if (errorCode === "auth/user-disabled") {
                        setErrorText((langtype=='kz')?"Пайдаланушы өшірілген.":"Пользователь отключен.");
                    } else if (errorCode === "auth/user-not-found") {
                        setErrorText((langtype=='kz')?"Мұндай электрондық поштасы бар пайдаланушы тіркелмеген.":"Пользователь с такой электронной почтой не зарегистрирован.");
                    } else if (errorCode === "auth/wrong-password") {
                        setErrorText((langtype=='kz')?"Құпия сөз дұрыс емес.":"Неверный пароль.");
                    } else if (errorCode === "auth/network-request-failed") {
                        setErrorText((langtype=='kz')?"Желі қатесі.":"Ошибка сети.");
                    } else if (errorCode === "auth/too-many-requests") {
                        setErrorText((langtype=='kz')?"Тым көп сәтсіз әрекеттер. Кейінірек көріңіз.":"Слишком много неудачных попыток. Попробуйте позже.");
                    } else {
                        setErrorText('');
                        console.log(errorCode)
                    }
                });
        /* Регистрация */
        } else if (popupType === "signin") {
            if (event.target.password.value.length < 8) {
                setErrorText((langtype=='kz')?"Құпия сөзде кемінде 8 таңба болуы керек.":"Пароль должен содержать не менее 8 символов.")
            } else if (event.target.password.value !== event.target.password2.value) {
                setErrorText((langtype=='kz')?"Құпия сөздер бірдей емес.":'Пароли не совпадают.')
            } else {
                createUserWithEmailAndPassword(auth, event.target.email.value, event.target.password.value)
                    /* Полсе регистрации */
                    .then((userCard) => {
                        console.log(userCard)
                        dispatch(setUser({
                            // @ts-ignore
                            token: userCard.user.accessToken,
                            email: userCard.user.email,
                            id: userCard.user.uid,
                            avaUrl: userCard.user.photoURL,
                            dispName: event.target.name.value
                        }))
                        /* Сохраняем сессию в локальном хранилище браузера */
                        setPersistence(auth, browserSessionPersistence)
                        dispatch(setPopupType(''))
                    })
                    /* Ловим возможные ошибки регистрации */
                    .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        if (errorCode === "auth/invalid-email") {
                            setErrorText((langtype=='kz')?"Электрондық пошта форматы дұрыс емес.":"Неверный формат электронной почты.");
                        } else if (errorCode === "auth/email-already-in-use") {
                            setErrorText((langtype=='kz')?"Бұл электрондық пошта қазірдің өзінде қолданыста.":"Эта электронная почта уже используется.");
                        } else if (errorCode === "auth/network-request-failed") {
                            setErrorText((langtype=='kz')?"Желі қатесі.":"Ошибка сети.");
                        } else {
                            setErrorText('');
                        }
                    })
            }
        }
    }

    /* Сбрасываем переменные при изменении типа входа */
    useEffect(() => {
        setShowPass({first: false, second: false})
        setErrorText('')
        if(formRef){
            //@ts-ignore
            formRef.current.reset()
        }
    }, [popupType])
    
    return(
        <div {...props}>
            <div className={cn(styles.wrapper, {[styles.hide]: !(popupType === 'signin' || popupType === 'login')})}
                onClick={() => dispatch(setPopupType(''))}/>
            <div className={cn(styles.container, {[styles.hide]: !(popupType === 'signin' || popupType === 'login')})}>
                <div className={styles.types}>
                    <button className={cn(styles.btn, {[styles.active]: popupType === 'login'})}
                        onClick={() => dispatch(setPopupType('login'))}>{(langtype=='kz')?"Кіру":"Войти"}</button>
                    <div className={styles.line}>/</div>
                    <button className={cn(styles.btn1, {[styles.active]: popupType === 'signin'})}
                        onClick={() => dispatch(setPopupType('signin'))}>{(langtype=='kz')?"Тіркелу":"Регистрация"}</button>
                </div>
                <div className={styles.text}>
                    {(langtype=='rus')?`Заполните поля чтобы ${popupType=='login'?'войти':'зарегестрироваться'}`
                    :`${popupType=='login'?'Кіру':'Тіркелу'} үшін өрістерді толтырыңыз`}
                </div>
                <div className={styles.errorText}>{errorText}</div>
                <form onSubmit={handleSubmit} className={styles.form} ref={formRef}>
                    <input type="email" name="email" placeholder={(langtype=='kz')?'Электрондық пошта':'Электронная почта'} className={styles.inp} required/>
                    <input type="text" name="name" placeholder={(langtype=='kz')?'Аты':'Имя'} className={cn(styles.inp, {[styles.hide]: popupType=='login'})}/>
                    <div className={styles.inp__wrapper}>
                        <input type={showPass.first?'text':'password'} name="password" placeholder={(langtype=='kz')?'Құпия сөз':'Пароль'} className={styles.inp} required/>
                        <button type='button' className={styles.inp__eye} onClick={() => setShowPass({first: !showPass.first, second: showPass.second})}>
                            <EyeIcon className={styles.inp__eye_icon}/>
                        </button>
                    </div>
                    <div className={cn(styles.inp__wrapper, {[styles.hide]: popupType=='login'})}>
                        <input type={showPass.second?'text':'password'} name="password2" placeholder={(langtype=='kz')?'Құпия сөзді қайталаңыз':'Повторите пароль'} className={styles.inp}/>
                        <button type='button' className={styles.inp__eye} onClick={() => setShowPass({first: showPass.first, second: !showPass.second})}>
                            <EyeIcon className={styles.inp__eye_icon}/>
                        </button>
                    </div>
                    <button type='submit' className={cn(styles.submit)}>{(langtype=='rus')?(popupType=='login'?'Войти':'Зарегестрироваться'):(popupType=='login'?'Кіру':'Тіркелу')}</button>
                </form>
                <button className={styles.close} onClick={() => dispatch(setPopupType(''))}><CloseIcon className={styles.close__icon}/></button>
            </div>
        </div>
    )
}