import { z } from 'zod'

export const createCategorySchema = z.object({
    name: z.string({ 
        required_error: 'name field is required', 
        invalid_type_error: 'name field must be a string' 
    }).min(3, { message: 'The name must be more than three letters'}).trim()
});

export type createCategoryType = typeof createCategorySchema._type