import React from 'react';
import styles from './FAQ.module.css';
import { FAQ_ITEMS } from '../data/siteContent.js';

export default function FAQ() {
  return (
    <section id="faq" className={styles.section} aria-labelledby="faq-title">
      <h2 id="faq-title" className={styles.title}>
        Frequently asked questions
      </h2>
      <div className={styles.list}>
        {FAQ_ITEMS.map(({ id, question, answer }) => (
          <details key={id} className={styles.item}>
            <summary className={styles.question}>{question}</summary>
            <p className={styles.answer}>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
