import { DetailedHTMLProps, HTMLAttributes } from "react";




export interface ArticleProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    text: string
}