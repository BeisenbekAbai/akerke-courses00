import { DetailedHTMLProps, HTMLAttributes } from "react";




export interface InpProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    name: string
    title: string
    autoFill?: string
}

export interface AddResourcesPopProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}