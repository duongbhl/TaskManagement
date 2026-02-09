import {z} from 'zod';

export const TaskSchema = z.object({
    title: z.string().min(1),
    content: z.string().optional().default(''),
    status: z.enum(['todo', 'doing', 'done']).default('todo')
});

export const TaskUpdateSchema = TaskSchema.partial();



