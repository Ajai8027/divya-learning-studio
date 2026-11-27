import React from 'react';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.content}>
          <p className={styles.eyebrow}>LEARN WITH CONFIDENCE</p>
          <h1 id="hero-title" className={styles.title}>
            <span className={styles.line}>Build skills for the</span>
            <span className={styles.line}>next opportunity.</span>
          </h1>
          <p className={styles.description}>
            Practical, guided learning for ambitious students and early-career professionals.
          </p>
          <a className={styles.cta} href="#programs">
            Explore programs
          </a>
          <p className={styles.supporting}>Small groups • Flexible sessions • Clear outcomes</p>
        </div>

        <div className={styles.media}>
          <img
            className={styles.image}
            src="/assets/learning_dashboard_illustration.webp"
            alt="Illustration of a digital learning dashboard and progress cards"
            width="920"
            height="680"
            fetchpriority="high"
          />
        </div>
      </div>
    </section>
  );
}
