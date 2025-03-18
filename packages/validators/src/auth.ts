import { type } from 'arktype'

export const signInSchema = type({
  email: 'string.email',
  password: type(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
  ).describe('valid password'),
})

export const signUpSchema = type({
  name: 'string>=4',
  email: 'string.email',
  password: type(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
  ).describe('valid password'),
  confirmPassword: 'string>=8',
}).narrow((data, ctx) => {
  if (data.password !== data.confirmPassword)
    return ctx.reject({
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    })

  return true
})
