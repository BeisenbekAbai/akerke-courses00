import { Header } from '@/Components/Header/Header'
import styles from './MaterialsPage.module.scss'
import { CheckboxProps, MaterialsPageProps, TitleComponentProps } from './MaterialsPage.props'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { getDatabase, onValue, ref, set } from 'firebase/database'
import cn from 'classnames'
import { Arrow3Icon, Check2Icon } from '@/public/Icons'
import { activeLessonSlice } from '@/store/reducers/ActiveLesson'
import { useAppDispatch, useAppSelector } from '@/store/hooks/redux'
import { Footer } from '@/Components/Footer/Footer'


const Checkbox = ({number, cid}: CheckboxProps): JSX.Element => {
    const [active, setActive] = useState<boolean>(false)
    const { id } = useAppSelector(state => state.UserReducer)
    const db = getDatabase()


    useEffect(() => {
        if(id && cid){
            onValue(ref(db, `users/${id}/completedLessons/${cid}/vid${number}`), (data) => {
                setActive(data.val())
            })
        }
    }, [id, cid])

    return(
        <div className={styles.matlist__checkbox}>
            <div style={{display: active?'block':'none'}}><Check2Icon className={styles.matlist__icon}/></div>
        </div>
    )
}


const TitleComponent = ({text, number, cid}: TitleComponentProps): JSX.Element => {
    const dispatch = useAppDispatch()
    const { activeLesson } = useAppSelector(state => state.ActiveLesson)
    const { setActiveLesson } = activeLessonSlice.actions


    return(
        <div className={cn(styles.matlist__opt, {[styles.matlist__opt_active]: activeLesson == number})}>
            <Checkbox number={number} cid={cid}/>
            <div className={styles.matlist__title} onClick={() => dispatch(setActiveLesson(number))}>
                <div className={styles.matlist__title_num}>{number+1}.</div>
                <div className={styles.matlist__title_txt}>{text}</div>
            </div>
        </div>
    )
}


