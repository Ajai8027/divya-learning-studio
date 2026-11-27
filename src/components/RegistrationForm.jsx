import React, { useState } from 'react';
import styles from './RegistrationForm.module.css';
import { PROGRAM_OPTIONS } from '../data/siteContent.js';
import {
  EMPTY_VALUES,
  RegistrationError,
  submitRegistration,
  validateRegistration,
} from '../utils/registration.js';

const FIELD_ORDER = ['fullName', 'email', 'program', 'consent'];

export default function RegistrationForm() {
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [feedback, setFeedback] = useState('');
  const [requestId, setRequestId] = useState('');

  const isSubmitting = status === 'submitting';

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const nextValue = type === 'checkbox' ? checked : value;

    setValues((current) => ({ ...current, [name]: nextValue }));
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
    setStatus('idle');
    setFeedback('');
    setRequestId('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateRegistration(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus('error');
      setFeedback('Please fix the highlighted fields and try again.');
      const firstInvalid = FIELD_ORDER.find((field) => nextErrors[field]);
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    setStatus('submitting');
    setFeedback('Sending your enquiry…');

    try {
      const result = await submitRegistration(values);

      if (result.mode === 'demo') {
        setStatus('demo');
        setFeedback(
          'Validation passed. This preview is in demo mode, so your enquiry was not transmitted.',
        );
      } else {
        setStatus('success');
        setFeedback('Thanks — your enquiry has been received.');
        setRequestId(result.requestId || '');
      }
      setValues(EMPTY_VALUES);
    } catch (error) {
      setStatus('error');
      setFeedback(
        error instanceof RegistrationError
          ? error.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setStatus((current) => (current === 'submitting' ? 'idle' : current));
    }
  };

  const fieldClass = (field) => `${styles.input} ${errors[field] ? styles.inputError : ''}`;
  const statusClass = status === 'error'
    ? styles.statusError
    : status === 'success' || status === 'demo'
      ? styles.statusSuccess
      : '';

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      noValidate
      aria-busy={isSubmitting}
    >
      <div className={styles.field}>
        <label className={styles.label} htmlFor="fullName">
          Full name
        </label>
        <input
          className={fieldClass('fullName')}
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          disabled={isSubmitting}
          value={values.fullName}
          onChange={handleChange}
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={errors.fullName ? 'fullName-error' : undefined}
        />
        {errors.fullName && (
          <p className={styles.fieldError} id="fullName-error" role="alert">
            {errors.fullName}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="email">
          Email address
        </label>
        <input
          className={fieldClass('email')}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isSubmitting}
          value={values.email}
          onChange={handleChange}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p className={styles.fieldError} id="email-error" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="program">
          Program of interest
        </label>
        <select
          className={fieldClass('program')}
          id="program"
          name="program"
          required
          disabled={isSubmitting}
          value={values.program}
          onChange={handleChange}
          aria-invalid={Boolean(errors.program)}
          aria-describedby={errors.program ? 'program-error' : undefined}
        >
          <option value="">Select a program</option>
          {PROGRAM_OPTIONS.map((program) => (
            <option key={program} value={program}>
              {program}
            </option>
          ))}
        </select>
        {errors.program && (
          <p className={styles.fieldError} id="program-error" role="alert">
            {errors.program}
          </p>
        )}
      </div>

      <div className={styles.consentField}>
        <input
          className={styles.checkbox}
          id="consent"
          name="consent"
          type="checkbox"
          required
          disabled={isSubmitting}
          checked={values.consent}
          onChange={handleChange}
          aria-invalid={Boolean(errors.consent)}
          aria-describedby={errors.consent ? 'consent-error' : undefined}
        />
        <label className={styles.consentLabel} htmlFor="consent">
          I agree to be contacted about my enquiry.
        </label>
        {errors.consent && (
          <p className={styles.fieldError} id="consent-error" role="alert">
            {errors.consent}
          </p>
        )}
      </div>

      <button className={styles.submit} type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending…' : 'Send enquiry'}
      </button>

      <div
        className={`${styles.status} ${status !== 'idle' && status !== 'submitting' ? styles.statusVisible : ''} ${statusClass}`}
        role={status === 'error' ? 'alert' : 'status'}
        aria-live={status === 'error' ? 'assertive' : 'polite'}
      >
        {feedback && <p className={styles.statusText}>{feedback}</p>}
        {requestId && <p className={styles.requestId}>Reference: {requestId}</p>}
      </div>
    </form>
  );
}
