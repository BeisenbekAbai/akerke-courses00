import { DetailedHTMLProps, HTMLAttributes } from "react";




export interface ResCardProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    text: string
    image: string
    resid: any
    resTheme: string
}