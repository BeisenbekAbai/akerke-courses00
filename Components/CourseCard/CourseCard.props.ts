import { DetailedHTMLProps, HTMLAttributes } from "react";




export interface CourseCardProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    name: string
    desc: string
    image: string
    stars: any
    timestamp: number
    materials: string
    courseId: string
    goToCourse?: boolean
}