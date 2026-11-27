import { PROGRAM_OPTIONS } from '../data/siteContent.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOCAL_HOST_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i;

export class RegistrationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RegistrationError';
  }
}

export const EMPTY_VALUES = {
  fullName: '',
  email: '',
  program: '',
  consent: false,
};

export function validateRegistration(values) {
  const errors = {};

  if (!values.fullName.trim()) {
    errors.fullName = 'Name required';
  }

  const email = values.email.trim();
  if (!email || !EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!PROGRAM_OPTIONS.includes(values.program)) {
    errors.program = 'Select a program';
  }

  if (!values.consent) {
    errors.consent = 'Consent is required';
  }

  return errors;
}

export function getRegistrationEndpoint() {
  const configured = import.meta.env.VITE_REGISTRATION_API_URL?.trim();

  if (!configured) {
    return import.meta.env.DEV ? 'http://localhost:8765/api/register' : null;
  }

  if (import.meta.env.PROD && LOCAL_HOST_PATTERN.test(configured)) {
    return null;
  }

  return configured;
}

export async function submitRegistration(values) {
  const endpoint = getRegistrationEndpoint();
  const payload = {
    full_name: values.fullName.trim(),
    email: values.email.trim(),
    program: values.program,
    consent: values.consent,
  };

  if (!endpoint) {
    return { mode: 'demo', status: 'validated' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (response.status === 422) {
      throw new RegistrationError('Please check your details and try again.');
    }

    if (!response.ok) {
      throw new RegistrationError(
        'The registration service could not process your enquiry. Please try again later.',
      );
    }

    return {
      mode: 'api',
      status: data.status || 'received',
      requestId: data.request_id,
    };
  } catch (error) {
    if (error instanceof RegistrationError) {
      throw error;
    }
    if (error.name === 'AbortError') {
      throw new RegistrationError(
        'The registration service took too long to respond. Please try again.',
      );
    }
    throw new RegistrationError(
      'We could not connect to the registration service. Please try again later.',
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
