import { DetailedHTMLProps, HTMLAttributes } from "react";




export interface CommentCardProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    cid: string
    timestamp: number
    stars: number
    text: string
    uid: string
    commentid: string
}