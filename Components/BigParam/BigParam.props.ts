import { HTMLAttributes } from 'react';
import { DetailedHTMLProps } from 'react';




export interface ParamProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    name: string
    title: string
    val?: string
    _placeholder?: string
    required?: boolean
}