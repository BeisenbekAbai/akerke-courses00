import { Header } from '@/Components/Header/Header'
import styles from './SubscriptionsPage.module.scss'
import cn from 'classnames'
import { useAppSelector } from '@/store/hooks/redux'
import { useEffect, useRef, useState } from 'react'
import { getDatabase, onValue, ref, set } from 'firebase/database'
import { Search } from '@/Components/Search/Search'
import { CourseCard } from '@/Components/CourseCard/CourseCard'
import { Sidebar } from '@/Components/Sidebar/Sidebar'
import { SubscriptionsPageProps } from './SubscriptionsPage.props'
import { Footer } from '@/Components/Footer/Footer'




/* Содержание страницы Profile */
export const SubscriptionsPage = ({...props}: SubscriptionsPageProps): JSX.Element => {
    const [userName, setUserName] = useState<string>('')
    const [userImage, setUserImage] = useState<string>('')
    const [isAdmin, setIsAdmin] = useState<boolean>(false)
    const [counter, setCounter] = useState<number>(0)
    const [cardsList, setCardsList] = useState([])
    const [cardsInfo, setCardsInfo] = useState([])
    const { id } = useAppSelector(state => state.UserReducer)
    const db = getDatabase()
    const { langtype } = useAppSelector(state => state.LangReducer)

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
        onValue(ref(db, `users/${id}/subscribes`), (data) => {
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
                                materials={courseInfo.materials} key={cardsInfo[counter]} goToCourse={true}
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
                                stars={[]} timestamp={courseInfo.timestamp}  goToCourse={true}
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

    return(
        <div {...props}>
            <Header className={styles.header}/>
            <div className={styles.wrapper}>
                <Sidebar className={styles.sidebar} name={userName} image={userImage} page={'subscriptions'}/>
                <div className={styles.content}>
                    <div className={styles.courses__cards}>
                        {cardsList}
                        <div className={cn(styles.nothing, {[styles.hide]: cardsList.length})}>У вас пока что нет подписок</div>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    )
}