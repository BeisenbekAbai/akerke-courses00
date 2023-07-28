import { Header } from '@/Components/Header/Header'
import styles from './CourseAboutPage.module.scss'
import cn from 'classnames'
import { useAppDispatch, useAppSelector } from '@/store/hooks/redux'
import { useEffect, useState } from 'react'
import { getDatabase, onValue, push, ref, set } from 'firebase/database'
import { CourseAboutPageProps } from './CourseAboutPage.props'
import { CheckIcon, Lampicon, Star2Icon, StarIcon, VideoIcon } from '@/public/Icons'
import { CommentCard } from '@/Components/CommentCard/CommentCard'
import { popupSlice } from '@/store/reducers/PopupSlice'




export const CourseAboutPage = ({cid, headerActive=true, ...props}: CourseAboutPageProps): JSX.Element => {
    const [course, setCourse] = useState<any>(null)
    const [revCount, setRevCount] = useState<number>(0)
    const [rating, setRating] = useState<number>(0)
    const [commentsCount, setCommentsCount] = useState<number>(3)
    const [isSub, setIsSub] = useState<boolean>(false)
    const [isAdmin, setIsAdmin] = useState<boolean>(false)
    const [comDataList, setComDataList] = useState([])
    const [comIdList, setComIdList] = useState([])
    const [revList, setRevList] = useState([])
    const [skillList, setSkillList] = useState([])
    const [materials, setMaterials] = useState([])
    const [shortText, setShortText] = useState([])
    const [longText, setLongText] = useState([])
    const [teacherImage, setTeacherImage] = useState<string>('')
    const [videoUrl, setVideoUrl] = useState<string>('')
    const { id } = useAppSelector(state => state.UserReducer)
    const { setPopupType } = popupSlice.actions
    const dispatch = useAppDispatch()
    const db = getDatabase()
    const { langtype } = useAppSelector(state => state.LangReducer)

    useEffect(() => {
        onValue(ref(db, `users/${id}/isAdmin`), (data) => {
            if(data.val()){
                setIsAdmin(true)
            }
        })
    }, [id])

    useEffect(() => {
        if(cid){
            /* Получаем информацию о курсе */
            onValue(ref(db, `courses/${cid}`), (data) => {
                setCourse(data.val())
            })
            /* Получаем список комментариев */
            onValue(ref(db, `courses/${cid}/additional/reviews`), (data) => {
                if(data.val()){
                    //@ts-ignore
                    setComDataList(Object.values(data.val()).reverse())
                    //@ts-ignore
                    setComIdList(Object.keys(data.val()).reverse())
                }
            })
            /* Получаем список "Чему вы научитесь" для автоматической верстки */
            onValue(ref(db, `courses/${cid}/additional/skills`), (data) => {
                const skills = data.val()
                if(skills){
                    //@ts-ignore
                    const _list = []
                    let counter = 0
                    //@ts-ignore
                    skills.forEach(text => {
                        _list.push(
                            <div className={styles.skills__opt} key={`skill${counter}`}>
                                <div><CheckIcon className={styles.skills__opt_icon}/></div>
                                <div className={styles.skills__opt_text}>{text}</div>
                            </div>
                        )
                        counter += 1
                    })
                    setSkillList(
                        //@ts-ignore
                        <div className={styles.skills}>
                            <div className={styles.title}>{(langtype=='kz')?"Сіз не үйренесіз":"Чему вы научитесь"}</div>
                            <div className={styles.skills__box}>
                                {
                                    //@ts-ignore
                                    _list
                                }
                            </div>
                        </div>
                    )
                }
            })
            /* Автоматический верстаем заголовок для "Материалы курса" */
            onValue(ref(db, `courses/${cid}/additional/materials`), (data) => {
                if(data.val()){
                    setVideoUrl(data.val().video)
                }
                const title = data.val()?.title
                const _list = []
                if(typeof title === 'object'){
                    for(let i = 0; i < 2; i++){
                        if(i == 0){
                            _list.push(
                                <div key={`mat${i}video`}>
                                    <VideoIcon className={styles.materials__head_icon}/>
                                </div>
                            )
                            //@ts-ignore
                            title[i].split(' ').forEach(word => {
                                if(!isNaN(Number(word))){
                                    _list.push(
                                        <div className={styles.materials__head_red} key={`mat${i}${word}`}>{word}</div>
                                    )
                                } else {
                                    _list.push(
                                        <div className={styles.materials__head_black} key={`mat${i}${word}`}>{word}</div>
                                    )
                                }
                            })
                            _list.push(
                                <div className={styles.materials__head_line} key={`mat${i}$line`}>/</div>
                            )
                        } else {
                            _list.push(
                                <div key={`mat${i}lamp`}><Lampicon className={styles.materials__head_icon}/></div>
                            )
                            //@ts-ignore
                            title[i].split(' ').forEach(word => {
                                if(!isNaN(Number(word))){
                                    _list.push(
                                        <div className={styles.materials__head_red} key={`mat${i}${word}`}>{word}</div>
                                    )
                                } else {
                                    _list.push(
                                        <div className={styles.materials__head_black} key={`mat${i}${word}`}>{word}</div>
                                    )
                                }
                            })
                        }
                    }
                } else {
                    _list.push(
                        <div className={styles.materials__head_icon} key={`matvideo`}><VideoIcon/></div>
                    )
                    if(title){
                        //@ts-ignore
                        title.split(' ').forEach(word => {
                            if(!isNaN(Number(word))){
                                _list.push(
                                    <div className={styles.materials__head_red} key={`mat${word}`}>{word}</div>
                                )
                            } else {
                                _list.push(
                                    <div className={styles.materials__head_black} key={`mat${word}`}>{word}</div>
                                )
                            }
                        })
                    }
                }
                //@ts-ignore
                setMaterials(_list)
            })
            onValue(ref(db, `courses/${cid}/additional/teacher`), (data) => {
                let short = null
                let long = null
                if(data.val()){
                    short = data.val().short
                    long = data.val().long
                    setTeacherImage(data.val().image)
                }
                //@ts-ignore
                const _shortList = []
                //@ts-ignore
                const _longList = []
                if(short){
                    //@ts-ignore
                    short.forEach(miniText => {
                        const color = Object.keys(miniText)[0]
                        const _text = Object.values(miniText)[0]
                        if(color == 'blue'){
                            _shortList.push(
                                <span className={styles.teacher__blue}>{`${_text}`}</span>
                            )
                        } else if (color == 'red'){
                            _shortList.push(
                                <span className={styles.teacher__red}>{`${_text}`}</span>
                            )
                        } else if (color == 'yellow'){
                            _shortList.push(
                                <span className={styles.teacher__yellow}>{`${_text}`}</span>
                            )
                        } else {
                            _shortList.push(
                                <span className={styles.teacher__black}>{`${_text}`}</span>
                            )
                        }
                    })
                    //@ts-ignore
                    setShortText(_shortList)
                }
                if(long){
                    //@ts-ignore
                    long.forEach(miniText => {
                        const color = Object.keys(miniText)[0]
                        const _text = Object.values(miniText)[0]
                        if(color == 'blue'){
                            _longList.push(
                                <span className={styles.teacher__blue}>{`${_text}`}</span>
                            )
                        } else if (color == 'red'){
                            _longList.push(
                                <span className={styles.teacher__red}>{`${_text}`}</span>
                            )
                        } else if (color == 'yellow'){
                            _longList.push(
                                <span className={styles.teacher__yellow}>{`${_text}`}</span>
                            )
                        } else {
                            _longList.push(
                                <span className={styles.teacher__black}>{`${_text}`}</span>
                            )
                        }
                    })
                    //@ts-ignore
                    setLongText(_longList)
                }
            })
        }
    }, [cid])


    /* Автоматический верстаем список комментариев */
    useEffect(() => {
        const _list = []
        if(comIdList){
            setRevCount(comIdList.length)
            for(let i = 0; i < Math.min(commentsCount, comIdList.length); i++){
                _list.push(
                    <CommentCard
                        //@ts-ignore
                        timestamp={comDataList[i]?.timestamp} stars={comDataList[i]?.stars}
                        //@ts-ignore
                        text={comDataList[i]?.text} uid={comDataList[i]?.uid} commentid={comIdList[i]}
                        cid={cid} key={comIdList[i]}
                    />
                )
            }
            //@ts-ignore
            setRevList(_list)
        }
    }, [comIdList, commentsCount])

    /* При нажатии на "Оставить комментарии" */
    const handleAddComment = () => {
        if(id){
            dispatch(setPopupType('addComment'))
        } else {
            dispatch(setPopupType('login'))
        }
    }


    /* Считаем среднюю оценку рейтинга */
    useEffect(() => {
        if(course?.rating){
            const _list = Object.values(course?.rating)
            //@ts-ignore
            const rounded = Math.round(_list.reduce((partialSum, a) => partialSum + a, 0) / _list.length * 10) / 10
            setRating(rounded)
        }
    }, [course])



    useEffect(() => {
        if(id && cid){
            onValue(ref(db, `users/${id}/subscribes/${cid}`), (data) => {
                setIsSub(data.val())
            })
        }
    }, [id, cid])
    const handleSubscribe = () => {
        if(id){
            if(isSub && cid){
                set(ref(db, `users/${id}/subscribes/${cid}`), null)
                setIsSub(false)
            } else {
                set(ref(db, `users/${id}/subscribes/${cid}`), true)
                setIsSub(true)
            }
        } else {
            dispatch(setPopupType('login'))
        }
    }


    const goToMaterials = () => {
        const currentDomain = window.location.hostname
        if(currentDomain === 'localhost'){
            window.location.href = `http://${window.location.hostname}:3000/subscriptions/${cid}`
        } else {
            window.location.href = `https://${window.location.hostname}/subscriptions/${cid}`
        }
    }


    return(
        <div {...props}>
            <Header className={cn(styles.header, {[styles.hide]: !headerActive})}/>
            <div className={styles.wrapper}>
                <div className={styles.name2}>{course?.courseName}</div>
                <div className={styles.mobileVers}>
                    <div>
                        <div className={styles.image2} style={{backgroundImage: `url(${course?.courseImage})`}}/>
                        <div className={styles.buttons2}>
                            <button className={cn(styles.subscribe, {[styles.subscribe__active]: isSub})}
                                onClick={handleSubscribe}>{isSub?((langtype=='kz')?"Сіз жазылдыңыз":"Вы подписаны"):((langtype=='kz')?"Жазылу":"Подписаться")}</button>
                            <button className={cn(styles.gotobtn, {[styles.hide]: !isSub&&!isAdmin})} onClick={goToMaterials}>{(langtype=='kz')?"Курсқа өту":"Перейти на курс"}</button>
                        </div>
                    </div>
                    <div className={styles.about2}>
                        <div className={styles.about2__text}>{course?.description}</div>
                    </div>
                </div>
                <div className={styles.left}>
                    <div className={styles.image} style={{backgroundImage: `url(${course?.courseImage})`}}/>
                    <div className={styles.buttons}>
                        <button className={cn(styles.subscribe, {[styles.subscribe__active]: isSub})}
                            onClick={handleSubscribe}>{isSub?((langtype=='kz')?"Сіз жазылдыңыз":"Вы подписаны"):((langtype=='kz')?"Жазылу":"Подписаться")}</button>
                        <button className={cn(styles.gotobtn, {[styles.hide]: !isSub&&!isAdmin})} onClick={goToMaterials}>{(langtype=='kz')?"Курсқа өту":"Перейти на курс"}</button>
                    </div>
                    <div className={styles.reviews}>
                        <div className={styles.title}>{(langtype=='kz')?"Бағалары мен шолулары":"Оценки и отзывы"}</div>
                        <div className={styles.reviews__rating}>
                            <div className={styles.reviews__rating_text}>{rating}</div>
                            <div className={styles.reviews__rating_stars}>
                                <Star2Icon className={styles.reviews__rating_star}
                                    stroke={(rating>=1)?"#FFA800":"black"} 
                                    strokeOpacity={(course?.rating>=1)?"1":"0.75"}
                                />
                                <Star2Icon className={styles.reviews__rating_star}
                                    stroke={(rating>=2)?"#FFA800":"black"}
                                    strokeOpacity={(rating>=2)?"1":"0.75"}
                                />
                                <Star2Icon className={styles.reviews__rating_star}
                                    stroke={(rating>=3)?"#FFA800":"black"}
                                    strokeOpacity={(rating>=3)?"1":"0.75"}
                                />
                                <Star2Icon className={styles.reviews__rating_star}
                                    stroke={(rating>=4)?"#FFA800":"black"}
                                    strokeOpacity={(rating>=4)?"1":"0.75"}
                                />
                                <Star2Icon className={styles.reviews__rating_star}
                                    stroke={(rating==5)?"#FFA800":"black"}
                                    strokeOpacity={(rating==5)?"1":"0.75"}
                                />
                            </div>
                        </div>
                        <div className={styles.reviews__count}>
                            {revCount}
                            {(revCount==1)?((langtype=='kz')?" шолу":" отзыв"):((langtype=='kz')?" шолулар":" отзыва")}
                        </div>
                        <div className={styles.reviews__list}>
                            {revList}
                        </div>
                        <div className={styles.reviews__buttons}>
                            <button className={cn(styles.reviews__buttons_more, {[styles.hide]: revCount <= commentsCount})} 
                                onClick={() => setCommentsCount(commentsCount + 10)}>
                                {(langtype=='kz')?"Көбірек көрсету":"Показать больше"}
                            </button>
                            <button className={styles.reviews__buttons_add} onClick={handleAddComment}>{(langtype=='kz')?"Пікір қалдыру":"Оставить отзыв"}</button>
                        </div>
                    </div>
                </div>
                <div className={styles.right}>
                    <div className={styles.name}>{course?.courseName}</div>
                    <div className={styles.about}>
                        <div className={styles.title}>{(langtype=='kz')?"Бұл курс не туралы?":"Про что этот курс?"}</div>
                        <div className={styles.about__text}>{course?.description}</div>
                    </div>
                    {skillList}
                    <div className={styles.materials}>
                        <div className={styles.title}>{(langtype=='kz')?"Курс материалдары":"Материалы курса"}</div>
                        <div className={styles.materials__head}>{materials}</div>
                        <div className={styles.materials__title}>{(langtype=='kz')?"Дәрістен үзінді:":"Отрывок из лекции:"}</div>
                        <div className={styles.materials__video}>
                            <iframe style={{aspectRatio: "16 / 9"}} width="100%"
                                src={`https://www.youtube.com/embed/${videoUrl}`}
                                title="YouTube video player" frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; showinfo=0"
                                allowFullScreen rel='0'
                            />
                        </div>
                    </div>
                    <div className={styles.teacher}>
                        <div className={styles.title}>{(langtype=='kz')?"Оқытушы":"Преподаватель"}</div>
                        <div className={styles.teacher__profile}>
                            <div className={styles.teacher__ava} style={{backgroundImage: `url(${teacherImage})`}}/>
                            <div className={styles.teacher__short}>{shortText}</div>
                        </div>
                        <div className={styles.teacher__long}>{longText}</div>
                    </div>
                </div>
                <div className={styles.reviews2}>
                    <div className={styles.title}>{(langtype=='kz')?"Бағалары мен шолулары":"Оценки и отзывы"}</div>
                    <div className={styles.reviews__rating}>
                        <div className={styles.reviews__rating_text}>{rating}</div>
                        <div className={styles.reviews__rating_stars}>
                            <Star2Icon className={styles.reviews__rating_star}
                                stroke={(rating>=1)?"#FFA800":"black"} 
                                strokeOpacity={(course?.rating>=1)?"1":"0.75"}
                            />
                            <Star2Icon className={styles.reviews__rating_star}
                                stroke={(rating>=2)?"#FFA800":"black"}
                                strokeOpacity={(rating>=2)?"1":"0.75"}
                            />
                            <Star2Icon className={styles.reviews__rating_star}
                                stroke={(rating>=3)?"#FFA800":"black"}
                                strokeOpacity={(rating>=3)?"1":"0.75"}
                            />
                            <Star2Icon className={styles.reviews__rating_star}
                                stroke={(rating>=4)?"#FFA800":"black"}
                                strokeOpacity={(rating>=4)?"1":"0.75"}
                            />
                            <Star2Icon className={styles.reviews__rating_star}
                                stroke={(rating==5)?"#FFA800":"black"}
                                strokeOpacity={(rating==5)?"1":"0.75"}
                            />
                        </div>
                    </div>
                    <div className={styles.reviews__count}>
                        {revCount}
                        {(revCount==1)?" отзыв":" отзыва"}
                    </div>
                    <div className={styles.reviews__list}>
                        {revList}
                    </div>
                    <div className={styles.reviews__buttons}>
                        <button className={cn(styles.reviews__buttons_more, {[styles.hide]: revCount <= commentsCount})} 
                            onClick={() => setCommentsCount(commentsCount + 10)}>
                            {(langtype=='kz')?"Көбірек көрсету":"Показать больше"}
                        </button>
                        <button className={styles.reviews__buttons_add} onClick={handleAddComment}>{(langtype=='kz')?"Пікір қалдыру":"Оставить отзыв"}</button>
                    </div>
                </div>
            </div>
        </div>
    )
}