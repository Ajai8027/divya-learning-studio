import React from 'react';
import styles from './Footer.module.css';
import { NAV_LINKS } from '../data/siteContent.js';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.identity}>
          <p className={styles.brand}>DIVYA LEARNING STUDIO</p>
          <p className={styles.tagline}>Build capability. Create momentum.</p>
        </div>

        <nav aria-label="Footer" className={styles.nav}>
          <ul className={styles.navList}>
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a className={styles.navLink} href={href}>
                  {label}
                </a>
              </li>
            ))}
            <li>
              <a className={styles.navLink} href="#registration">
                Register now
              </a>
            </li>
          </ul>
        </nav>

        <p className={styles.copyright}>
          © 2026 Divya Learning Studio. Information &amp; registration.
        </p>
      </div>
    </footer>
  );
}