export const MaterialsPage = ({withHeader=true, withNavbar=true, ...props}: MaterialsPageProps): JSX.Element => {
    const [videoUrl, setVideoUrl] = useState<string>('')
    const [lesname, setLesname] = useState<string>('')
    const [lesdesc, setLesdesc] = useState<string>('')
    const [text, setText] = useState<string>('')
    const [maxTextSize, setMaxTextSize] = useState({lines: 4, symbols: 227})
    const [readMore, setReadMore] = useState<boolean>(false)
    const [courseId, setCourseId] = useState<string>('')
    const [leslen, setLeslen] = useState<number>(0)
    const [completed, setCompleted] = useState<boolean>(false)
    const [titleListData, setTitleListData] = useState([])
    const [titleList, setTitleList] = useState([])
    const [resourcesList, setResourcesList] = useState([])
    const router = useRouter()
    const db = getDatabase()
    const dispatch = useAppDispatch()
    const { activeLesson } = useAppSelector(state => state.ActiveLesson)
    const { setActiveLesson } = activeLessonSlice.actions
    const { id } = useAppSelector(state => state.UserReducer)
    const { langtype } = useAppSelector(state => state.LangReducer)

    /* Получаем ID курса */
    useEffect(() => {
        if(router.query.courseid){
            setCourseId(`${router.query.courseid}`)
        }
    }, [router.query.courseid])


    /* Получаем список названии видеоуроков */
    useEffect(() => {
        if(courseId){
            onValue(ref(db, `materials/${courseId}/matList`), (data) => {
                const _list = data.val()
                if(_list){
                    setLeslen(_list.length)
                    setTitleListData(_list)
                }
            })
        }
    }, [courseId])


    /* Создаем HTML разметку для названии видео */
    useEffect(() => {
        if(titleListData.length && courseId){
            const _list = []
            for(let i = 0; i < titleListData.length; i++){
                _list.push(
                    <TitleComponent text={titleListData[i]} number={i} key={`titlecomp${i}`} cid={courseId}/>
                )
            }
            //@ts-ignore
            setTitleList(_list)
        }
    }, [titleListData, courseId])


    /* Сбрасываем длину текста при переходе на другой видеоурок */
    useEffect(() => {
        setMaxTextSize({lines: 4, symbols: 227})
    }, [activeLesson])


    /* Получаем данные урока */
    useEffect(() => {
        if(courseId){
            onValue(ref(db, `materials/${courseId}/content/${activeLesson}`), (data) => {
                const lesson = data.val()
                if(lesson){
                    setLesname(lesson.name)
                    setLesdesc(lesson.desc)
                    setTitleListData
                    if(lesson.link){
                        setVideoUrl(lesson.link.slice(17))
                    }
                }
            })
        }
    }, [courseId, activeLesson])


    /* Получаем список пройденных уроков пользователем */
    useEffect(() => {
        if(id && courseId){
            onValue(ref(db, `users/${id}/completedLessons/${courseId}/vid${activeLesson}`), (data) => {
                setCompleted(data.val())
            })
        }
    }, [id, courseId, activeLesson])
    /* Сохраняем урок как пройденный при нажатии на кнопку */
    const handleCompleteLesson = () => {
        if(courseId && id && completed){
            set(ref(db, `users/${id}/completedLessons/${courseId}/vid${activeLesson}`), null)
            setCompleted(false)
        } else {
            set(ref(db, `users/${id}/completedLessons/${courseId}/vid${activeLesson}`), true)
            setCompleted(true)
        }
    }


    /* Делаем текст длиннее при нажатии "читать дальше..." */
    useEffect(() => {
        if(lesdesc){
            const lineList = lesdesc.split('\n')
            if(lineList.length > maxTextSize.lines){
                const test = []
                for(let i = 0; i < maxTextSize.lines; i++){
                    test.push(lineList[i])
                }
                setText(test.join('\n') + ' ')
                setReadMore(true)
            } else if(lesdesc.length > maxTextSize.symbols + 17){
                setText(lesdesc.slice(0, 210) + ' ')
                setReadMore(true)
            } else {
                setText(lesdesc)
                setReadMore(false)
            }
        }
    }, [maxTextSize, lesdesc])
    const doTextLonger = () => {
        setMaxTextSize({
            lines: maxTextSize.lines + 10,
            symbols: maxTextSize.symbols + 2100
        })
    }

    /* Создаем HTML разметку для ресурсов под видеоуроком */
    useEffect(() => {
        if(courseId){
            onValue(ref(db, `materials/${courseId}/content/${activeLesson}/resources`), (data) => {
                const _data = data.val()
                const _list = []
                //@ts-ignore
                let _miniList = []
                if(_data){
                    for(let i = 0; i < _data.length; i++){
                        _miniList = []
                        if(typeof _data[i] === 'object'){
                            //@ts-ignore
                            _data[i].forEach(el => {
                                if(typeof el === 'string'){
                                    _miniList.push(
                                        <span key={`reslink${activeLesson}${el}`}>{el}</span>
                                    )
                                } else if(typeof el === 'object'){
                                    _miniList.push(
                                        <a href={el[1]} target='_blank' key={`reslink${activeLesson}${el[1]}`}>{el[0]}</a>
                                    )
                                }
                            })
                            _list.push( //@ts-ignore
                                <div className={styles.resources__text} key={`reslink_wrapper${i}`}>{_miniList}</div>
                            )
                        } else {
                            _list.push(
                                <div className={styles.resources__text} key={`reslink${_data[i]}`}>{_data[i]}</div>
                            )
                        }
                    } //@ts-ignore
                    setResourcesList(_list)
                    console.log(_list[0].props.children)
                }
            })
        }
    }, [courseId, activeLesson])

    useEffect(() => {
        onValue(ref(db, `materials/${courseId}/content/${activeLesson}`), (_data) => {
            const data = _data.val()
            if(!data){
                setLesname('название')
                setVideoUrl('')
                setLesdesc('')
                setText('')
                setResourcesList([])
            } else {
                if(!data.link){
                    setVideoUrl('')
                }
                if(!data.name){
                    setLesname('название')
                }
                if(!data.desc){
                    setLesdesc('')
                    setText('')
                }
                if(!data.resources){
                    setResourcesList([])
                }
            }
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [activeLesson])


    return(
        <div {...props}>
            <Header className={styles.header} style={{display: withHeader?'block':'none'}}/>
            <div className={cn({[styles.wrapper]: withNavbar})}>
                <div className={styles.container}>
                    <div className={styles.video}>
                        <iframe style={{aspectRatio: "16 / 9"}} width="100%"
                            src={`https://www.youtube.com/embed/${videoUrl}`}
                            title="YouTube video player" frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
                            allowFullScreen rel='0'
                        />
                    </div>
                    <div className={styles.lessonName}>{lesname}</div>
                    <div className={styles.desc} style={{display: text?'block':'none'}}>
                        <div className={styles.title}>{(langtype=='kz')?"Сипаттама":"Описание"}</div>
                        <div className={styles.desc__text}>
                            {text}
                        <button className={cn(styles.desc__btn, {[styles.hide]: !readMore})}
                            onClick={doTextLonger}>{(langtype=='kz')?"ары қарай оқу...":"читать дальше..."}</button>
                        </div>
                    </div>
                    <div className={styles.resources__wrapper} //@ts-ignore
                        style={{display: (resourcesList[0]?.props.children)?'block':'none'}}>
                        <div className={styles.title}>{(langtype=='kz')?"Ресурстар":"Ресурсы"}</div>
                        <div className={styles.resources}>
                            {resourcesList}
                        </div>
                    </div>
                    <div className={styles.nav}>
                        <button className={cn(styles.nav__btn, styles.nav__btn1, {[styles.nav__active]: activeLesson != 0})}
                            onClick={() => {if(activeLesson != 0){dispatch(setActiveLesson(activeLesson-1))}}}>
                            <div className={styles.nav__arr1}><Arrow3Icon className={styles.nav__icon} stroke="white"/></div>
                            {(langtype=='kz')?"Алдыңғы сабақ":"Предыдущий урок"}
                        </button>
                        <button 
                            className={cn(styles.nav__btn, styles.nav__btn3, {[styles.nav__btn_active]: completed})}
                            onClick={handleCompleteLesson}>
                            {completed?((langtype=='kz')?"Аяқталды":'Завершено'):((langtype=='kz')?"Аяқтау":'Завершить')}
                        </button>
                        <button className={cn(styles.nav__btn, styles.nav__btn2, {[styles.nav__active]: activeLesson != leslen-1})}
                            onClick={() => {if(activeLesson != leslen-1){dispatch(setActiveLesson(activeLesson+1))}}}>
                            {(langtype=='kz')?"Келесі сабақ":"Следующий урок"}
                            <div className={styles.nav__arr2}><Arrow3Icon className={styles.nav__icon} stroke="white"/></div>
                        </button>
                    </div>
                    <div className={styles.matlist__wrapper2}>
                        <div className={styles.matlist__head}>{(langtype=='kz')?"Курс материалдары":"Материалы курса"}</div>
                        <div className={styles.matlist}>
                            {titleList}
                        </div>
                    </div>
                </div>
                <div style={{display: withNavbar?'block':'none'}}>
                    <div className={styles.matlist__wrapper}>
                        <div className={styles.matlist__head}>{(langtype=='kz')?"Курс материалдары":"Материалы курса"}</div>
                        <div className={styles.matlist}>
                            {titleList}
                        </div>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    )
}