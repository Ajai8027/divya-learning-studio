import React, { useEffect, useRef, useState } from 'react';
import styles from './Header.module.css';
import { NAV_LINKS } from '../data/siteContent.js';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        toggleRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleChange = (event) => {
      if (event.matches) {
        setIsOpen(false);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <a className={styles.brand} href="#main" aria-label="Divya Learning Studio, skip to main content">
          <img
            src="/assets/divya_logo.svg"
            alt="Divya Learning Studio"
            width="360"
            height="90"
          />
        </a>

        <button
          ref={toggleRef}
          type="button"
          className={styles.menuButton}
          aria-expanded={isOpen}
          aria-controls="primary-navigation"
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className={styles.menuIcon} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="visuallyHidden">
            {isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          </span>
        </button>

        <nav
          id="primary-navigation"
          aria-label="Primary"
          className={`${styles.nav} ${isOpen ? styles.navOpen : ''}`}
        >
          <ul className={styles.navList}>
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a className={styles.navLink} href={href} onClick={closeMenu}>
                  {label}
                </a>
              </li>
            ))}
            <li>
              <a className={styles.registerLink} href="#registration" onClick={closeMenu}>
                Register now
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
