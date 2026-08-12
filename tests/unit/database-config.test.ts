import { describe, expect, it } from 'vitest'
import { assertExpectedDatabase } from '@/lib/databaseConfig'

describe('database environment guard', () => {
  it('allows the database selected by MONGODB_URI when no explicit guard is configured', () => {
    expect(() => assertExpectedDatabase('production_database', undefined)).not.toThrow()
  })

  it('allows an explicitly matching database', () => {
    expect(() => assertExpectedDatabase('production_database', 'production_database')).not.toThrow()
  })

  it('rejects an explicitly mismatched database', () => {
    expect(() => assertExpectedDatabase('unexpected_database', 'production_database')).toThrow(
      'Connected MongoDB database does not match EXPECTED_MONGODB_DATABASE.',
    )
  })
})
