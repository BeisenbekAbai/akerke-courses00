import { useAppDispatch, useAppSelector } from '@/store/hooks/redux'
import styles from "./AddResCard.module.scss"
import { popupSlice } from '@/store/reducers/PopupSlice'
import cn from 'classnames'
import { CloseIcon } from '@/public/Icons'
import { useEffect, useState } from 'react'
import { getDatabase, onValue, ref, set } from 'firebase/database'
import { getDownloadURL, getStorage, uploadBytes, ref as sRef } from 'firebase/storage'
import { AddResCardProps } from './AddResCard.props'


export const AddResCard = ({resnum, ...props}: AddResCardProps): JSX.Element => {
    const [isAdmin, setIsAdmin] = useState<boolean>(false)
    const { popupType } = useAppSelector(state => state.PopupReducer)
    const { id } = useAppSelector(state => state.UserReducer)
    const { activeres } = useAppSelector(state => state.ActiveRes)
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

    /* Функция для генерации id */
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

    const handleSubmit = (e: any) => {
        e.preventDefault()
        if(isAdmin){
            const resid = generateId('res')
            let image = new File([e.target.resImage.files[0]], resid, {type: e.target.resImage.files[0].type})
            const uimgPlaceRef = sRef(storage, `resources/${resid}`)
            uploadBytes(uimgPlaceRef, image).then(() => {
                getDownloadURL(uimgPlaceRef).then((url) => {
                    set(ref(db, `resources/content/${activeres}/${resid}/image`), url)
                })
            })
            // @ts-ignore
            const _list = []
            if(`${e.target.resText.value}`.includes('[')){
                `${e.target.resText.value}`.split('[').forEach((el) => {
                    if(el.includes(']')){
                        el.split(']').forEach((el2) => {
                            _list.push(el2.split(';'))
                        })
                    } else {
                        _list.push(el)
                    }
                })
            }
            //@ts-ignore
            const resources = []
            //@ts-ignore
            _list.forEach((el: any) => {
                if(typeof el == 'object' && el.length == 1){
                    resources.push(el[0])
                } else {
                    resources.push(el)
                }
            })
            if(resources.length){
                //@ts-ignore
                set(ref(db, `resources/content/${activeres}/${resid}/text`), resources)
                //@ts-ignore
                console.log(resources)
            } else {
                set(ref(db, `resources/content/${activeres}/${resid}/text`), `${e.target.resText.value}`)
                console.log(e.target.resText.value)
            }
            e.target.resImage.value = null
            e.target.resText.value = ''
            dispatch(setPopupType(''))
        }
    }

    return(
        <div {...props}>
            <div className={cn(styles.wrapper, {[styles.hide]: popupType !== 'addResCard'})}
                onClick={() => dispatch(setPopupType(''))}/>
            <div className={cn(styles.container, {[styles.hide]: popupType !== 'addResCard'})}>
                <div className={styles.article}>Добавить ресурс</div>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <label className={styles.inp__wrapper}>
                        <div className={styles.inp__title}>Картинка для ресурса:</div>
                        <input type='file' accept="image/jpeg, image/png, image/webp" name='resImage' className={styles.inp__img} required/>
                    </label>
                    <label className={styles.inp__wrapper}>
                        <div className={styles.inp__title}>Текст для ресурса:</div>
                        <textarea name="resText" autoComplete='off' className={styles.inp}/>
                    </label>
                    <button type='submit' className={styles.submit}>Сохранить</button>
                </form>
                <button className={styles.close} onClick={() => dispatch(setPopupType(''))}><CloseIcon/></button>
            </div>
        </div>
    )
}