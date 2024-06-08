import { z } from 'zod'

export const createPlanSchema = z.object({
    name: z.string({ 
        required_error: 'name field is required', 
        invalid_type_error: 'name field must be a string' 
    }).min(3, { message: 'The name must be more than three letters'}).trim(),
    default: z.boolean({ invalid_type_error: 'name field must be a boolean' }).optional(),
    monthlyCost: z.number({ 
        required_error: 'monthlyCost field is required', 
        invalid_type_error: 'monthlyCost field must be a number' 
    }).gt(0),
    annuallyCost: z.number({ 
        required_error: 'annuallyCost field is required', 
        invalid_type_error: 'annuallyCost field must be a number' 
    }).gt(0),
    maxCalls: z.number({ 
        required_error: 'maxCalls field is required', 
        invalid_type_error: 'maxCalls field must be a number' 
    })
});

export const updatePlanSchema = z.object({
    name: z.string({ 
        required_error: 'name field is required', 
        invalid_type_error: 'name field must be a string' 
    }).min(3, { message: 'The name must be more than three letters'}).trim().optional(),
    default: z.boolean({ invalid_type_error: 'name field must be a boolean' }).optional(),
    monthlyCost: z.number({ 
        required_error: 'monthlyCost field is required', 
        invalid_type_error: 'monthlyCost field must be a number' 
    }).gt(0).optional(),
    annuallyCost: z.number({ 
        required_error: 'annuallyCost field is required', 
        invalid_type_error: 'annuallyCost field must be a number' 
    }).gt(0).optional(),
    maxCalls: z.number({ 
        required_error: 'maxCalls field is required', 
        invalid_type_error: 'maxCalls field must be a number' 
    }).optional()
})

export type createPlanType = typeof createPlanSchema._type

export type updatePlanType = typeof updatePlanSchema._type