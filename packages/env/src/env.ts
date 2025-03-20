import type { StandardSchemaV1 } from '@standard-schema/spec'

type ClientSchema = Record<string, StandardSchemaV1>
type ServerSchema = Record<string, StandardSchemaV1>

interface EnvOptions<
  TPrefix extends string | undefined,
  TClientSchema extends ClientSchema,
  TServerSchema extends ServerSchema,
> {
  server: TServerSchema
  clientPrefix?: TPrefix
  client: TClientSchema
  runtimeEnv: Record<
    | {
        [TKey in keyof TClientSchema]: TPrefix extends undefined
          ? never
          : TKey extends `${TPrefix}${string}`
            ? TKey
            : never
      }[keyof TClientSchema]
    | {
        [TKey in keyof TServerSchema]: TPrefix extends undefined
          ? TKey
          : TKey extends `${TPrefix}${string}`
            ? never
            : TKey
      }[keyof TServerSchema],
    string | boolean | number | undefined
  >
  skipValidation?: boolean
}

type Simplify<T> = {
  [P in keyof T]: T[P]
} & {}
type CreateEnv<
  TServer extends Record<string, StandardSchemaV1>,
  TClient extends Record<string, StandardSchemaV1>,
> = Readonly<
  Simplify<
    StandardSchemaDictionary.InferOutput<TServer> &
      StandardSchemaDictionary.InferOutput<TClient>
  >
>

export function createEnv<
  TPrefix extends string | undefined,
  TClientSchema extends ClientSchema,
  TServerSchema extends ServerSchema,
>(
  opts: EnvOptions<TPrefix, TClientSchema, TServerSchema>,
): CreateEnv<TServerSchema, TClientSchema> {
  if (opts.skipValidation) return opts.runtimeEnv as never

  const _client = typeof opts.client === 'object' ? opts.client : {}
  const _server = typeof opts.server === 'object' ? opts.server : {}
  const isServer =
    typeof process !== 'undefined' &&
    typeof process.versions.node !== 'undefined'

  const finalEnv = isServer ? { ..._client, ..._server } : { ..._client }
  const parsed = parseWithDictionary(finalEnv, opts.runtimeEnv)

  const onValidationError = (issues: readonly StandardSchemaV1.Issue[]) => {
    console.error('❌ Invalid environment variables:', issues)
    throw new Error('Invalid environment variables')
  }

  const onInvalidAccess = () => {
    throw new Error(
      '❌ Attempted to access a server-side environment variable on the client',
    )
  }

  const isServerAccess = (prop: string) => {
    if (!opts.clientPrefix) return true
    return !prop.startsWith(opts.clientPrefix)
  }
  const isValidServerAccess = (prop: string) => {
    return isServer || !isServerAccess(prop)
  }
  const ignoreProp = (prop: string) => {
    return prop === '__esModule' || prop === '$$typeof'
  }

  if (parsed.issues) return onValidationError(parsed.issues)

  const env = new Proxy(parsed.value, {
    get(target, prop) {
      if (typeof prop !== 'string') return undefined
      if (ignoreProp(prop)) return undefined
      if (!isValidServerAccess(prop)) return onInvalidAccess()
      return Reflect.get(target, prop) as never
    },
  })

  return env as never
}

type StandardSchemaDictionary = Record<string, StandardSchemaV1>
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace StandardSchemaDictionary {
  export type Matching<
    Input,
    Output extends Record<keyof Input, unknown> = Input,
  > = {
    [K in keyof Input]-?: StandardSchemaV1<Input[K], Output[K]>
  }
  export type InferInput<T extends StandardSchemaDictionary> = {
    [K in keyof T]: StandardSchemaV1.InferInput<T[K]>
  }
  export type InferOutput<T extends StandardSchemaDictionary> = {
    [K in keyof T]: StandardSchemaV1.InferOutput<T[K]>
  }
}

function parseWithDictionary<TDict extends StandardSchemaDictionary>(
  dictionary: TDict,
  value: Record<string, unknown>,
): StandardSchemaV1.Result<StandardSchemaDictionary.InferOutput<TDict>> {
  const result: Record<string, unknown> = {}
  const issues: StandardSchemaV1.Issue[] = []
  for (const key in dictionary) {
    const schema = dictionary[key] as StandardSchemaV1
    const prop = value[key]
    const propResult = schema['~standard'].validate(prop)
    if (propResult instanceof Promise) {
      throw new Error(
        `Validation must be synchronous, but ${key} returned a Promise.`,
      )
    }
    if (propResult.issues) {
      issues.push(
        ...propResult.issues.map((issue) => ({
          ...issue,
          path: [key, ...(issue.path ?? [])],
        })),
      )
      continue
    }
    result[key] = propResult.value
  }
  if (issues.length) {
    return { issues }
  }
  return { value: result as never }
}
