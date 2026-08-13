import z from "zod"

const SearchResultSchema = z.object({
    //need to fill out based on the actual api

})

export const SearchReponseSchema = z.object({
    results: z.array(SearchResultSchema)
})