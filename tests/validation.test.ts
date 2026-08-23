import { describe, it, expect } from 'vitest'

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function validateRegisterForm(form: {
  name: string
  email: string
  password: string
  confirmPassword: string
}) {
  const errors: Record<string, string> = {}

  if (!form.name.trim()) {
    errors.name = 'Nama lengkap wajib diisi'
  }
  if (!form.email.trim()) {
    errors.email = 'Alamat email wajib diisi'
  } else if (!validateEmail(form.email)) {
    errors.email = 'Format email tidak valid'
  }
  if (!form.password) {
    errors.password = 'Password wajib diisi'
  } else if (form.password.length < 8) {
    errors.password = 'Password minimal 8 karakter'
  }
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Konfirmasi password wajib diisi'
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Konfirmasi password tidak cocok dengan password'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

describe('Form Validation Rules', () => {
  it('validates email addresses accurately', () => {
    expect(validateEmail('user@waletify.com')).toBe(true)
    expect(validateEmail('invalid-email')).toBe(false)
    expect(validateEmail('user@')).toBe(false)
    expect(validateEmail('@domain.com')).toBe(false)
  })

  it('rejects passwords shorter than 8 characters', () => {
    const res = validateRegisterForm({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'short',
      confirmPassword: 'short'
    })
    expect(res.isValid).toBe(false)
    expect(res.errors.password).toBe('Password minimal 8 karakter')
  })

  it('rejects mismatched password and confirmPassword', () => {
    const res = validateRegisterForm({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'different123'
    })
    expect(res.isValid).toBe(false)
    expect(res.errors.confirmPassword).toBe('Konfirmasi password tidak cocok dengan password')
  })

  it('approves clean valid registration inputs', () => {
    const res = validateRegisterForm({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    })
    expect(res.isValid).toBe(true)
    expect(Object.keys(res.errors).length).toBe(0)
  })
})
