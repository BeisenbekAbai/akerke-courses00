import styles from './BigParam.module.scss'
import { ParamProps } from './BigParam.props'
import { useState, useRef, useEffect } from 'react'




export const BigParam = ({title, name, val='', _placeholder='', required=true, ...props}: ParamProps): JSX.Element => {
    const [text, setText] = useState<string>('')
    const textRef = useRef(null)

    useEffect(() => {
        if(val){
            setText(val)
        }
    }, [val])

    /* Регулируем высоту текстового поля */
    const handleTextChange = (e: any) => {
        setText(e.target.value)
        if(e){
            e.target.style.height = 'inherit'
            e.target.style.height = `${e.target.scrollHeight}px`
        }
    }

    return(
        <div {...props}>
            <div className={styles.param__wrapper}>
                <div className={styles.param__title}>{title}</div>
                <textarea className={styles.param__textarea} rows={1} name={name} required={required} placeholder={_placeholder}
                    onChange={handleTextChange} ref={textRef} value={text} autoComplete="off"/>
            </div>
        </div>
    )
}