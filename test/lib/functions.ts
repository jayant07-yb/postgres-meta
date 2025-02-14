import { pgMeta } from './utils'

test('list', async () => {
  const res = await pgMeta.functions.list()
  expect(res.data?.find(({ name }) => name === 'add')).toMatchInlineSnapshot(
    { id: expect.any(Number) },
    `
    Object {
      "argument_types": "integer, integer",
      "behavior": "IMMUTABLE",
      "complete_statement": "CREATE OR REPLACE FUNCTION public.add(integer, integer)
     RETURNS integer
     LANGUAGE sql
     IMMUTABLE STRICT
    AS $function$select $1 + $2;$function$
    ",
      "config_params": null,
      "definition": "select $1 + $2;",
      "id": Any<Number>,
      "identity_argument_types": "integer, integer",
      "language": "sql",
      "name": "add",
      "return_type": "int4",
      "schema": "public",
      "security_definer": false,
    }
  `
  )
})

test('retrieve, create, update, delete', async () => {
  const {
    data: { id: testSchemaId },
  }: any = await pgMeta.schemas.create({ name: 'test_schema' })

  let res = await pgMeta.functions.create({
    name: 'test_func',
    schema: 'public',
    args: ['a int2', 'b int2'],
    definition: 'select a + b',
    return_type: 'integer',
    language: 'sql',
    behavior: 'STABLE',
    security_definer: true,
    config_params: { search_path: 'hooks, auth', role: 'postgres' },
  })
  expect(res).toMatchInlineSnapshot(
    { data: { id: expect.any(Number) } },
    `
    Object {
      "data": Object {
        "argument_types": "a smallint, b smallint",
        "behavior": "STABLE",
        "complete_statement": "CREATE OR REPLACE FUNCTION public.test_func(a smallint, b smallint)
     RETURNS integer
     LANGUAGE sql
     STABLE SECURITY DEFINER
     SET search_path TO 'hooks', 'auth'
     SET role TO 'postgres'
    AS $function$select a + b$function$
    ",
        "config_params": Object {
          "role": "postgres",
          "search_path": "hooks, auth",
        },
        "definition": "select a + b",
        "id": Any<Number>,
        "identity_argument_types": "a smallint, b smallint",
        "language": "sql",
        "name": "test_func",
        "return_type": "int4",
        "schema": "public",
        "security_definer": true,
      },
      "error": null,
    }
  `
  )
  res = await pgMeta.functions.retrieve({ id: res.data!.id })
  expect(res).toMatchInlineSnapshot(
    { data: { id: expect.any(Number) } },
    `
    Object {
      "data": Object {
        "argument_types": "a smallint, b smallint",
        "behavior": "STABLE",
        "complete_statement": "CREATE OR REPLACE FUNCTION public.test_func(a smallint, b smallint)
     RETURNS integer
     LANGUAGE sql
     STABLE SECURITY DEFINER
     SET search_path TO 'hooks', 'auth'
     SET role TO 'postgres'
    AS $function$select a + b$function$
    ",
        "config_params": Object {
          "role": "postgres",
          "search_path": "hooks, auth",
        },
        "definition": "select a + b",
        "id": Any<Number>,
        "identity_argument_types": "a smallint, b smallint",
        "language": "sql",
        "name": "test_func",
        "return_type": "int4",
        "schema": "public",
        "security_definer": true,
      },
      "error": null,
    }
  `
  )
  res = await pgMeta.functions.update(res.data!.id, {
    name: 'test_func_renamed',
    schema: 'test_schema',
    definition: 'select b - a',
  })
  expect(res).toMatchInlineSnapshot(
    { data: { id: expect.any(Number) } },
    `
    Object {
      "data": Object {
        "argument_types": "a smallint, b smallint",
        "behavior": "STABLE",
        "complete_statement": "CREATE OR REPLACE FUNCTION test_schema.test_func_renamed(a smallint, b smallint)
     RETURNS integer
     LANGUAGE sql
     STABLE SECURITY DEFINER
     SET search_path TO 'hooks', 'auth'
     SET role TO 'postgres'
    AS $function$select b - a$function$
    ",
        "config_params": Object {
          "role": "postgres",
          "search_path": "hooks, auth",
        },
        "definition": "select b - a",
        "id": Any<Number>,
        "identity_argument_types": "a smallint, b smallint",
        "language": "sql",
        "name": "test_func_renamed",
        "return_type": "int4",
        "schema": "test_schema",
        "security_definer": true,
      },
      "error": null,
    }
  `
  )
  res = await pgMeta.functions.remove(res.data!.id)
  expect(res).toMatchInlineSnapshot(
    { data: { id: expect.any(Number) } },
    `
    Object {
      "data": Object {
        "argument_types": "a smallint, b smallint",
        "behavior": "STABLE",
        "complete_statement": "CREATE OR REPLACE FUNCTION test_schema.test_func_renamed(a smallint, b smallint)
     RETURNS integer
     LANGUAGE sql
     STABLE SECURITY DEFINER
     SET search_path TO 'hooks', 'auth'
     SET role TO 'postgres'
    AS $function$select b - a$function$
    ",
        "config_params": Object {
          "role": "postgres",
          "search_path": "hooks, auth",
        },
        "definition": "select b - a",
        "id": Any<Number>,
        "identity_argument_types": "a smallint, b smallint",
        "language": "sql",
        "name": "test_func_renamed",
        "return_type": "int4",
        "schema": "test_schema",
        "security_definer": true,
      },
      "error": null,
    }
  `
  )
  res = await pgMeta.functions.retrieve({ id: res.data!.id })
  expect(res).toMatchObject({
    data: null,
    error: {
      message: expect.stringMatching(/^Cannot find a function with ID \d+$/),
    },
  })

  await pgMeta.schemas.remove(testSchemaId)
})
