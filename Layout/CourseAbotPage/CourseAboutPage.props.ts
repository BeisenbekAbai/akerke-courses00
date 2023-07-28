import { DetailedHTMLProps, HTMLAttributes } from "react";




export interface CourseAboutPageProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    cid: string
    headerActive?: boolean
}