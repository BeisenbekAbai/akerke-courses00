import { DetailedHTMLProps, HTMLAttributes } from "react"



export interface InputFieldProps extends DetailedHTMLProps<HTMLAttributes<HTMLLabelElement>, HTMLLabelElement> {
    title: string
    type: string
    name: string
    showPassword: boolean
    autofill: string
}