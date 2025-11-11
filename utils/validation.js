import Joi from "joi"


export const createTodoSchema = Joi.object({
    title: Joi.string().min(1).max(100).required(),
    description: Joi.string().allow().optional(),
    completed: Joi.boolean().optional().default(false)
})

export const updateTodoSchema = Joi.object({
    title: Joi.string().min(1).max(100).optional(),
    description: Joi.string().allow("").optional(),
  completed: Joi.boolean().optional()
})