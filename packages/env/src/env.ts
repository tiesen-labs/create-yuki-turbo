import type { StandardSchemaV1 } from '@standard-schema/spec'

const clientPrefix = 'NEXT_PUBLIC_' as const
type CLIENT_PREFIX = typeof clientPrefix

type ClientSchema = Record<`${CLIENT_PREFIX}${string}`, StandardSchemaV1>
type ServerSchema = Record<string, StandardSchemaV1>
type StandardSchemaDictionary = Record<string, StandardSchemaV1>

// Simple utility type to improve type display
type Simplify<T> = { [P in keyof T]: T[P] } & {}

type StrictRuntimeEnv<
  TPrefix extends string | undefined,
  TServer extends Record<string, StandardSchemaV1>,
  TClient extends Record<string, StandardSchemaV1>,
> = Record<
  | {
      [TKey in keyof TClient]: TPrefix extends undefined
        ? never
        : TKey extends `${TPrefix}${string}`
          ? TKey
          : never
    }[keyof TClient]
  | {
      [TKey in keyof TServer]: TPrefix extends undefined
        ? TKey
        : TKey extends `${TPrefix}${string}`
          ? never
          : TKey
    }[keyof TServer],
  string | boolean | number | undefined
>

interface EnvOptions<
  TServer extends ServerSchema = NonNullable<unknown>,
  TClient extends ClientSchema = NonNullable<unknown>,
> {
  server: TServer
  client: TClient
  clientPrefix?: CLIENT_PREFIX
  runtimeEnv: StrictRuntimeEnv<CLIENT_PREFIX, TServer, TClient>
  skipValidation?: boolean
}

type CreateEnv<
  TServer extends Record<string, StandardSchemaV1>,
  TClient extends Record<string, StandardSchemaV1>,
> = Readonly<
  Simplify<
    StandardSchemaDictionary.InferOutput<TServer> &
      StandardSchemaDictionary.InferOutput<TClient>
  >
>

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

/**
 * Parse and validate environment variables using a schema dictionary
 */
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

    if (typeof prop === 'string' && prop.trim() === '') {
      issues.push({
        message: `Environment variable "${key}" has an empty value`,
        path: [key],
      })
      continue
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

/**
 * Create a type-safe environment variables object that handles both client and server environments
 */
export function createEnv<
  TServerSchema extends ServerSchema = NonNullable<ServerSchema>,
  TClientSchema extends ClientSchema = NonNullable<unknown>,
>(
  opts: EnvOptions<TServerSchema, TClientSchema>,
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
      if (!isValidServerAccess(prop)) {
        onInvalidAccess()
        return
      }
      return Reflect.get(target, prop) as never
    },
  })

  return env as never
}
