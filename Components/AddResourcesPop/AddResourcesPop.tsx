import { useAppDispatch, useAppSelector } from '@/store/hooks/redux'
import styles from "./AddResourcesPop.module.scss"
import { popupSlice } from '@/store/reducers/PopupSlice'
import cn from 'classnames'
import { CloseIcon, MinusIcon, Plus2Icon } from '@/public/Icons'
import { useEffect, useState } from 'react'
import { getDatabase, onValue, ref, set } from 'firebase/database'
import { getDownloadURL, getStorage, uploadBytes, ref as sRef } from 'firebase/storage'
import { AddResourcesPopProps, InpProps } from './AddResourcesPop.props'


const Inp = ({name, title, autoFill, ...props}: InpProps): JSX.Element => {
    const [text, setText] = useState<string>('')

    useEffect(() => {
        if(autoFill){
            setText(autoFill)
        }
    }, [autoFill])


    return(
        <div {...props}>
            <label className={styles.inp__wrapper}>
                <div className={styles.inp__title}>{title}</div>
                <input name={name} required className={styles.inp} onChange={(e) => setText(e.target.value)} value={text}/>
            </label>
        </div>
    )
}


export const AddResourcesPop = ({...props}: AddResourcesPopProps): JSX.Element => {
    const [isAdmin, setIsAdmin] = useState<boolean>(false)
    const [inpList, setInpList] = useState([])
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

    useEffect(() => {
        if(isAdmin){
            onValue(ref(db, `resources/themeList`), (data) => {
                const _list = []
                const themes = data.val()
                if(themes.length){
                    for(let i = 0; i < themes.length; i++){
                        _list.push(
                            //@ts-ignore
                            <Inp
                                name={`inp${i}`} key={`inpasdf${i}`}
                                title={`Тема ${i+1}:`} autoFill={themes[i]}
                            />
                        )
                    }
                }
                //@ts-ignore
                setInpList(_list)
            })
        }
    }, [isAdmin])

    const handleSubmit = (e: any) => {
        e.preventDefault()
        const _list = []
        if(isAdmin && inpList.length){
            for(let i = 0; i < inpList.length; i++){
                _list.push(e.target[`inp${i}`].value)
            }
        }
        set(ref(db, `resources/themeList`), _list)
    }

    const addInp = () => {
        const _list = [...inpList]
        _list.push(
            //@ts-ignore
            <Inp name={`inp${inpList.length}`} title={`Тема ${inpList.length+1}:`} key={`inpasdf${inpList.length}`}/>
        )
        setInpList(_list)
    }

    const deleteInp = () => {
        const _list = [...inpList]
        _list.pop()
        setInpList(_list)
    }
    
    return(
        <div {...props}>
            <div className={cn(styles.wrapper, {[styles.hide]: popupType !== 'addResource'})}
                onClick={() => dispatch(setPopupType(''))}/>
            <div className={cn(styles.container, {[styles.hide]: popupType !== 'addResource'})}>
                <div className={styles.article}>Изменить темы для "Ресурсы"</div>
                <form onSubmit={handleSubmit} className={styles.form}>
                    {inpList}
                    <div className={styles.btns}>
                        <button type='button' className={styles.btns__btn1} onClick={addInp}><Plus2Icon/></button>
                        <button type='button' className={styles.btns__btn2} onClick={deleteInp}><MinusIcon/></button>
                    </div>
                    <button type='submit' className={styles.submit}>Сохранить</button>
                </form>
                <button className={styles.close} onClick={() => dispatch(setPopupType(''))}><CloseIcon/></button>
            </div>
        </div>
    )
}