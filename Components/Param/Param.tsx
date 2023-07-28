import styles from './Param.module.scss'
import { ParamProps } from './Param.props'




export const Param = ({title, name}: ParamProps): JSX.Element => {
    return(
        <div className={styles.param__wrapper}>
            <div className={styles.param__title}>{title}</div>
            <input type='text' name={name} className={styles.param__inp} autoComplete='off' required/>
        </div>
    )
}