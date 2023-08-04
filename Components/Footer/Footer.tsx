import { FooterProps } from "./Footer.props"
import styles from './Footer.module.scss'
import { useAppDispatch, useAppSelector } from "@/store/hooks/redux"
import { popupSlice } from "@/store/reducers/PopupSlice"
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/public/Icons"




export const Footer = ({...props}: FooterProps): JSX.Element => {
    const dispatch = useAppDispatch()
    const { setPopupType } = popupSlice.actions
    const { id } = useAppSelector(state => state.UserReducer)
    const { langtype } = useAppSelector(state => state.LangReducer)

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


    return(
        <div {...props}>
            <div className={styles.wrapper}>
                <div className={styles.container}>
                    <div className={styles.left}>
                        <div className={styles.left__logotype}>Logotype</div>
                        <div className={styles.left__line}/>
                        <div className={styles.left__text}>
                            <div className={styles.left__text_navbar}>
                                <button className={styles.left__text_link} onClick={() => goToPage('')}>{(langtype==='rus')?"Главная":"Басты бет"}</button>
                                <button className={styles.left__text_link} onClick={() => goToPage('courses')}>{(langtype==='rus')?"Курсы":"Курстар"}</button>
                                <button className={styles.left__text_link} onClick={() => goToPage('subscriptions')}>{(langtype==='rus')?"Мои подписки":"Жазылымдар"}</button>
                                <button className={styles.left__text_link} onClick={() => goToPage('profile')}>{(langtype==='rus')?"Профиль":"Профиль"}</button>
                            </div>
                            <div className={styles.left__text_copyright}>{(langtype==='rus')?"© Все права защищены ООО «Акерке курсы»":`© Барлық құқықтар "Ақерке курстары" ЖШҚ-мен қорғалған`}</div>
                        </div>
                    </div>
                    <div className={styles.right}>
                        <div className={styles.right__social}>
                            <button className={styles.right__social_link} onClick={() => window.open('')}><YoutubeIcon/></button>
                            <button className={styles.right__social_link} onClick={() => window.open('')}><InstagramIcon/></button>
                            <button className={styles.right__social_link} onClick={() => window.open('')}><FacebookIcon/></button>
                        </div>
                        <div className={styles.right__support}>{(langtype==='rus')?"Поддержка: akerke9825@mail.ru":"Техникалық қолдау: akerke9825@mail.ru"}</div>
                    </div>
                </div>
                <div className={styles.copyright}>{(langtype==='rus')?"© Все права защищены ООО «Акерке курсы»":`© Барлық құқықтар "Ақерке курстары" ЖШҚ-мен қорғалған`}</div>
            </div>
        </div>
    )
}