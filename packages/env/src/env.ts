import type { StandardSchemaV1 } from '@standard-schema/spec'

type ErrorMessage<T extends string> = T
type Simplify<T> = { [P in keyof T]: T[P] } & {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Impossible<T extends Record<string, any>> = Partial<Record<keyof T, never>>

interface BaseOptions {
  isServer?: boolean
  onValidationError?: (issues: readonly StandardSchemaV1.Issue[]) => never
  onInvalidAccess?: (variable: string) => never
  skipValidation?: boolean
}

interface StrictOptions<
  TPrefix extends string | undefined,
  TServer extends Record<string, StandardSchemaV1>,
  TClient extends Record<string, StandardSchemaV1>,
> extends BaseOptions {
  runtimeEnv: Record<
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
}

interface ServerOptions<
  TPrefix extends string | undefined,
  TServer extends Record<string, StandardSchemaV1>,
> {
  server: Partial<{
    [TKey in keyof TServer]: TPrefix extends undefined
      ? TServer[TKey]
      : TPrefix extends ''
        ? TServer[TKey]
        : TKey extends `${TPrefix}${string}`
          ? ErrorMessage<`${TKey extends `${TPrefix}${string}`
              ? TKey
              : never} should not prefixed with ${TPrefix}.`>
          : TServer[TKey]
  }>
}

interface ClientOptions<
  TPrefix extends string | undefined,
  TClient extends Record<string, StandardSchemaV1>,
> {
  clientPrefix?: TPrefix
  client: Partial<{
    [TKey in keyof TClient]: TKey extends `${TPrefix}${string}`
      ? TClient[TKey]
      : ErrorMessage<`${TKey extends string
          ? TKey
          : never} is not prefixed with ${TPrefix}.`>
  }>
}

type ServerClientOptions<
  TPrefix extends string | undefined,
  TServer extends Record<string, StandardSchemaV1>,
  TClient extends Record<string, StandardSchemaV1>,
> =
  | (ClientOptions<TPrefix, TClient> & ServerOptions<TPrefix, TServer>)
  | (ServerOptions<TPrefix, TServer> & Impossible<ClientOptions<never, never>>)
  | (ClientOptions<TPrefix, TClient> & Impossible<ServerOptions<never, never>>)

type EnvOptions<
  TPrefix extends string | undefined,
  TServer extends Record<string, StandardSchemaV1> = NonNullable<unknown>,
  TClient extends Record<string, StandardSchemaV1> = NonNullable<unknown>,
> = StrictOptions<TPrefix, TServer, TClient> &
  ServerClientOptions<TPrefix, TServer, TClient>

type CreateEnv<
  TServer extends Record<string, StandardSchemaV1>,
  TClient extends Record<string, StandardSchemaV1>,
> = Readonly<
  Simplify<
    StandardSchemaDictionary.InferOutput<TServer> &
      StandardSchemaDictionary.InferOutput<TClient>
  >
>

/**
 * Create a type-safe environment variables object that handles both client and server environments
 */
export function createEnv<
  TPrefix extends string | undefined,
  TServer extends Record<string, StandardSchemaV1> = NonNullable<unknown>,
  TClient extends Record<`${TPrefix}${string}`, StandardSchemaV1> = Record<
    `${TPrefix}${string}`,
    never
  >,
>(opts: EnvOptions<TPrefix, TServer, TClient>): CreateEnv<TServer, TClient> {
  const runtimeEnv = opts.runtimeEnv
  for (const [key, value] of Object.entries(runtimeEnv)) {
    if (value === '')
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete (runtimeEnv as never)[key]
  }

  if (opts.skipValidation) return runtimeEnv as never

  const _client = typeof opts.client === 'object' ? opts.client : {}
  const _server = typeof opts.server === 'object' ? opts.server : {}
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  const isServer = // @ts-ignore
    opts.isServer ?? (typeof window === 'undefined' || 'Deno' in window)

  const finalEnv = isServer ? { ..._server, ..._client } : { ..._client }
  const parsed = parseWithDictionary(finalEnv, runtimeEnv)

  const onValidationError =
    opts.onValidationError ??
    ((issues) => {
      console.error('❌ Invalid environment variables:', issues)
      throw new Error('Invalid environment variables')
    })

  const onInvalidAccess =
    opts.onInvalidAccess ??
    (() => {
      throw new Error(
        '❌ Attempted to access a server-side environment variable on the client',
      )
    })

  if (parsed.issues) return onValidationError(parsed.issues)

  const isServerAccess = (prop: string) => {
    if (!opts.clientPrefix) return true
    return !prop.startsWith(opts.clientPrefix)
  }
  const isValidServerAccess = (prop: string) =>
    isServer || !isServerAccess(prop)
  const ignoreProp = (prop: string) =>
    prop === '__esModule' || prop === '$$typeof'

  const env = new Proxy(parsed.value, {
    get(target, prop) {
      if (typeof prop !== 'string') return undefined
      if (ignoreProp(prop)) return undefined
      if (!isValidServerAccess(prop)) {
        onInvalidAccess(prop)
        return
      }
      return Reflect.get(target, prop) as never
    },
  }) as CreateEnv<TServer, TClient>

  return env
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
