import { z } from 'zod'

export const createQuoteSchema = z.object({
    text: z.string({ 
        required_error: 'test field is required', 
        invalid_type_error: 'test field must be a string' 
    }).min(13, { message: 'The test must be more than 13 letters'}).trim(),
    author: z.string({ 
        required_error: 'author field is required', 
        invalid_type_error: 'author field must be a string' 
    }).min(3, { message: 'The author must be more than three letters'}),
    categoryName: z.string({ 
        required_error: 'categoryName field is required', 
        invalid_type_error: 'categoryName field must be a string' 
    }).min(3, { message: 'The categoryName must be more than three letters'})
});

export const updateQuoteSchema = z.object({
    text: z.string({ 
        required_error: 'test field is required', 
        invalid_type_error: 'test field must be a string' 
    }).min(13, { message: 'The test must be more than 13 letters'}).trim().optional(),
    author: z.string({ 
        required_error: 'author field is required', 
        invalid_type_error: 'author field must be a string' 
    }).min(3, { message: 'The author must be more than three letters'}).optional(),
    categoryName: z.string({ 
        required_error: 'categoryName field is required', 
        invalid_type_error: 'categoryName field must be a string' 
    }).min(3, { message: 'The categoryName must be more than three letters'}).optional()
})

export type createQuoteType = typeof createQuoteSchema._type

export type updateQuoteType = typeof updateQuoteSchema._type