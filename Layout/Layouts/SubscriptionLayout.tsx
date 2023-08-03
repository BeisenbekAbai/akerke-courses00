import { AddMaterials } from "@/Layout/AddMaterials/AddMaterials"
import { MaterialsPage } from "@/Layout/MaterialsPage/MaterialsPage"
import { useAppSelector } from "@/store/hooks/redux"
import { getDatabase, onValue, ref } from "firebase/database"
import { useEffect, useState } from "react"
import { LayoutProps } from "./Layouts.props"




export const SubscriptionLayout = ({...props}: LayoutProps): JSX.Element => {
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
            <AddMaterials style={{display: isAdmin?'block':'none'}}/>
            <MaterialsPage style={{display: isAdmin?'none':'block'}}/>
        </div>
    )
}