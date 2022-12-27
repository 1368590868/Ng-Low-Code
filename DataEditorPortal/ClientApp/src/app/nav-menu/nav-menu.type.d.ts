interface MenuItem{
    name: string
    img: string
    activeImg: string
    title:string
}

export interface MenuConfigProps {
    error: string
    data:MenuItem[]
}