import { useEffect, useState } from 'react'
import styles from './CourseCard.module.scss'
import { CourseCardProps } from './CourseCard.props'
import { StarIcon } from '@/public/Icons'



export const CourseCard = ({name, desc, image, stars, timestamp, materials, courseId, goToCourse, ...props}: CourseCardProps): JSX.Element => {
    const [text, setText] = useState<string>('')
    const [rating, setRating] = useState<number>(0)
    const [lessons, setLessons] = useState(null)
    
    useEffect(() => {
        if(stars){
            const _list = stars
            //@ts-ignore
            const rounded = Math.round(_list.reduce((partialSum, a) => partialSum + a, 0) / _list.length * 10) / 10
            setRating(rounded)
        }
        if(materials){
            const words = materials.split(' ')
            //@ts-ignore
            const styledWords = []
            words.map(word => {
                if(!isNaN(Number(word))){
                    styledWords.push(
                        <div className={styles.right__materials_red} key={`key${word}`}>{word}</div>
                    )
                } else {
                    styledWords.push(
                        <div className={styles.right__materials_black} key={`key${word}`}>{word}</div>
                    )
                }
            })
            //@ts-ignore
            setLessons(styledWords)
        }
    }, [])
    
    useEffect(() => {
        if(desc.length > 157){
            setText(desc.slice(0, 157) + '...')
        } else {
            setText(desc)
        }
    }, [desc])

    /* Делаем дату */
    const parseDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        //@ts-ignore
        const formattedDate = date.toLocaleDateString('ru-RU', options);
        return formattedDate
    }

    /* Логика для перехода по страницам */
    const goToPage = (page: string) => {
        const currentDomain = window.location.hostname
        if(currentDomain === 'localhost'){
            window.location.href = `http://${window.location.hostname}:3000/${page}`
        } else {
            window.location.href = `https://${window.location.hostname}/${page}`
        }
    }


    return(
        <div {...props}>
            <div className={styles.wrapper} onClick={() => goToPage(goToCourse?`subscriptions/${courseId}`:`courses/${courseId}`)}>
                <div className={styles.left}>
                    <div className={styles.left__img} style={{backgroundImage: `url(${image})`}}/>
                    <div className={styles.left__rating}>
                        <div className={styles.left__rating_int}>{rating}</div>
                        <div className={styles.left__rating_stars}>
                                <StarIcon className={styles.left__rating_star}
                                    stroke={(rating>=1)?"#FFA800":"black"} 
                                    strokeOpacity={(rating>=1)?"1":"0.75"}
                                />
                                <StarIcon className={styles.left__rating_star}
                                    stroke={(rating>=2)?"#FFA800":"black"}
                                    strokeOpacity={(rating>=2)?"1":"0.75"}
                                />
                                <StarIcon className={styles.left__rating_star}
                                    stroke={(rating>=3)?"#FFA800":"black"}
                                    strokeOpacity={(rating>=3)?"1":"0.75"}
                                />
                                <StarIcon className={styles.left__rating_star}
                                    stroke={(rating>=4)?"#FFA800":"black"}
                                    strokeOpacity={(rating>=4)?"1":"0.75"}
                                />
                                <StarIcon className={styles.left__rating_star}
                                    stroke={(rating==5)?"#FFA800":"black"}
                                    strokeOpacity={(rating==5)?"1":"0.75"}
                                />
                        </div>
                    </div>
                    <div className={styles.left__materials}>
                        {lessons}
                    </div>
                </div>
                <div className={styles.right}>
                    <div className={styles.right__name}>{name}</div>
                    <div className={styles.right__text}>{text}</div>
                    <div className={styles.right__date}>{parseDate(parseInt(`${timestamp}`))}</div>
                </div>
            </div>
        </div>
    )
}