import './info-panel.css'

export default function InfoPanel({ planet, onClose }) {
  if (!planet) return null

  return (
    <div className="info-panel-wrap">
      <div className="info-panel">
        <button className="info-close" onClick={onClose} aria-label="Fermer">
          ✕
        </button>

        <div className="info-eyebrow">Orbite en cours</div>
        <h2 className="info-title">{planet.title}</h2>
        <div className="info-subtitle">{planet.subtitle}</div>

        <div className="info-body">
          {planet.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="info-tags">
          {planet.tags.map((tag) => (
            <span className="info-tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>

        {planet.isContact && (
          <a className="info-cta" href="/CV-Avo-Apanian.pdf" download>
            Télécharger le CV (PDF)
          </a>
        )}
      </div>
    </div>
  )
}
