import type { StandardSchemaV1 } from '@standard-schema/spec'
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '@yuki/ui/utils'

const useForm = <TSchema extends StandardSchemaV1, TData = unknown>({
  schema,
  defaultValues,
  submitFn,
  onSuccess,
  onError,
  isReset,
}: {
  schema: TSchema
  defaultValues: StandardSchemaV1.InferInput<TSchema>
  submitFn: (
    values: StandardSchemaV1.InferInput<TSchema>,
  ) => Promise<TData> | TData
  onSuccess?: (data: TData) => Promise<void> | void
  onError?: (error: string) => Promise<void> | void
  isReset?: boolean
}) => {
  const [values, setValues] = React.useState(defaultValues)
  const [isPending, startTransition] = React.useTransition()
  const [errors, setErrors] = React.useState<{
    message?: string
    fieldErrors?: Record<keyof StandardSchemaV1.InferInput<TSchema>, string>
  }>({})

  const handleSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      startTransition(async () => {
        e.preventDefault()
        e.stopPropagation()

        const parsed = await standardValidate(schema, values)

        if (!parsed.success) {
          setErrors({
            message: 'Validation error',
            fieldErrors: parsed.fieldErrors,
          })
          if (onError) void onError('Validation error')
          return
        }

        try {
          const data = await submitFn(parsed.data)
          if (onSuccess) void onSuccess(data)
          if (isReset) setValues(defaultValues)
          setErrors({})
        } catch (error) {
          if (error instanceof Error) {
            setErrors({ message: error.message })
            if (onError) void onError(error.message)
          } else {
            setErrors({ message: 'Unknown error' })
            if (onError) void onError('Unknown error')
          }
        }
      })
    },
    [defaultValues, isReset, onError, onSuccess, schema, submitFn, values],
  )

  const handleChange = (key: string, value: unknown) => {
    setValues((prev) => ({
      ...(prev as Record<string, unknown>),
      [key]: value,
    }))
  }

  const handleBlur = React.useCallback(
    async (event: React.FocusEvent<HTMLInputElement>) => {
      const parsed = await standardValidate(schema, values)

      if (!parsed.success) {
        setErrors((prev) => ({
          ...prev,
          fieldErrors: {
            ...(prev.fieldErrors as unknown as Record<
              keyof StandardSchemaV1.InferInput<TSchema>,
              string
            >),
            [event.target.name]: parsed.fieldErrors[event.target.name as never],
          },
        }))
      } else {
        setErrors((prev) => ({
          ...prev,
          fieldErrors: {
            ...(prev.fieldErrors as unknown as Record<
              keyof StandardSchemaV1.InferInput<TSchema>,
              string
            >),
            [event.target.name]: undefined,
          },
        }))
      }
    },
    [schema, values],
  )

  const reset = React.useCallback(() => {
    setValues(defaultValues)
    setErrors({})
  }, [defaultValues])

  return {
    handleSubmit,
    handleChange,
    handleBlur,
    reset,
    isPending,
    values,
    errors,
  }
}

type FormContextValue<T extends StandardSchemaV1> = ReturnType<
  typeof useForm<T>
>
const FormContext = React.createContext<FormContextValue<StandardSchemaV1>>(
  {} as FormContextValue<StandardSchemaV1>,
)

function Form<T extends StandardSchemaV1>({
  className,
  form,
  ...props
}: React.ComponentProps<'form'> & { form: FormContextValue<T> }) {
  return (
    <FormContext.Provider value={form}>
      <form
        data-slot="form"
        className={cn('grid gap-4', className)}
        onSubmit={form.handleSubmit}
        {...props}
      />
    </FormContext.Provider>
  )
}

interface FormFieldContextValue {
  name: string
  value?: string
  error?: string
  isPending?: boolean
  formItemId?: string
  formDescriptionId?: string
  formMessageId?: string
}
const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
)

