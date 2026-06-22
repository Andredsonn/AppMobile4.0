import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('../../src/services/api', () => ({
  apiRequest: vi.fn(),
}))

import { lancamentoService } from '../../src/services/lancamentoService'
import { apiRequest } from '../../src/services/api'

describe('lancamentoService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls apiRequest for getAll', async () => {
    ;(apiRequest as unknown as vi.Mock).mockResolvedValueOnce([{ id: 1 }])

    const result = await lancamentoService.getAll()

    expect(apiRequest).toHaveBeenCalledWith('/Lancamentos/GetAll')
    expect(result).toEqual([{ id: 1 }])
  })
})
