import { Header } from '@/Components/Header/Header'
import styles from './CoursesPage.module.scss'
import cn from 'classnames'
import { useAppSelector } from '@/store/hooks/redux'
import { useEffect, useRef, useState } from 'react'
import { getDatabase, onValue, ref, set } from 'firebase/database'
import { CoursesPageProps } from './CoursesPage.props'
import { Search } from '@/Components/Search/Search'
import { CourseCard } from '@/Components/CourseCard/CourseCard'
import { Sidebar } from '@/Components/Sidebar/Sidebar'




/* Содержание страницы Profile */
export const CoursesPage = ({...props}: CoursesPageProps): JSX.Element => {
    const [userName, setUserName] = useState<string>('')
    const [userImage, setUserImage] = useState<string>('')
    const [isAdmin, setIsAdmin] = useState<boolean>(false)
    const [counter, setCounter] = useState<number>(0)
    const [cardsList, setCardsList] = useState([])
    const [cardsInfo, setCardsInfo] = useState([])
    const { id } = useAppSelector(state => state.UserReducer)
    const { searchWords } = useAppSelector(state => state.SearchReducer)
    const db = getDatabase()

    /* Получаем информацию о пользователе */
    useEffect(() => {
        if(id){
            onValue(ref(db, `users/${id}/displayName`), (data) => {
                setUserName(data.val())
            })
            onValue(ref(db, `users/${id}/photoUrl`), (data) => {
                setUserImage(data.val())
            })
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

    return(
        <div {...props}>
            <Header className={styles.header}/>
            <div className={styles.wrapper}>
                <Sidebar name={userName} image={userImage} page={'courses'} className={styles.sidebar}/>
                <div className={styles.content}>
                    <Search/>
                    <div className={styles.courses__cards}>
                        {cardsList}
                    </div>
                </div>
            </div>
        </div>
    )
}