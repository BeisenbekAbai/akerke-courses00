import { Header } from '@/Components/Header/Header'
import styles from './AddMaterials.module.scss'
import { AddMaterialsProps, CheckboxProps, TitleComponentProps } from './AddMaterials.props'
import { MaterialsPage } from '../MaterialsPage/MaterialsPage'
import { useEffect, useState } from 'react'
import { getDatabase, onValue, ref, set } from 'firebase/database'
import { useRouter } from 'next/router'
import { useAppDispatch, useAppSelector } from '@/store/hooks/redux'
import { activeLessonSlice } from '@/store/reducers/ActiveLesson'
import { Check2Icon, MinusIcon, Plus2Icon } from '@/public/Icons'
import cn from 'classnames'
import { Param } from '@/Components/Param/Param'
import { BigParam } from '@/Components/BigParam/BigParam'
import { popupSlice } from '@/store/reducers/PopupSlice'


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
            <div style={{display: active?'block':'none'}}><Check2Icon/></div>
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


const LinkParamLayout = ({inpList, setInpList, name, title}: any): JSX.Element => {
    const [textType, setTextType] = useState<string>('text')

    const addInput = () => {
        const _list = [...inpList]
        const num = _list.length + 1
        _list.push(
            <BigParam name={`${name}${num}`} title='' required={false}/>
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
                    <BigParam name={`${name}0`} title='' required={false}/>
                </div>
                {inpList}
                <button type='button' onClick={addInput} className={styles.add}><Plus2Icon/></button>
                <button type='button' onClick={deleteInput} className={styles.minus}><MinusIcon/></button>
            </div>
        </div>
    )
}


export const AddMaterials = ({...props}: AddMaterialsProps): JSX.Element => {
    const [titleList, setTitleList] = useState([])
    const [titleListData, setTitleListData] = useState([])
    const [resList, setResList] = useState([])
    const [courseId, setCourseId] = useState<string>('')
    const [leslen, setLeslen] = useState<number>(0)
    const router = useRouter()
    const db = getDatabase()
    const dispatch = useAppDispatch()
    const { activeLesson } = useAppSelector(state => state.ActiveLesson)
    const { setActiveLesson } = activeLessonSlice.actions
    const { setPopupType } = popupSlice.actions

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
                    setTitleListData(_list)
                    setLeslen(_list.length)
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


    const nameSubmit = (e: any) => {
        e.preventDefault()
        set(ref(db, `materials/${courseId}/content/${activeLesson}/name`), e.target.name.value)
        set(ref(db, `materials/${courseId}/matList/${activeLesson}`), e.target.name.value)
    }

    const videoSubmit = (e: any) => {
        e.preventDefault()
        set(ref(db, `materials/${courseId}/content/${activeLesson}/link`), e.target.video.value)
    }

    const descSubmit = (e: any) => {
        e.preventDefault()
        set(ref(db, `materials/${courseId}/content/${activeLesson}/desc`), e.target.desc.value)
    }

    const resourcesSubmit = (e: any) => {
        e.preventDefault()
        const resources = []
        //@ts-ignore
        let list2 = []
        let list = [] 
        if(`${e.target.res0.value}`.includes('[')){
            `${e.target.res0.value}`.split('[').forEach((el) => {
                if(el.includes(']')){
                    el.split(']').forEach((el2) => {
                        list2.push(el2.split(';'))
                    })
                } else {
                    list2.push(el)
                }
            })
            //@ts-ignore
            resources.push(list2)
        } else {
            resources.push(`${e.target.res0.value}`)
        }
        set(ref(db, `materials/${courseId}/content/${activeLesson}/resources/`), resources)
        for(let i = 1; i < resList.length+1; i++){
            list2 = []
            list = []
            if(`${e.target[`res${i}`].value}`.includes('[')){
                `${e.target[`res${i}`].value}`.split('[').forEach((el) => {
                    if(el.includes(']')){
                        el.split(']').forEach((el2) => {
                            list2.push(el2.split(';'))
                        })
                    } else {
                        list2.push(el)
                    }
                })
                //@ts-ignore
                resources.push(list2)
            } else {
                resources.push(`${e.target[`res${i}`].value}`)
            }
        }
        set(ref(db, `materials/${courseId}/content/${activeLesson}/resources/`), resources)
    }

    const addVideo = () => {
        dispatch(setActiveLesson(leslen))
    }

    const deleteVideo = () => {
        dispatch(setPopupType('deleteVideo'))
    }
    
    
    return(
        <div {...props}>
            <Header className={styles.header}/>
            <div className={styles.wrapper}>
                <div className={styles.container}>
                    <div className={styles.editor}>
                        <form onSubmit={nameSubmit}>
                            <BigParam name={'name'} title={'Название:'}/>
                            <button className={styles.submit}>Сохранить</button>
                        </form>
                        <form onSubmit={videoSubmit} className={styles.form}>
                            <BigParam name={'video'} title={'Ссылка на видео:'}/>
                            <button className={styles.submit}>Сохранить</button>
                        </form>
                        <form onSubmit={descSubmit} className={styles.form}>
                            <BigParam name={'desc'} title={'Описание:'} required={false}/>
                            <button className={styles.submit}>Сохранить</button>
                        </form>
                        <form onSubmit={resourcesSubmit} className={styles.form}>
                            <LinkParamLayout inpList={resList} setInpList={setResList} name='res' title='Ресурсы:'/>
                            <button className={styles.submit}>Сохранить</button>
                        </form>
                        <button className={styles.delete} onClick={deleteVideo}>Удалить урок</button>
                    </div>
                    <MaterialsPage withHeader={false} withNavbar={false} style={{marginTop: '50px'}}/>
                </div>
                <div className={styles.matlist__wrapper}>
                    <div className={styles.matlist__head}>Материалы курса</div>
                    <div className={styles.matlist}>
                        {titleList}
                        <button onClick={addVideo} className={styles.plus}><Plus2Icon/></button>
                    </div>
                </div>
            </div>
        </div>
    )
}