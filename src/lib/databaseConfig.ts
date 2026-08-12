export function assertExpectedDatabase(
  actualDatabase: string,
  expectedDatabase: string | undefined,
) {
  if (expectedDatabase && actualDatabase !== expectedDatabase) {
    throw new Error('Connected MongoDB database does not match EXPECTED_MONGODB_DATABASE.')
  }
}
