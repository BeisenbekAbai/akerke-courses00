import { MoreIcon2, StarIcon } from '@/public/Icons'
import styles from './CommentCard.module.scss'
import { CommentCardProps } from './CommentCard.props'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getDatabase, onValue, ref, set } from 'firebase/database'
import { useAppSelector } from '@/store/hooks/redux'
import cn from 'classnames'



export const CommentCard = ({timestamp, text, uid, stars, commentid, cid, ...props}: CommentCardProps): JSX.Element => {
    const [userName, setUserName] = useState<string>('')
    const [userImage, setUserImage] = useState<string>('')
    const [_text, _setText] = useState<string>('')
    const [maxTextSize, setMaxTextSize] = useState({lines: 4, symbols: 227})
    const [readMore, setReadMore] = useState<boolean>(false)
    const [isAdmin, setIsAdmin] = useState<boolean>(false)
    const [optionsActive, setOptionsActive] = useState<boolean>(false)
    const deleteRef = useRef(null)
    const moreRef = useRef(null)
    const db = getDatabase()
    const { id } = useAppSelector(state => state.UserReducer)
    const { langtype } = useAppSelector(state => state.LangReducer)
    

    useEffect(() => {
        if(uid){
            onValue(ref(db, `users/${uid}/displayName`), (data) => {
                setUserName(data.val())
            })
            onValue(ref(db, `users/${uid}/photoUrl`), (data) => {
                setUserImage(data.val())
            })
        }
    }, [uid])


    useEffect(() => {
        if(id){
            onValue(ref(db, `users/${id}/isAdmin`), (data) => {
                setIsAdmin(data.val())
            })
        }
    }, [id])

    
    /* Делаем дату */
    const parseDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        //@ts-ignore
        const formattedDate = date.toLocaleDateString('ru-RU', options);
        return formattedDate
    }

    /* Делаем текст длиннее при нажатии "читать дальше..." */
    useEffect(() => {
        if(text){
            const lineList = text.split('\n')
            if(lineList.length > maxTextSize.lines){
                const test = []
                for(let i = 0; i < maxTextSize.lines; i++){
                    test.push(lineList[i])
                }
                _setText(test.join('\n') + ' ')
                setReadMore(true)
            } else if(text.length > maxTextSize.symbols + 17){
                _setText(text.slice(0, 210) + ' ')
                setReadMore(true)
            } else {
                _setText(text)
                setReadMore(false)
            }
        }
    }, [maxTextSize])
    const doTextLonger = () => {
        setMaxTextSize({
            lines: maxTextSize.lines + 10,
            symbols: maxTextSize.symbols + 2100
        })
    }


    useEffect(() => {
        if(optionsActive){
            document.addEventListener('click', whereClicked)
        } else {
            document.removeEventListener('click', whereClicked)
        }
    }, [optionsActive])
    //@ts-ignore
    const whereClicked = useCallback((event) => {
        if(event.target != deleteRef.current && event.target != moreRef.current){
            setOptionsActive(false)
        }
    }, [])


    const deleteComment = () => {
        set(ref(db, `courses/${cid}/additional/reviews/${commentid}`), null).then(() => {
            set(ref(db, `courses/${cid}/rating/${commentid}`), null)
        })
        document.removeEventListener('click', whereClicked)
        setOptionsActive(false)
    }


    return(
        <div {...props}>
            <div className={styles.wrapper}>
                <div className={styles.head}>
                    <div className={styles.head__left}>
                        <div className={styles.head__left_ava} 
                            style={{backgroundImage: `url(${userImage})`}}/>
                        <div className={styles.head__left_name}>{userName}</div>
                    </div>
                    <div className={styles.head__right}>
                        <div className={styles.head__right_date}>{parseDate(timestamp)}</div>
                        <div className={styles.head__right_stars}>
                            <StarIcon className={styles.head__right_star}
                                stroke={(stars>=1)?"#FFA800":"black"} 
                                strokeOpacity={(stars>=1)?"1":"0.75"}
                            />
                            <StarIcon className={styles.head__right_star}
                                stroke={(stars>=2)?"#FFA800":"black"}
                                strokeOpacity={(stars>=2)?"1":"0.75"}
                            />
                            <StarIcon className={styles.head__right_star}
                                stroke={(stars>=3)?"#FFA800":"black"}
                                strokeOpacity={(stars>=3)?"1":"0.75"}
                            />
                            <StarIcon className={styles.head__right_star}
                                stroke={(stars>=4)?"#FFA800":"black"}
                                strokeOpacity={(stars>=4)?"1":"0.75"}
                            />
                            <StarIcon className={styles.head__right_star}
                                stroke={(stars==5)?"#FFA800":"black"}
                                strokeOpacity={(stars==5)?"1":"0.75"}
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.text} onClick={() => setOptionsActive(!optionsActive)}>
                    {_text}
                    <button className={cn(styles.text__btn, {[styles.hidden]: !readMore})}
                        onClick={doTextLonger}>{(langtype=='kz')?"ары қарай оқу...":'читать дальше...'}</button>
                </div>
                <button className={cn(styles.more, {[styles.hidden]: uid!==id&&!isAdmin})} 
                    onClick={() => setOptionsActive(!optionsActive)}>
                    <div className={styles.more__layout} ref={moreRef}/>
                    <MoreIcon2 className={styles.more__icon} />
                </button>
                <button className={cn(styles.delete, {[styles.hidden]: !optionsActive})} ref={deleteRef}
                    onClick={deleteComment}>{(langtype=='kz')?"Жою":"Удалить"}</button>
            </div>
        </div>
    )
}