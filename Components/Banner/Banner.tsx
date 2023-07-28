import { useEffect, useState } from 'react'
import styles from './Banner.module.scss'
import { BannerProps } from './Banner.props'
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { EditorIcon } from '@/public/Icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks/redux';
import { popupSlice } from '@/store/reducers/PopupSlice';
import { getDatabase, onValue, ref } from 'firebase/database';
import cn from 'classnames'



export const Banner = ({colors, ...props}: BannerProps): JSX.Element => {
    const [isAdmin, setIsAdmin] = useState<boolean>(false)
    const [imagesList, setImagesList] = useState(null)
    const { popupType } = useAppSelector(state => state.PopupReducer)
    const { id } = useAppSelector(state => state.UserReducer)
    const { setPopupType } = popupSlice.actions
    const dispatch = useAppDispatch()
    const db = getDatabase()

    useEffect(() => {
        if(id){
            onValue(ref(db, `users/${id}/isAdmin`), (data) => {
                if(data.val()){
                    setIsAdmin(data.val())
                }
            })
        }
    }, [id])


    useEffect(() => {
        onValue(ref(db, `banners`), (data) => {
            //@ts-ignore
            const _list = []
            const banners = data.val()
            if(banners){
                const _vals = Object.values(banners)
                //@ts-ignore
                _vals.forEach((link:string) => {
                    _list.push(
                        <SwiperSlide 
                            className={styles.fakeBanner} key={link}
                            style={{backgroundColor: `${link}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                        >
                            <img src={link} className={styles.fakeBanner__img}/>
                        </SwiperSlide>
                    )
                })
            } else if(colors){
                colors.forEach((color:string) => {
                    _list.push(
                        <SwiperSlide
                            className={styles.fakeBanner} key={color}
                            style={{backgroundColor: `${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                        >
                        </SwiperSlide>
                    )
                })
            }
            //@ts-ignore
            setImagesList(_list)
        })
    }, [])


    return(
        <div {...props}>
            <div className={styles.wrapper}>
                <div className={styles.editor__wrapper}>
                    <button className={cn(styles.editor, {[styles.hide]: !isAdmin})}
                        onClick={() => dispatch(setPopupType('banner'))}><EditorIcon/></button>
                </div>
                <Swiper
                    slidesPerView={1}
                    spaceBetween={0}
                    loop={true}
                    pagination={{
                    clickable: true,
                    }}
                    autoplay={{
                        delay: 10000,
                        disableOnInteraction: false,
                    }}
                    modules={[Autoplay, Pagination, Navigation]}
                    className={styles.mySwiper}
                >{imagesList}
                </Swiper>
            </div>
        </div>
    )
}