import React from 'react';
import styles from './RegistrationSection.module.css';
import FAQ from './FAQ.jsx';
import RegistrationForm from './RegistrationForm.jsx';

export default function RegistrationSection() {
  return (
    <section id="registration" className={styles.section} aria-labelledby="registration-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.intro}>
          <h2 id="registration-title" className={styles.title}>
            Start your learning journey.
          </h2>
          <p className={styles.description}>
            Register your interest and our team will follow up.
          </p>
        </div>

        <div className={styles.formArea}>
          <RegistrationForm />
        </div>

        <div className={styles.faqArea}>
          <FAQ />
        </div>
      </div>
    </section>
  );
}
