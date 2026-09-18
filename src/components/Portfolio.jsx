import { PLANETS } from '../data/planets'
import './portfolio.css'

export default function Portfolio({ onBackToGame }) {
  const [profil, projets, experience, contact] = PLANETS

  return (
    <div className="portfolio">
      <header className="portfolio-header">
        <div>
          <div className="portfolio-eyebrow">Portfolio</div>
          <h1>Avo Apanian</h1>
          <p className="portfolio-role">Backend Developer — Go · C++ · Assembly x86 · Ring 0</p>
        </div>
        <button className="portfolio-back" onClick={onBackToGame}>
          ← Mode jeu 3D
        </button>
      </header>

      <section className="portfolio-section">
        <h2>{profil.title}</h2>
        {profil.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <div className="portfolio-tags">
          {profil.tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </section>

      <section className="portfolio-section">
        <h2>{projets.title}</h2>
        <ul className="portfolio-list">
          {projets.paragraphs.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
        <div className="portfolio-tags">
          {projets.tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </section>

      <section className="portfolio-section">
        <h2>{experience.title}</h2>
        {experience.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <div className="portfolio-tags">
          {experience.tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </section>

      <section className="portfolio-section portfolio-contact">
        <h2>{contact.title}</h2>
        <ul className="portfolio-list">
          {contact.paragraphs.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
        <a className="portfolio-cta" href="/CV-Avo-Apanian.pdf" download>
          Télécharger le CV (PDF)
        </a>
      </section>

      <footer className="portfolio-footer">
        <button className="portfolio-back" onClick={onBackToGame}>
          ← Retour au mode jeu 3D
        </button>
      </footer>
    </div>
  )
}
