import { DetailedHTMLProps, HTMLAttributes } from "react";




export interface SidebarProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    name: string
    image: string
    page: string
}