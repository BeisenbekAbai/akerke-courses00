import { useAppDispatch, useAppSelector } from '@/store/hooks/redux'
import styles from './DeleteVideo.module.scss'
import { popupSlice } from '@/store/reducers/PopupSlice'
import cn from 'classnames'
import { CloseIcon } from '@/public/Icons'
import { useEffect, useState } from 'react'
import { getDatabase, ref, set } from 'firebase/database'
import { useRouter } from 'next/router'
import { DeleteVideoProps } from './DeleteVideo.props'



export const DeleteVideo = ({...props}: DeleteVideoProps): JSX.Element => {
    const [courseId, setCourseId] = useState<string>('')
    const { popupType } = useAppSelector(state => state.PopupReducer)
    const { activeLesson } = useAppSelector(state => state.ActiveLesson)
    const { id } = useAppSelector(state => state.UserReducer)
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
        set(ref(db, `materials/${courseId}/content/${activeLesson}`), null)
        set(ref(db, `materials/${courseId}/matList/${activeLesson}`), null)
        set(ref(db, `users/${id}/completedLessons/${courseId}/vid${activeLesson}`), null)
        dispatch(setPopupType(''))
    }
    
    return(
        <div {...props}>
            <div className={cn(styles.wrapper, {[styles.hide]: popupType !== 'deleteVideo'})}
                onClick={() => dispatch(setPopupType(''))}/>
            <div className={cn(styles.container, {[styles.hide]: popupType !== 'deleteVideo'})}>
                <div className={styles.article}>Вы действительно хотите удалить видео?</div>
                <div className={styles.btns}>
                    <button className={styles.btns__btn1} onClick={() => dispatch(setPopupType(''))}>Отмена</button>
                    <button className={styles.btns__btn2}
                        onClick={deleteCourse}>Подтвердить</button>
                </div>
                <button className={styles.close} onClick={() => dispatch(setPopupType(''))}><CloseIcon/></button>
            </div>
        </div>
    )
}