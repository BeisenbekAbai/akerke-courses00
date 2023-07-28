import { useAppDispatch, useAppSelector } from '@/store/hooks/redux'
import styles from './HowGoPop.module.scss'
import { popupSlice } from '@/store/reducers/PopupSlice'
import cn from 'classnames'
import { CloseIcon } from '@/public/Icons'
import { useEffect, useState } from 'react'
import { getDatabase, onValue, ref, set } from 'firebase/database'
import { HowGoPopProps } from './HowGoPop.props'
import { getDownloadURL, getStorage, uploadBytes, ref as sRef } from 'firebase/storage'




export const HowGoPop = ({...props}: HowGoPopProps): JSX.Element => {
    const [isAdmin, setIsAdmin] = useState<boolean>(false)
    const { popupType } = useAppSelector(state => state.PopupReducer)
    const { id } = useAppSelector(state => state.UserReducer)
    const { setPopupType } = popupSlice.actions
    const db = getDatabase()
    const storage = getStorage()
    const dispatch = useAppDispatch()

    useEffect(() => {
        if(id){
            onValue(ref(db, `users/${id}/isAdmin`), (data) => {
                if(data.val()){
                    setIsAdmin(data.val())
                }
            })
        }
    }, [id])

    const handleSubmit = (e: any) => {
        e.preventDefault()
        if(isAdmin){
            for(let i = 0; i < 3; i++){
                let image = new File([e.target[`howGoBanner${i}`].files[0]], `howGoBanner${i+1}`, { type: e.target[`howGoBanner${i}`].files[0].type })
                const uimgPlaceRef = sRef(storage, `howGo/howGoBanner${i+1}`)
                uploadBytes(uimgPlaceRef, image).then(() => {
                    getDownloadURL(uimgPlaceRef).then((url) => {
                        set(ref(db, `howGo/howGoBanner${i}`), url)
                    })
                })
            }
        }
    }
    
    return(
        <div {...props}>
            <div className={cn(styles.wrapper, {[styles.hide]: popupType !== 'howGo'})}
                onClick={() => dispatch(setPopupType(''))}/>
            <div className={cn(styles.container, {[styles.hide]: popupType !== 'howGo'})}>
                <div className={styles.article}>Изменить "как пройдет курс"</div>
                <form onSubmit={handleSubmit}>
                    <div className={styles.list}>
                        <div className={styles.list__inp2}>
                            <input type='file' accept="image/jpeg, image/png, image/webp" name={`howGoBanner0`} required/>
                        </div>
                        <div className={styles.list__inp}>
                            <input type='file' accept="image/jpeg, image/png, image/webp" name={`howGoBanner1`} required/>
                        </div>
                        <div className={styles.list__inp}>
                            <input type='file' accept="image/jpeg, image/png, image/webp" name={`howGoBanner2`} required/>
                        </div>
                    </div>
                    <button className={styles.submit}>Сохранить</button>
                </form>
                <button className={styles.close} onClick={() => dispatch(setPopupType(''))}><CloseIcon/></button>
            </div>
        </div>
    )
}