import { AddMaterials } from "@/Layout/AddMaterials/AddMaterials"
import { MaterialsPage } from "@/Layout/MaterialsPage/MaterialsPage"
import { useAppSelector } from "@/store/hooks/redux"
import { getDatabase, onValue, ref } from "firebase/database"
import { useEffect, useState } from "react"




export const SubscriptionLayout = (): JSX.Element => {
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
        <>
            <AddMaterials style={{display: isAdmin?'block':'none'}}/>
            <MaterialsPage style={{display: isAdmin?'none':'block'}}/>
        </>
    )
}