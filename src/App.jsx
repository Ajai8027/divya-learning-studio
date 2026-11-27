import React from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Benefits from './components/Benefits.jsx';
import Programs from './components/Programs.jsx';
import RegistrationSection from './components/RegistrationSection.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  return (
    <>
      <a className="skipLink" href="#main">Skip to main content</a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Benefits />
        <Programs />
        <RegistrationSection />
      </main>
      <Footer />
    </>
  );
}
