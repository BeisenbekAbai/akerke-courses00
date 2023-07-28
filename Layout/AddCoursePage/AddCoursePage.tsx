import { Header } from '@/Components/Header/Header'
import { CourseAboutPage } from '../CourseAbotPage/CourseAboutPage'
import styles from './AddCoursePage.module.scss'
import { AddCourseProps } from './AddCoursePage.props'
import { useEffect, useRef, useState } from 'react'
import { getDatabase, onValue, ref, set } from 'firebase/database'
import { getStorage, uploadBytes, ref as sRef, getDownloadURL } from 'firebase/storage'
import { useAppDispatch, useAppSelector } from '@/store/hooks/redux'
import { MinusIcon, Plus2Icon } from '@/public/Icons'
import cn from 'classnames'
import { popupSlice } from '@/store/reducers/PopupSlice'
import { Param } from '@/Components/Param/Param'
import { BigParam } from '@/Components/BigParam/BigParam'




//@ts-ignore
const ColorfulParam = ({inpList, setInpList, name, title}): JSX.Element => {

    const addInput = () => {
        const _list = [...inpList]
        const num = _list.length + 1
        _list.push(
            <div className={styles.withColor} key={`${name}${num}`}>
                <BigParam name={`${name}${num}`} title=''/>
                <select name={`${name}col${num}`} className={styles.withColor__opt}>
                    <option value='black'>Черный</option>
                    <option value='red'>Красный</option>
                    <option value='blue'>Синий</option>
                    <option value='yellow'>Желтый</option>
                </select>
            </div>
        )
        setInpList(_list)
    }

    const deleteInput = () => {
        const _list = [...inpList]
        _list.pop()
        setInpList(_list)
    }

    return(
        <div className={styles.param__wrapper}>
            <div className={styles.param__title}>{title}</div>
            <div>
                <div className={styles.withColor}>
                    <BigParam name={`${name}0`} title=''/>
                    <select name={`${name}col0`} className={styles.withColor__opt}>
                        <option value='black'>Черный</option>
                        <option value='red'>Красный</option>
                        <option value='blue'>Синий</option>
                        <option value='yellow'>Желтый</option>
                    </select>
                </div>
                {inpList}
                <button type='button' onClick={addInput} className={styles.add}><Plus2Icon/></button>
                <button type='button' onClick={deleteInput} className={styles.minus}><MinusIcon/></button>
            </div>
        </div>
    )
}



