export interface createProductResponse {
    id: string,
    name: string,
    description: string,
    create_time: string,
    links:[
        {
            href: string,
            rel:"self",
            method:"GET"
        },
        {
            href: string,
            rel:"edit",
            method:"PATCH"
        }
    ]
}

export interface createPlanResponse {
    id: string,
    product_id: string,
    name: string,
    status: string,
    description?: string,
    create_time: string,
    links: [
        {
            href: string,
            rel: "self",
            method: "GET"
        },
        {
            href: string,
            rel: "edit",
            method: "PATCH"
        },
        {
            href: string,
            rel: "self",
            method: "POST"
        }
    ]
}