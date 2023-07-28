import { DetailedHTMLProps, HTMLAttributes } from "react";



export interface CheckboxProps {
    number: number
    cid: string
}

export interface TitleComponentProps {
    text: string
    number: number
    cid: string
}

export interface AddMaterialsProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}