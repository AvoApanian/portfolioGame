import { PLANETS } from '../game/planets'
import { useI18n, LANGUAGES } from '../../i18n'
import './portfolio.css'

export default function Portfolio({ onBackToGame }) {
  const { lang, setLang, dictionary } = useI18n()
  const [profile, projects, experience, contact] = PLANETS.map((p) => ({
    ...p,
    ...dictionary.planets[p.id],
  }))

  return (
    <div className="portfolio">
      <header className="portfolio-header">
        <div>
          <div className="portfolio-eyebrow">{dictionary.portfolio.eyebrow}</div>
          <h1>Avo Apanian</h1>
          <p className="portfolio-role">{dictionary.portfolio.role}</p>
        </div>

        <div className="portfolio-header-actions">
          <div className="portfolio-lang-switch">
            {LANGUAGES.map((code) => (
              <button
                key={code}
                className={`portfolio-lang-btn ${lang === code ? 'active' : ''}`}
                onClick={() => setLang(code)}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>

          <button className="portfolio-back" onClick={onBackToGame}>
            {dictionary.portfolio.backToGame}
          </button>
        </div>
      </header>

      <section className="portfolio-section">
        <h2>{profile.title}</h2>
        {profile.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <div className="portfolio-tags">
          {profile.tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </section>

      <section className="portfolio-section">
        <h2>{projects.title}</h2>
        <ul className="portfolio-list">
          {projects.paragraphs.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
        <div className="portfolio-tags">
          {projects.tags.map((t) => (
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
      </section>

      <footer className="portfolio-footer">
        <button className="portfolio-back" onClick={onBackToGame}>
          {dictionary.portfolio.backToGame}
        </button>
      </footer>
    </div>
  )
}
