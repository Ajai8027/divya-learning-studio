import React from 'react';
import styles from './Programs.module.css';
import { PROGRAMS } from '../data/siteContent.js';

export default function Programs() {
  return (
    <section id="programs" className={styles.section} aria-labelledby="programs-title">
      <div className="container">
        <h2 id="programs-title" className={styles.title}>
          Choose a learning path.
        </h2>
        <ul className={styles.grid}>
          {PROGRAMS.map(({ id, title, description }) => (
            <li key={id} className={styles.card}>
              <span className={styles.accent} aria-hidden="true" />
              <h3 className={styles.cardTitle}>{title}</h3>
              <p className={styles.cardText}>{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
