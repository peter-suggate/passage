/**
 * Test helper for writing mock implementations that only specify part of the interface.
 *
 * Solves problems of:
 *  1) writing and maintaining full mock implementations
 *  2) littering test code with uninformative casts.
 *
 * @param impl A patial implementation of the object implementing the interface. e.g.
 *
 * partialImpl<IDeviceManagerSys>({
 *    initOnMainThread: jest.fn(),
 *    release: jest.fn()
 * })
 */
export function partialImpl<Interface>(impl?: Partial<Interface>): Interface {
  return ({
    ...impl
  } as Partial<Interface>) as Interface;
}

export function emptyImpl<Interface>(): Interface {
  return ({} as Partial<Interface>) as Interface;
}

/**
 * Unsafe. Only use for testing.
 *
 * Prefer to use queryInterface() or requireInterface().
 *
 * @param obj The object to cast from
 */
export function cast<Interface, U = {}>(obj: U): Interface {
  return (obj as unknown) as Interface;
}
