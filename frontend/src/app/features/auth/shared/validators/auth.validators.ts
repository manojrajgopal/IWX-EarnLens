import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/* ============================================================
   Reusable auth form validators
   ============================================================ */

/** Cross-field validator: confirm password must equal password. */
export function passwordMatch(
  passwordKey = 'password',
  confirmKey = 'confirmPassword',
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const pass = group.get(passwordKey)?.value;
    const confirm = group.get(confirmKey)?.value;
    if (!confirm) return null;
    return pass === confirm ? null : { passwordMismatch: true };
  };
}

/** Strong password: requires lower, upper, number and min length. */
export function strongPassword(min = 8): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value ?? '';
    if (!value) return null;
    const errors: ValidationErrors = {};
    if (value.length < min) errors['minlength'] = { requiredLength: min };
    if (!/[a-z]/.test(value)) errors['lowercase'] = true;
    if (!/[A-Z]/.test(value)) errors['uppercase'] = true;
    if (!/\d/.test(value)) errors['number'] = true;
    return Object.keys(errors).length ? errors : null;
  };
}

/** Username: 3-20 chars, lowercase letters and numbers only, starts with a letter. */
export function username(): ValidatorFn {
  const re = /^[a-z][a-z0-9]{2,19}$/;
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value ?? '';
    if (!value) return null;
    return re.test(value) ? null : { username: true };
  };
}

/** International-ish phone number: optional +, 7-15 digits. */
export function phone(): ValidatorFn {
  const re = /^\+?[0-9\s\-()]{7,18}$/;
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value ?? '';
    if (!value) return null;
    return re.test(value) ? null : { phone: true };
  };
}

/** Score a password 0..4 for the strength meter. */
export function passwordScore(value: string): number {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^a-zA-Z0-9]/.test(value)) score++;
  return Math.min(score, 4);
}