function FormField({
  name,
  render,
}: {
  name: string
  render: (props: {
    name: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => Promise<void>
  }) => React.ReactNode
}) {
  const form = React.use(FormContext)

  return (
    <FormFieldContext.Provider value={{ name }}>
      {render({
        name,
        value: (form.values as never)[name],
        onChange: React.useCallback(
          (
            event:
              | React.ChangeEvent<HTMLInputElement>
              | string
              | number
              | boolean,
          ) => {
            if (event && typeof event === 'object') {
              let newValue: unknown = event.target.value
              if (event.target.type === 'number')
                newValue = event.target.valueAsNumber
              else if (event.target.type === 'checkbox')
                newValue = event.target.checked
              else if (event.target.type === 'date')
                newValue = event.target.valueAsDate

              form.handleChange(name, newValue)
            } else {
              form.handleChange(name, event)
            }
          },
          [form, name],
        ),
        onBlur: form.handleBlur,
      })}
    </FormFieldContext.Provider>
  )
}

interface FormItemContextValue {
  id: string
}
const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
)

function FormItem({ className, ...props }: React.ComponentProps<'fieldset'>) {
  const { isPending } = React.use(FormContext)
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <fieldset
        data-slot="form-item"
        data-disabled={isPending}
        className={cn('group grid gap-2', className)}
        disabled={isPending}
        {...props}
      />
    </FormItemContext.Provider>
  )
}

const useFormField = () => {
  const formContext = React.use(FormContext)
  const fieldContext = React.use(FormFieldContext)
  const itemContext = React.use(FormItemContext)

  return {
    id: itemContext.id,
    name: fieldContext.name,
    value: (formContext.values as never)[fieldContext.name],
    error: formContext.errors.fieldErrors?.[fieldContext.name as never],
    isPending: formContext.isPending,
    formItemId: `${itemContext.id}-form-item`,
    formDescriptionId: `${itemContext.id}-form-item-description`,
    formMessageId: `${itemContext.id}-form-item-message`,
  }
}

function FormLabel({ className, ...props }: React.ComponentProps<'label'>) {
  const { formItemId, error } = useFormField()

  return (
    <label
      data-slot="form-label"
      data-error={!!error}
      htmlFor={formItemId}
      className={cn(
        'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        'data-[error=true]:text-destructive',
        className,
      )}
      {...props}
    />
  )
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, isPending, formItemId, formDescriptionId, formMessageId } =
    useFormField()

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        !error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      aria-disabled={isPending}
      {...props}
    />
  )
}

function FormDescription({ className, ...props }: React.ComponentProps<'p'>) {
  const { formDescriptionId } = useFormField()

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

function FormMessage({ className, ...props }: React.ComponentProps<'p'>) {
  const { formMessageId, error } = useFormField()

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const body = error ? String(error) : props.children

  if (!body) return null

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn('text-destructive text-sm', className)}
      {...props}
    >
      {body}
    </p>
  )
}

export {
  useForm,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
}

const standardValidate = async <TSchema extends StandardSchemaV1>(
  schema: TSchema,
  input: StandardSchemaV1.InferInput<TSchema>,
): Promise<
  | {
      success: false
      data: null
      fieldErrors: Record<keyof StandardSchemaV1.InferOutput<TSchema>, string>
    }
  | {
      success: true
      data: StandardSchemaV1.InferOutput<TSchema>
      fieldErrors: null
    }
> => {
  let result = schema['~standard'].validate(input)
  if (result instanceof Promise) result = await result

  if (result.issues)
    return {
      success: false,
      data: null,
      fieldErrors: result.issues.reduce<Record<string, string>>(
        (acc, issue) => ({
          ...acc,
          [issue.path as never]: issue.message,
        }),
        {},
      ) as Record<keyof StandardSchemaV1.InferOutput<TSchema>, string>,
    }

  return {
    success: true,
    data: result.value,
    fieldErrors: null,
  }
}
