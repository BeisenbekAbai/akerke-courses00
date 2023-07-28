import { useAppDispatch, useAppSelector } from '@/store/hooks/redux'
import styles from './AddComPop.module.scss'
import { AddComPopProps } from './AddComPop.props'
import { popupSlice } from '@/store/reducers/PopupSlice'
import cn from 'classnames'
import { CloseIcon, Star3Icon } from '@/public/Icons'
import { useEffect, useRef, useState } from 'react'
import { getDatabase, onValue, ref, set } from 'firebase/database'
import { useRouter } from 'next/router'



export const AddComPop = ({...props}: AddComPopProps): JSX.Element => {
    const [courseId, setCourseId] = useState<string>('')
    const [rating, setRating] = useState<number>(5)
    const [revText, setRevText] = useState<string>('')
    const [userName, setUserName] = useState<string>('')
    const [userImage, setUserImage] = useState<string>('')
    const { popupType } = useAppSelector(state => state.PopupReducer)
    const { setPopupType } = popupSlice.actions
    const db = getDatabase()
    const dispatch = useAppDispatch()
    const { id } = useAppSelector(state => state.UserReducer)
    const router = useRouter()
    const { langtype } = useAppSelector(state => state.LangReducer)

    /* Получаем данные о пользователе */
    useEffect(() => {
        if(id){
            onValue(ref(db, `users/${id}/displayName`), (data) => {
                setUserName(data.val())
            })
            onValue(ref(db, `users/${id}/photoUrl`), (data) => {
                setUserImage(data.val())
            })
        }
    }, [id])

    /* Получаем id курса */
    useEffect(() => {
        if(router.query.courseid){
            setCourseId(`${router.query.courseid}`)
        }
    }, [router.query.courseid])

    /* Функция для генерации id комментария */
    const generateId = (prefix: string) => {
        const currentDate = new Date()
        const year = currentDate.getFullYear()
        const month = String(currentDate.getMonth() + 1).padStart(2, '0')
        const day = String(currentDate.getDate()).padStart(2, '0')
        const hours = String(currentDate.getHours()).padStart(2, '0')
        const minutes = String(currentDate.getMinutes()).padStart(2, '0')
        const seconds = String(currentDate.getSeconds()).padStart(2, '0')
        const milliseconds = String(currentDate.getMilliseconds()).padStart(3, '0')
      
        const id = `${prefix}${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
        return id;
    }

    /* Сохраняем комментарий на сервер */
    const handleSubmit = (e: any) => {
        e.preventDefault()
        const commentId = generateId('comment')
        if(revText){
            set(ref(db, `courses/${courseId}/additional/reviews/${commentId}/`), {
                stars: rating,
                text: revText,
                timestamp: Date.now(),
                uid: id
            }).then(() => {
                set(ref(db, `courses/${courseId}/rating/${commentId}`), rating)
            })
            setRevText('')
            setRating(5)
            dispatch(setPopupType(''))
        }
    }
    
    return(
        <div {...props}>
            <div className={cn(styles.wrapper, {[styles.hide]: popupType !== 'addComment'})}
                onClick={() => dispatch(setPopupType(''))}/>
            <div className={cn(styles.container, {[styles.hide]: popupType !== 'addComment'})}>
                <div className={styles.head}>
                    <div className={styles.head__left}>
                        <div className={styles.head__left_ava} style={{backgroundImage: `url(${userImage})`}}/>
                        <div className={styles.head__left_name}>{userName}</div>
                    </div>
                    <div className={styles.head__right}>
                        <div className={styles.head__right_text}>{(langtype=='kz')?"Бағалау:":"Оценка"}</div>
                        <div className={styles.head__right_stars}>
                            <button onClick={() => setRating(1)} className={styles.head__right_star}>
                                <Star3Icon className={styles.head__right_icon}
                                    stroke={(rating>=1)?"#FFA800":"black"} 
                                    strokeOpacity={(rating==1)?"1":"0.75"}
                                />
                            </button>
                            <button onClick={() => setRating(2)} className={styles.head__right_star}>
                                <Star3Icon className={styles.head__right_icon}
                                    stroke={(rating>=2)?"#FFA800":"black"} 
                                    strokeOpacity={(rating==2)?"1":"0.75"}
                                />
                            </button>
                            <button onClick={() => setRating(3)} className={styles.head__right_star}>
                                <Star3Icon className={styles.head__right_icon}
                                    stroke={(rating>=3)?"#FFA800":"black"} 
                                    strokeOpacity={(rating==3)?"1":"0.75"}
                                />
                            </button>
                            <button onClick={() => setRating(4)} className={styles.head__right_star}>
                                <Star3Icon className={styles.head__right_icon}
                                    stroke={(rating>=4)?"#FFA800":"black"} 
                                    strokeOpacity={(rating==4)?"1":"0.75"}
                                />
                            </button>
                            <button onClick={() => setRating(5)} className={styles.head__right_star}>
                                <Star3Icon className={styles.head__right_icon}
                                    stroke={(rating>=5)?"#FFA800":"black"} 
                                    strokeOpacity={(rating==5)?"1":"0.75"}
                                />
                            </button>
                        </div>
                    </div>
                </div>
                <form onSubmit={handleSubmit}>
                    <textarea placeholder={(langtype=='kz')?"Пікір жазыңыз":'Напишите отзыв'} className={styles.textarea} 
                        onChange={(e) => setRevText(e.target.value)} value={revText} required/>
                    <button type='submit' className={styles.submit}>{(langtype=='kz')?"Жіберу":'Отправить'}</button>
                </form>
                <button className={styles.close} onClick={() => dispatch(setPopupType(''))}><CloseIcon className={styles.close__icon}/></button>
            </div>
        </div>
    )
}