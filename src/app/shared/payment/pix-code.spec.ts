import { buildPixCode, crc16 } from './pix-code';

describe('Pix code', () => {
  it('computes the CRC16 of the Banco Central reference payload', () => {
    const reference =
      '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426655440000' +
      '5204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***6304';

    expect(crc16(reference)).toBe('1D3D');
  });

  it('builds a BR Code with key, amount, merchant and a valid checksum', () => {
    const code = buildPixCode({
      key: '123e4567-e12b-12d1-a456-426655440000',
      amount: 39.9,
      transactionId: 'tx-123',
      merchantName: 'Nexo Assinaturas',
      merchantCity: 'São Paulo',
    });

    expect(code.startsWith('000201')).toBe(true);
    expect(code).toContain('0014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426655440000');
    expect(code).toContain('540539.90');
    expect(code).toContain('5916NEXO ASSINATURAS');
    expect(code).toContain('6009SAO PAULO');
    expect(code).toContain('62090505tx123');
    expect(code.slice(-4)).toBe(crc16(code.slice(0, -4)));
  });
});
