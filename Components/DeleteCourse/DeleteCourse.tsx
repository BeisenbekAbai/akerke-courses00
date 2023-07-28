import { useAppDispatch, useAppSelector } from '@/store/hooks/redux'
import styles from './DeleteCourse.module.scss'
import { DeleteCourseProps } from './DeleteCourse.props'
import { popupSlice } from '@/store/reducers/PopupSlice'
import cn from 'classnames'
import { CloseIcon, Star3Icon } from '@/public/Icons'
import { useEffect, useRef, useState } from 'react'
import { getDatabase, onValue, ref, set } from 'firebase/database'
import { useRouter } from 'next/router'



export const DeleteCourse = ({...props}: DeleteCourseProps): JSX.Element => {
    const [courseId, setCourseId] = useState<string>('')
    const [text, setText] = useState<string>('')
    const { popupType } = useAppSelector(state => state.PopupReducer)
    const { setPopupType } = popupSlice.actions
    const db = getDatabase()
    const dispatch = useAppDispatch()
    const router = useRouter()

    /* Получаем id курса */
    useEffect(() => {
        if(router.query.courseid){
            setCourseId(`${router.query.courseid}`)
        }
    }, [router.query.courseid])

    const deleteCourse = () => {
        if(text === '1234'){
            set(ref(db, `courses/${courseId}`), null)
            set(ref(db, `courses/coursesList/${courseId}`), null)
            set(ref(db, `materials/${courseId}`), null)
        }
    }
    
    return(
        <div {...props}>
            <div className={cn(styles.wrapper, {[styles.hide]: popupType !== 'deleteCourse'})}
                onClick={() => dispatch(setPopupType(''))}/>
            <div className={cn(styles.container, {[styles.hide]: popupType !== 'deleteCourse'})}>
                <div className={styles.article}>Вы действительно хотите удалить курс?</div>
                <div className={styles.inp__wrapper}>
                    <div className={styles.inp__text}>Что бы подтвердить введите “1234”</div>
                    <input className={styles.inp} placeholder='1234' onChange={(e) => setText(e.target.value)} value={text}/>
                </div>
                <div className={styles.btns}>
                    <button className={styles.btns__btn1} onClick={() => dispatch(setPopupType(''))}>Отмена</button>
                    <button className={cn(styles.btns__btn2, {[styles.btns__btn2_active]: text === '1234'})}
                        onClick={deleteCourse}>Подтвердить</button>
                </div>
                <button className={styles.close} onClick={() => dispatch(setPopupType(''))}><CloseIcon/></button>
            </div>
        </div>
    )
}