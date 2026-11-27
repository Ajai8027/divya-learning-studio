import React from 'react';
import styles from './Benefits.module.css';
import { BENEFITS } from '../data/siteContent.js';

export default function Benefits() {
  return (
    <section id="benefits" className={styles.section} aria-labelledby="benefits-title">
      <div className="container">
        <h2 id="benefits-title" className={styles.title}>
          Learning that moves you forward.
        </h2>
        <ul className={styles.grid}>
          {BENEFITS.map(({ id, title, description }) => (
            <li key={id} className={styles.card}>
              <span className={styles.icon} aria-hidden="true" />
              <h3 className={styles.cardTitle}>{title}</h3>
              <p className={styles.cardText}>{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
