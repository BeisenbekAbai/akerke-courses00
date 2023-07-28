import { useEffect, useState } from 'react'
import styles from './ResCard.module.scss'
import { ResCardProps } from './ResCard.props'
import { useAppSelector } from '@/store/hooks/redux'
import { getDatabase, onValue, ref, set } from 'firebase/database'
import { DeleteIcon, EditorIcon } from '@/public/Icons'
import { ref as sRef, getStorage, deleteObject } from 'firebase/storage'
import cn from 'classnames'



export const ResCard = ({text, image, resid, resTheme, ...props}: ResCardProps): JSX.Element => {
    const [isAdmin, setIsAdmin] = useState<boolean>(false)
    const [_text, _setText] = useState(null)
    const { id } = useAppSelector(state => state.UserReducer)
    const db = getDatabase()
    const storage = getStorage()

    useEffect(() => {
        if(typeof text == 'string'){
            _setText(
                //@ts-ignore
                <span>{text}</span>
            )
        } else if(text) {
            //@ts-ignore
            const _list = []
            //@ts-ignore
            text.forEach((el) => {
                if(typeof el == 'object'){
                    _list.push(
                        <a href={el[1]} target='_blank' key={`rescard${el[1]}`}>{el[0]}</a>
                    )
                } else {
                    _list.push(
                        <span key={`rescard${el}`}>{el}</span>
                    )
                }
            })
            //@ts-ignore
            _setText(_list)
        }
    }, [text])


    useEffect(() => {
        if(id){
            onValue(ref(db, `users/${id}/isAdmin`), (data) => {
                setIsAdmin(data.val())
            })
        }
    }, [id])


    const deleteRes = () => {
        set(ref(db, `resources/content/${resTheme}/${resid}`), null)
        deleteObject(sRef(storage, `resources/${resid}`))
    }


    return(
        <div className={styles.resources__card} key={`rescard${resid}`}>
            <button className={cn(styles.delete, {[styles.hide]: !isAdmin})} onClick={deleteRes}><DeleteIcon/></button>
            <div className={styles.resources__card_image} style={{backgroundImage: `url(${image})`}}/>
            <div className={styles.resources__card_text}>{_text}</div>
        </div>
    )
}