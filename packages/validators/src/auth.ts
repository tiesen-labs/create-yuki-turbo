import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, {
      message: 'Invalid password',
    }),
})

export const signUpSchema = z
  .object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z
      .string()
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, {
        message: 'Invalid password',
      }),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
