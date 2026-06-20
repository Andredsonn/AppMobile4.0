import { describe, it, expect, beforeEach, vi } from 'vitest'
import { lancamentoService } from '../../src/services/lancamentoService'
import { apiRequest } from '../../src/services/api'

vi.mock('../../src/services/api', () => ({ apiRequest: vi.fn() }))

describe('lancamentoService CRUD', () => {
  beforeEach(() => vi.clearAllMocks())

  it('create, getById, update and delete', async () => {
    ;(apiRequest as unknown as vi.Mock)
      .mockResolvedValueOnce({ id: 10, title: 'created' }) // create
      .mockResolvedValueOnce({ id: 10, title: 'created' }) // getById
      .mockResolvedValueOnce({ id: 10, title: 'updated' }) // update
      .mockResolvedValueOnce({}) // delete returns empty

    const created = await lancamentoService.create({ title: 'x' })
    expect(created.id).toBe(10)

    const fetched = await lancamentoService.getById(10)
    expect(fetched.id).toBe(10)

    const updated = await lancamentoService.update(10, { title: 'updated' })
    expect(updated.title).toBe('updated')

    await expect(lancamentoService.delete(10)).resolves.toEqual({})
  })
})
