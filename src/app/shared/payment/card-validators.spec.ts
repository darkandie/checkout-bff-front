import { FormControl } from '@angular/forms';
import { fixedClock } from '../../../testing/fixtures';
import {
  cardNumberValidator,
  cvvValidator,
  expiryValidator,
  holderNameValidator,
} from './card-validators';

describe('card validators', () => {
  const validate = (validator: ReturnType<typeof cvvValidator>, value: string) =>
    validator(new FormControl(value, { nonNullable: true }));

  it('accepts valid card numbers and rejects wrong length or checksum', () => {
    const validator = cardNumberValidator();

    expect(validate(validator, '4242 4242 4242 4242')).toBeNull();
    expect(validate(validator, '')).toBeNull();
    expect(validate(validator, '4242 4242 4242 4241')).toEqual({ cardNumber: true });
    expect(validate(validator, '4242 4242')).toEqual({ cardNumber: true });
  });

  it('accepts names with letters, spaces and accents only', () => {
    const validator = holderNameValidator();

    expect(validate(validator, 'Marina Almeida')).toBeNull();
    expect(validate(validator, "João D'Ávila")).toBeNull();
    expect(validate(validator, 'Ana1')).toEqual({ holderName: true });
    expect(validate(validator, 'Al')).toEqual({ holderName: true });
  });

  it('checks expiry format, month and date against the clock', () => {
    const validator = expiryValidator(fixedClock);

    expect(validate(validator, '10/26')).toBeNull();
    expect(validate(validator, '12/30')).toBeNull();
    expect(validate(validator, '09/26')).toEqual({ expired: true });
    expect(validate(validator, '13/30')).toEqual({ expiryFormat: true });
    expect(validate(validator, '1230')).toEqual({ expiryFormat: true });
  });

  it('accepts CVVs with 3 or 4 digits', () => {
    const validator = cvvValidator();

    expect(validate(validator, '123')).toBeNull();
    expect(validate(validator, '1234')).toBeNull();
    expect(validate(validator, '12')).toEqual({ cvv: true });
    expect(validate(validator, '12a')).toEqual({ cvv: true });
  });
});
