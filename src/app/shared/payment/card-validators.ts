import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Clock } from '../../core/config/clock';
import { digitsOnly, passesLuhn } from './card-number';

export function cardNumberValidator(): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    const digits = digitsOnly(control.value ?? '');
    if (digits.length === 0) {
      return null;
    }
    if (digits.length < 13 || digits.length > 19 || !passesLuhn(digits)) {
      return { cardNumber: true };
    }
    return null;
  };
}

export function holderNameValidator(): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    const value = (control.value ?? '').trim();
    if (value.length === 0) {
      return null;
    }
    if (value.length < 3 || !/^[\p{L}][\p{L} .'-]*$/u.test(value)) {
      return { holderName: true };
    }
    return null;
  };
}

export function expiryValidator(clock: Clock): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    const value = control.value ?? '';
    if (value.length === 0) {
      return null;
    }
    const match = /^(\d{2})\/(\d{2})$/.exec(value);
    if (!match) {
      return { expiryFormat: true };
    }
    const month = Number(match[1]);
    const year = 2000 + Number(match[2]);
    if (month < 1 || month > 12) {
      return { expiryFormat: true };
    }
    const today = clock();
    const currentMonthIndex = today.getFullYear() * 12 + today.getMonth();
    const expiryMonthIndex = year * 12 + (month - 1);
    return expiryMonthIndex < currentMonthIndex ? { expired: true } : null;
  };
}

export function cvvValidator(): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    const value = control.value ?? '';
    if (value.length === 0) {
      return null;
    }
    return /^\d{3,4}$/.test(value) ? null : { cvv: true };
  };
}
