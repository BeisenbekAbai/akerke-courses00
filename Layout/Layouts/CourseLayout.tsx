import { AddCoursePage } from "@/Layout/AddCoursePage/AddCoursePage"
import { CourseAboutPage } from "@/Layout/CourseAbotPage/CourseAboutPage"
import { useAppSelector } from "@/store/hooks/redux"
import { getDatabase, onValue, ref } from "firebase/database"
import { useEffect, useState } from "react"
import { LayoutProps } from "./Layouts.props"



export const CourseLayout = ({cid, ...props}: LayoutProps): JSX.Element => {
    const [isAdmin, setIsAdmin] = useState<boolean>(false)
    const { id } = useAppSelector(state => state.UserReducer)
    const db = getDatabase()

    useEffect(() => {
        if(id){
            onValue(ref(db, `users/${id}/isAdmin`), (data) => {
                setIsAdmin(data.val())
            })
        }
    }, [id])

    
    return(
        <div {...props}>
            <AddCoursePage courseId={cid} style={{display: isAdmin?'block':'none'}}/>
            <CourseAboutPage cid={cid} style={{display: isAdmin?'none':'block'}}/>
        </div>
    )
}