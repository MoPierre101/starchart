export async function Search(params?: string ){ //Params should be an object with search etc

    const url = new URL(`${process.env.HOST}/api/search`)

    url.search = new URLSearchParams(params).toString()

    const res = await fetch(url)

    if(!res.ok) throw new Error("Failed to fetch results of query")

    
    return res.json()

    
}