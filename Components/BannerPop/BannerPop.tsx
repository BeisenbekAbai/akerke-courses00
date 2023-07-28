import { useAppDispatch, useAppSelector } from '@/store/hooks/redux'
import styles from './BannerPop.module.scss'
import { popupSlice } from '@/store/reducers/PopupSlice'
import cn from 'classnames'
import { CloseIcon, MinusIcon, Plus2Icon } from '@/public/Icons'
import { useEffect, useState } from 'react'
import { getDatabase, onValue, ref, set } from 'firebase/database'
import { useRouter } from 'next/router'
import { BannerPopProps } from './BannerPop.props'
import { getDownloadURL, getStorage, uploadBytes, ref as sRef } from 'firebase/storage'




export const BannerPop = ({...props}: BannerPopProps): JSX.Element => {
    const [isAdmin, setIsAdmin] = useState<boolean>(false)
    const [bannerList, setBannerList] = useState([])
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

    const addInput = () => {
        const _list = [...bannerList]
        const num = _list.length + 1
        _list.push(
            //@ts-ignore
            <div className={styles.list__inp} key={`_banner${num}`}>
                <input type='file' accept="image/jpeg, image/png, image/webp" name={`banner${num}`} required/>
            </div>
        )
        setBannerList(_list)
    }

    const deleteInput = () => {
        const _list = [...bannerList]
        _list.pop()
        setBannerList(_list)
    }

    const handleSubmit = (e: any) => {
        e.preventDefault()
        if(isAdmin){
            set(ref(db, `banners`), null)
            let image = new File([e.target.banner0.files[0]], 'banner0', { type: e.target.banner0.files[0].type })
            const uimgPlaceRef = sRef(storage, `banners/banner0`)
            uploadBytes(uimgPlaceRef, image).then(() => {
                getDownloadURL(uimgPlaceRef).then((url) => {
                    set(ref(db, `banners/banner0`), url)
                })
            })
            for(let i = 0; i < bannerList.length; i++){
                image = new File([e.target[`banner${i+1}`].files[0]], `banner${i+1}`, { type: e.target[`banner${i+1}`].files[0].type })
                const uimgPlaceRef = sRef(storage, `banners/banner${i+1}`)
                uploadBytes(uimgPlaceRef, image).then(() => {
                    getDownloadURL(uimgPlaceRef).then((url) => {
                        set(ref(db, `banners/banner${i+1}`), url)
                    })
                })
            }
        }
    }
    
    return(
        <div {...props}>
            <div className={cn(styles.wrapper, {[styles.hide]: popupType !== 'banner'})}
                onClick={() => dispatch(setPopupType(''))}/>
            <div className={cn(styles.container, {[styles.hide]: popupType !== 'banner'})}>
                <div className={styles.article}>Изменить баннеры</div>
                <form onSubmit={handleSubmit}>
                    <div className={styles.list}>
                        <div className={styles.list__inp2}>
                            <input type='file' accept="image/jpeg, image/png, image/webp" name={`banner0`} required/>
                        </div>
                        {bannerList}
                    </div>
                    <div className={styles.buttons}>
                        <button type='button' onClick={addInput} className={styles.buttons__add}><Plus2Icon/></button>
                        <button type='button' onClick={deleteInput} className={styles.buttons__minus}><MinusIcon/></button>
                    </div>
                    <button className={styles.submit}>Сохранить</button>
                </form>
                <button className={styles.close} onClick={() => dispatch(setPopupType(''))}><CloseIcon/></button>
            </div>
        </div>
    )
}