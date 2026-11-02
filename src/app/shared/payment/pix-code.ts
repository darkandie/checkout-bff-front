export interface PixCodeInput {
  key: string;
  amount: number;
  transactionId: string;
  merchantName: string;
  merchantCity: string;
}

const MAX_NAME_LENGTH = 25;
const MAX_CITY_LENGTH = 15;
const MAX_TXID_LENGTH = 25;

export function buildPixCode(input: PixCodeInput): string {
  const txid = input.transactionId.replace(/[^A-Za-z0-9]/g, '').slice(0, MAX_TXID_LENGTH);
  const payload =
    field('00', '01') +
    field('26', field('00', 'br.gov.bcb.pix') + field('01', input.key)) +
    field('52', '0000') +
    field('53', '986') +
    field('54', input.amount.toFixed(2)) +
    field('58', 'BR') +
    field('59', sanitize(input.merchantName, MAX_NAME_LENGTH)) +
    field('60', sanitize(input.merchantCity, MAX_CITY_LENGTH)) +
    field('62', field('05', txid)) +
    '6304';
  return payload + crc16(payload);
}

export function crc16(payload: string): string {
  let crc = 0xffff;
  for (const byte of new TextEncoder().encode(payload)) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function field(id: string, value: string): string {
  return id + value.length.toString().padStart(2, '0') + value;
}

function sanitize(value: string, maxLength: number): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .toUpperCase()
    .trim()
    .slice(0, maxLength);
}
