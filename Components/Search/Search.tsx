import { SearchIcon } from '@/public/Icons'
import styles from './Search.module.scss'
import { SearchProps } from './Search.props'
import { useAppDispatch, useAppSelector } from '@/store/hooks/redux'
import { searchSlice } from '@/store/reducers/SearchSlice'



export const Search = ({...props}: SearchProps): JSX.Element => {
    const dispatch = useAppDispatch()
    const { setSearchWords } = searchSlice.actions
    const { langtype } = useAppSelector(state => state.LangReducer)


    const handleSubmit = (e: any) => {
        e.preventDefault()
        dispatch(setSearchWords(e.target.courseName.value))
    }

    return(
        <div {...props}>
            <form onSubmit={handleSubmit} className={styles.wrapper}>
                <button type='submit' className={styles.submit}>{(langtype=='kz')?"Іздеу":"Искать"}</button>
                <input type="text" name="courseName" id='courseName' placeholder={(langtype=='kz')?"Курс тақырыбы, аты...":'Название, тема курса...'} className={styles.text} autoComplete='off'/>
                <label htmlFor='courseName'><SearchIcon className={styles.icon}/></label>
            </form>
        </div>
    )
}