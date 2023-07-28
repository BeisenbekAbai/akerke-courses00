import { useEffect, useState } from "react"
import { InputFieldProps } from "./InputField.props"
import styles from './InputField.module.scss'
import cn from 'classnames'




export const InputField = ({title, type, name, showPassword, autofill, ...props}: InputFieldProps): JSX.Element => {
    const [inpText, setInpText] = useState<string>('')
    const [_type, _setType] = useState<string>('')

    useEffect(() => {
        if(type=='password'){
            if(showPassword){
                _setType('text')
            } else {
                _setType('password')
            }
        } else {
            _setType(type)
        }
    },[showPassword])

    useEffect(() => {
        if(autofill){
            setInpText(autofill)
        }
    }, [autofill])

    return(
        <label className={styles.labels__label} {...props}>
            <input type={_type} name={name} className={styles.input}
                onChange={(e) => setInpText(e.target.value)} value={inpText} required/>
            <div className={cn(styles.input__title, {[styles.input__title_active]: inpText != ''})}>{title}</div>
        </label>
    )
}