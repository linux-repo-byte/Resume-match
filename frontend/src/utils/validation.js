const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email) {
  if (!email.trim()) return 'Email address is required.';
  if (!EMAIL_PATTERN.test(email.trim())) return 'Enter a valid email address.';
  return '';
}

export function validatePassword(password, required = true) {
  if (!password && !required) return '';
  if (!password) return 'Password is required.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return '';
}

export function validateUserForm(form, { passwordRequired = true } = {}) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Full name is required.';
  else if (form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters.';

  const emailError = validateEmail(form.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(form.password, passwordRequired);
  if (passwordError) errors.password = passwordError;

  if (form.role === 'recruiter' && !form.company.trim()) {
    errors.company = 'Company name is required for recruiters.';
  }

  return errors;
}

export function validateLoginForm(form) {
  const errors = {};
  const emailError = validateEmail(form.email);
  if (emailError) errors.email = emailError;
  const passwordError = validatePassword(form.password);
  if (passwordError) errors.password = passwordError;
  return errors;
}

export function validateJobForm(form) {
  const errors = {};
  if (!form.title?.trim()) errors.title = 'Job title is required.';
  else if (form.title.trim().length < 3) errors.title = 'Job title must be at least 3 characters.';
  if (!form.description?.trim()) errors.description = 'Job description is required.';
  else if (form.description.trim().length < 20) errors.description = 'Job description must be at least 20 characters.';
  if (!form.salary?.trim()) errors.salary = 'Salary is required, or enter Negotiable.';
  if (Number.isNaN(Number(form.requiredExperience)) || Number(form.requiredExperience) < 0) errors.requiredExperience = 'Experience must be zero or greater.';
  if (form.expiresAt && new Date(form.expiresAt).getTime() < new Date(new Date().toDateString()).getTime()) errors.expiresAt = 'Expiry date cannot be in the past.';
  return errors;
}

export const firstValidationError = (errors) => Object.values(errors)[0] || '';
