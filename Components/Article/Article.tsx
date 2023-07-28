import { Arrow2Icon } from '@/public/Icons'
import styles from './Article.module.scss'
import { ArticleProps } from './Article.props'



export const Article = ({text, ...props}: ArticleProps): JSX.Element => {
    return(
        <div {...props}>
            <div className={styles.wrapper}>
                <span>{text}</span>
                <div className={styles.arrow}><Arrow2Icon className={styles.image}/></div>
            </div>
        </div>
    )
}