export const AddCoursePage = ({courseId, ...props}: AddCourseProps): JSX.Element => {
    const [userInpImage, setUserInpImage] = useState(null)
    const [userInpImage2, setUserInpImage2] = useState(null)
    const [inpList, setInpList] = useState([])
    const [inpList2, setInpList2] = useState([])
    const [inpList3, setInpList3] = useState([])
    const [tagList, setTagList] = useState([])
    const [tagListActive, setTagListActive] = useState<boolean>(false)
    const db = getDatabase()
    const storage = getStorage()
    const { id } = useAppSelector(state => state.UserReducer)
    const dispatch = useAppDispatch()
    const { setPopupType } = popupSlice.actions

    useEffect(() => {
        if(courseId){
            onValue(ref(db, `courses/coursesList/${courseId}`), (data) => {
                if(data.val()){
                    setTagList(data.val().join(' '))
                    setTagListActive(true)
                }
            })
        }
    }, [courseId])

    const firstSubmit = (e: any) => {
        e.preventDefault()
        set(ref(db, `courses/${courseId}/courseName`), e.target.courseName.value)
        set(ref(db, `courses/${courseId}/description`), e.target.desc.value)
        if(id && userInpImage){
            //@ts-ignore
            const renamedImage = new File([userInpImage], 'courseImage', { type: userInpImage.type })
            const uimgPlaceRef = sRef(storage, `courses/${courseId}/courseImage`)
            uploadBytes(uimgPlaceRef, renamedImage).then(() => {
                getDownloadURL(uimgPlaceRef).then((url) => {
                    set(ref(db, `courses/${courseId}/courseImage`), url).then(() => {
                        setUserInpImage(null)
                    })
                })
            })
        }
        onValue(ref(db, `courses/${courseId}/timestamp`), (data) => {
            if(!data.val()){
                set(ref(db, `courses/${courseId}/timestamp`), Date.now())
            }
        })
        setTagListActive(true)
    }

    const skillsSubmit = (e: any) => {
        e.preventDefault()
        const _list = []
        _list.push(e.target.skill0.value)
        for(let i = 0; i < inpList.length; i++){
            _list.push(e.target[`skill${i+1}`].value)
        }
        set(ref(db, `courses/${courseId}/additional/skills`), _list)
    }

    const addInput = () => {
        const _list = [...inpList]
        const num = _list.length + 1
        _list.push(
            //@ts-ignore
            <BigParam name={`skill${num}`} key={`skill${num}`} title=''/>
        )
        setInpList(_list)
    }

    const deleteInput = () => {
        const _list = [...inpList]
        _list.pop()
        setInpList(_list)
    }

    const materialsSubmit = (e: any) => {
        e.preventDefault()
        set(ref(db, `courses/${courseId}/materials`), e.target.matCard.value)
        const _list = e.target.matPage.value.split('/')
        if(_list.length == 1){
            set(ref(db, `courses/${courseId}/additional/materials/title`), _list[0])
        } else {
            set(ref(db, `courses/${courseId}/additional/materials/title`), _list)
        }
        set(ref(db, `courses/${courseId}/additional/materials/video`), `${e.target.matVideo.value}`.slice(17))
    }

    const teacherSubmit = (e: any) => {
        e.preventDefault()
        const shortList = []
        let _test = {}
        //@ts-ignore
        _test[e.target[`shortcol0`].value] = e.target[`short0`].value
        shortList.push(_test)
        for(let i = 0; i < inpList2.length; i++){
            const test = {}
            //@ts-ignore
            test[e.target[`shortcol${i+1}`].value] = e.target[`short${i+1}`].value
            shortList.push(test)
        }
        set(ref(db, `courses/${courseId}/additional/teacher/short`), shortList)
        const longList = []
        _test = {}
        //@ts-ignore
        _test[e.target[`longcol0`].value] = e.target[`long0`].value
        longList.push(_test)
        for(let i = 0; i < inpList3.length; i++){
            const test = {}
            //@ts-ignore
            test[e.target[`longcol${i+1}`].value] = e.target[`long${i+1}`].value
            longList.push(test)
        }
        set(ref(db, `courses/${courseId}/additional/teacher/long`), longList)
        if(id && userInpImage2){
            //@ts-ignore
            const renamedImage = new File([userInpImage2], 'teahcerImage', { type: userInpImage2.type })
            const uimgPlaceRef = sRef(storage, `courses/${courseId}/teacherImage`)
            uploadBytes(uimgPlaceRef, renamedImage).then(() => {
                getDownloadURL(uimgPlaceRef).then((url) => {
                    set(ref(db, `courses/${courseId}/additional/teacher/image`), url)
                })
            })
        }
    }

    const submitTags = (e: any) => {
        e.preventDefault()
        const _list = e.target.tags.value.split(' ')
        set(ref(db, `courses/coursesList/${courseId}`), _list)
    }

    const deleteCourse = () => {
        dispatch(setPopupType('deleteCourse'))
    }

    return(
        <div {...props}>
            <Header className={styles.header}/>
            <div className={styles.wrapper}>
                <form onSubmit={firstSubmit} className={styles.form}>
                    <Param title='Название курса:' name='courseName'/>
                    <div className={styles.param__wrapper}>
                        <div className={styles.param__title}>Картинка курса:</div>
                        <input type='file' className={styles.param__inp2} accept="image/jpeg, image/png, image/webp"
                            //@ts-ignore
                            onChange={(e) => setUserInpImage(e.target.files[0])}/>
                    </div>
                    <BigParam name='desc' title='Описание курса:'/>
                    <button type='submit' className={styles.submit}>Сохранить</button>
                </form>
                <form onSubmit={skillsSubmit} className={styles.form}>
                    <div className={styles.param__wrapper}>
                        <div className={styles.param__title}>Чему вы научитесь:</div>
                        <div>
                            <BigParam name='skill0' title=''/>
                            {inpList}
                            <button type='button' onClick={addInput} className={styles.add}><Plus2Icon/></button>
                            <button type='button' onClick={deleteInput} className={styles.minus}><MinusIcon/></button>
                        </div>
                    </div>
                    <button type='submit' className={styles.submit}>Сохранить</button>
                </form>
                <form onSubmit={materialsSubmit} className={styles.form}>
                    <Param name='matCard' title='Материалы курса(надпись для карточки):'/>
                    <Param name='matPage' title='Материалы курса(надпись для страницы):'/>
                    <Param name='matVideo' title='Ссылка на отрывок(youtube ссылка):'/>
                    <button type='submit' className={styles.submit}>Сохранить</button>
                </form>
                <form onSubmit={teacherSubmit} className={styles.form}>
                    <div className={styles.param__wrapper}>
                        <div className={styles.param__title}>Картинка преподавателя:</div>
                        <input type='file' className={styles.param__inp2} accept="image/jpeg, image/png, image/webp"
                            //@ts-ignore
                            onChange={(e) => setUserInpImage2(e.target.files[0])}/>
                    </div>
                    <ColorfulParam inpList={inpList2} setInpList={setInpList2} name='short' title='Краткое описание преподавателя:'/>
                    <ColorfulParam inpList={inpList3} setInpList={setInpList3} name='long' title='Длинное описание преподавателя:'/>
                    <button type='submit' className={styles.submit}>Сохранить</button>
                </form>
                <form onSubmit={submitTags} className={cn(styles.form, {[styles.hide]: !tagListActive})}>
                    <div className={cn(styles.warning, {[styles.hide]: tagList.length})}>ВАЖНО: если тегов не будет, то курс не будет отображаться на сайте</div>
                    <BigParam name='tags' title='Теги:' 
                        //@ts-ignore
                        val={tagList}/>
                    <button type='submit' className={styles.submit}>Сохранить</button>
                </form>
                <button className={styles.delete} onClick={deleteCourse}>Удалить курс</button>
            </div>
            <CourseAboutPage headerActive={false} cid={courseId}/>
        </div>
    )
}