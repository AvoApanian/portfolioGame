import { useI18n } from '../../i18n'
import './info-panel.css'

export default function InfoPanel({ planet, onClose }) {
  const { dictionary } = useI18n()

  if (!planet) return null

  const content = dictionary.planets[planet.id]
  if (!content) return null

  return (
    <div className="info-panel-wrap">
      <div className="info-panel">
        <button className="info-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="info-eyebrow">{dictionary.panel.eyebrow}</div>
        <h2 className="info-title">{content.title}</h2>
        <div className="info-subtitle">{content.subtitle}</div>

        <div className="info-body">
          {content.paragraphs.map((p, i) => (
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
      </div>
    </div>
  )
}
