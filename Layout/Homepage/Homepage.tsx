import { HomepageProps } from "./Homepage.props"
import styles from './Homepage.module.scss'
import { Header } from "@/Components/Header/Header"
import { Banner } from "@/Components/Banner/Banner"
import { Article } from "@/Components/Article/Article"
import { Search } from "@/Components/Search/Search"
import { getDatabase, onValue, ref } from "firebase/database"
import { useEffect, useRef, useState } from "react"
import { CourseCard } from "@/Components/CourseCard/CourseCard"
import { useAppDispatch, useAppSelector } from "@/store/hooks/redux"
import { Arrow4Icon, EditorIcon, Plus2Icon, PlusIcon } from "@/public/Icons"
import cn from 'classnames'
import { popupSlice } from "@/store/reducers/PopupSlice"
import { ResCard } from "@/Components/ResCard/ResCard"
import { activeresSlice } from "@/store/reducers/ActiveRes"
import { Footer } from "@/Components/Footer/Footer"




export const Homepage = ({...props}: HomepageProps): JSX.Element => {
    const [cardsList, setCardsList] = useState([])
    const [cardsInfo, setCardsInfo] = useState([])
    const [howGoList, setHowGoList] = useState([])
    const [resThemes, setResThemes] = useState([])
    const [resList, setResList] = useState([])
    const [resCounter, setResCounter] = useState<number>(0)
    const [counter, setCounter] = useState<number>(0)
    const [isAdmin, setIsAdmin] = useState<boolean>(false)
    const db = getDatabase()
    const { searchWords } = useAppSelector(state => state.SearchReducer)
    const { id } = useAppSelector(state => state.UserReducer)
    const { setPopupType } = popupSlice.actions
    const dispatch = useAppDispatch()
    const resListRef = useRef(null)
    const themeRef = useRef(null)
    const { setActiveRes } = activeresSlice.actions
    const { langtype } = useAppSelector(state => state.LangReducer)


    useEffect(() => {
        if(id){
            onValue(ref(db, `users/${id}/isAdmin`), (data) => {
                setIsAdmin(data.val())
            })
        }
    }, [id])
    
    /* Получаем список id курсов */
    useEffect(() => {
        onValue(ref(db, `courses/coursesList`), (data) => {
            const _data = data.val()
            const cardsids = []
            if(_data){
                const _list = Object.keys(_data).reverse()
                let counter = 0
                for (let i = 0; i < _list.length; i++) {
                    if(counter >= 6 && !isAdmin){
                        break
                    } else if (counter >= 5 && isAdmin){
                        break
                    }
                    cardsids.unshift(_list[i])
                    counter += 1
                }
            }
            //@ts-ignore
            setCardsInfo(cardsids)
            setCardsList([])
            setCounter(0)
        })
    }, [isAdmin])

    /* Создаем карту для каждого курса из списка id */
    useEffect(() => {
        if(cardsInfo.length){
            if(counter < cardsInfo.length){
                onValue(ref(db, `courses/${cardsInfo[counter]}`), (data) => {
                    const _list = []
                    const courseInfo = data.val()
                    if(typeof courseInfo.rating == 'object'){
                        _list.push(
                            <CourseCard 
                                name={courseInfo.courseName} desc={courseInfo.description}
                                image={courseInfo.courseImage} courseId={cardsInfo[counter]} 
                                stars={Object.values(courseInfo.rating)} timestamp={courseInfo.timestamp} 
                                materials={courseInfo.materials} key={cardsInfo[counter]}
                            />
                        )
                        //@ts-ignore
                        setCardsList([_list, ...cardsList])
                        setCounter(counter+1)
                    } else {
                        _list.push(
                            <CourseCard 
                                name={courseInfo.courseName} desc={courseInfo.description}
                                image={courseInfo.courseImage} courseId={cardsInfo[counter]} 
                                stars={[]} timestamp={courseInfo.timestamp} 
                                materials={courseInfo.materials} key={cardsInfo[counter]}
                            />
                        )
                        //@ts-ignore
                        setCardsList([_list, ...cardsList])
                        setCounter(counter+1)
                    }
                })
            } else {
                setCardsList(cardsList)
            }
        }
    }, [cardsInfo, counter])

    /* Меняем список id при использования поиска */
    useEffect(() => {
        if(searchWords){
            const queryList = searchWords.toLowerCase().split(' ')
            onValue(ref(db, `courses/coursesList`), (data) => {
                const courseslist = data.val()
                const cardsid = []
                /* Прокручиваем курсы */
                for (let key in courseslist) {
                    const tagsList = courseslist[key]
                    /* Прокручиваем запросы */
                    for(let query = 0; query < queryList.length; query++){
                        let found = false
                        /* Прокручиваем теги курса */
                        for(let tag = 0; tag < tagsList.length; tag++){
                            if(tagsList[tag].includes(queryList[query])){
                                cardsid.unshift(key)
                                found = true
                                break
                            }
                        }
                        if(found){
                            break
                        }
                    }
                }
                if(cardsid.length){
                    //@ts-ignore
                    setCardsInfo(cardsid)
                    setCardsList([])
                    setCounter(0)
                } else {
                    setCardsList([])
                }
            })
        } else {
            onValue(ref(db, `courses/coursesList`), (data) => {
                const _data = data.val()
                const cardsids = []
                if(_data){
                    const _list = Object.keys(_data).reverse()
                    let counter = 0
                    for (let i = 0; i < _list.length; i++) {
                        if(counter >= 6 && !isAdmin){
                            break
                        } else if (counter >= 5 && isAdmin){
                            break
                        }
                        cardsids.unshift(_list[i])
                        counter += 1
                    }
                }
                //@ts-ignore
                setCardsInfo(cardsids)
                setCardsList([])
                setCounter(0)
            })
        }
    }, [searchWords])

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

    const handleAddCourse = () => {
        const currentDomain = window.location.hostname
        if(currentDomain === 'localhost'){
            window.location.href = `http://${window.location.hostname}:3000/courses/${generateId('course')}`
        } else {
            window.location.href = `https://${window.location.hostname}/courses/${generateId('course')}`
        }
    }

    useEffect(() => {
        onValue(ref(db, `howGo/`), (data) => {
            if(data.val()){
                setHowGoList(Object.values(data.val()))
            }
        })
    }, [])

    useEffect(() => {
        onValue(ref(db, `resources/themeList`), (data) => {
            const themes = data.val()
            const _list = []
            if(themes.length){
                for(let i = 0; i < themes.length; i++){
                    _list.push(
                        <div className={styles.resources__nav_theme} key={`themes${i}`} ref={themeRef}>{themes[i]}</div>
                    )
                }
            }
            //@ts-ignore
            setResThemes(_list)
        })
    }, [])

    useEffect(() => {
        dispatch(setActiveRes(resCounter))
    }, [resCounter])

    useEffect(() => {
        if(resThemes.length){
            onValue(ref(db, `resources/content`), (data) => {
                const content = data.val()
                //@ts-ignore
                const _list = []
                let firstList = true
                if(content){
                    if(Object.keys(content).length){
                        for(let j = 0; j < resThemes.length; j++){
                            if(typeof content[`cont${j}`] === 'object'){
                                let list = content[`cont${j}`]
                                const _miniList = []
                                if(content[`cont${j}`]){
                                    for(let i = 0; i < Object.values(list).length; i++){
                                        _miniList.push(
                                            <ResCard //@ts-ignore
                                                text={Object.values(list)[i].text} image={Object.values(list)[i].image}
                                                resid={Object.keys(list)[i]} resTheme={`${j}`} key={Object.keys(list)[i]}
                                            />
                                        )
                                    }
                                    if(firstList){
                                        _list.push(
                                            <div className={styles.resources__list} ref={resListRef} key={`${_miniList}`}>
                                                {_miniList}
                                            </div>
                                        )
                                        firstList = false
                                    } else {
                                        _list.push(
                                            <div className={styles.resources__list} key={`${_miniList}`}>{_miniList}</div>
                                        )
                                    }
                                }
                            } else {
                                if(firstList){
                                    _list.push(
                                        <div className={styles.resources__list} ref={resListRef} key={`cont${j}`}/>
                                    )
                                    firstList = false
                                } else {
                                    _list.push(
                                        <div className={styles.resources__list} key={`cont${j}`}/>
                                    )
                                }
                            }
                        }
                        // @ts-ignore
                        setResList(_list)
                    }
                } else {
                    setResList([])
                }
            })
        }
    }, [resThemes])

    return(
        <div {...props}>
            <Header className={styles.header}/>
            <div className={styles.wrapper}>
                <Banner className={styles.banner} colors={['#6F6F6F', '#EE3C3F', '#A8D0E6', '#F8E9A1', '#374785']}/>
                <div className={styles.container}>
                    <div className={styles.courses}>
                        <Article text={(langtype=='kz')?"Курстар":"Курсы"}/>
                        <Search className={styles.courses__search}/>
                        <div className={styles.courses__cards}>
                            <div className={cn(styles.courses__add, {[styles.hide]: !isAdmin})} onClick={handleAddCourse}>
                                <PlusIcon/>
                                <div className={styles.courses__add_text}>Добавить курс</div>
                            </div>
                            {cardsList}
                        </div>
                    </div>
                    <div className={styles.info}>
                        <Article text={(langtype=='kz')?"Курстар қалай өтеді":"Как пройдет курс"}/>
                        <button className={cn(styles.info__edit, {[styles.hide]: !isAdmin})}
                            onClick={() => dispatch(setPopupType('howGo'))}><EditorIcon/></button>
                        <div className={styles.info__items}>
                            <div className={styles.info__pict} style={{backgroundImage: `url(${howGoList[0]})`}}/>
                            <div className={styles.info__pict} style={{backgroundImage: `url(${howGoList[1]})`}}/>
                            <div className={styles.info__pict} style={{backgroundImage: `url(${howGoList[2]})`}}/>
                        </div>
                    </div>
                    <div className={styles.resources}>
                        <Article text={(langtype=='kz')?"Ресурстар":"Ресурсы"}/>
                        <button className={cn(styles.resources__edit, {[styles.hide]: !isAdmin})}
                            onClick={() => dispatch(setPopupType('addResource'))}><EditorIcon/></button>
                        <button className={cn(styles.resources__add, {[styles.hide]: !isAdmin})}
                            onClick={() => dispatch(setPopupType('addResCard'))}><Plus2Icon/></button>
                        <div className={styles.resources__nav}>
                            <button
                                className={cn(styles.resources__nav_btn1, {[styles.resources__nav_notActive]: resCounter==0})}
                                onClick={() => {if(resCounter!=0){setResCounter(resCounter-1)}}}
                            >
                                <Arrow4Icon className={styles.resources__nav_arr}/>
                            </button>
                            <div className={styles.resources__nav_themes_wrapper}>
                                <div className={styles.resources__nav_themes} //@ts-ignore
                                    style={{right: `${resCounter*themeRef?.current?.clientWidth}px`}}>{resThemes}</div>
                            </div>
                            <button
                                className={cn(styles.resources__nav_btn2, {[styles.resources__nav_notActive]: resCounter==resThemes.length-1})}
                                onClick={() => {if(resCounter!=resThemes.length-1){setResCounter(resCounter+1)}}}
                            >
                                <Arrow4Icon className={styles.resources__nav_arr}/>
                            </button>
                        </div>
                        <div className={styles.resources__content_wrapper}>
                            <div className={styles.resources__content} //@ts-ignore
                                style={{right: `${resCounter*resListRef?.current?.clientWidth}px`}}>
                                {resList}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    )
}