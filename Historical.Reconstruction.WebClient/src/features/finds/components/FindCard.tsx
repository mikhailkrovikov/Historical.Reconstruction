import { Link } from 'react-router-dom'
import { Icon } from '../../../shared/ui/Icon'
import type { HistoricalFind } from '../types.ts'
import { formatPeriodAsCenturies } from '../lib/formatPeriod.ts'

interface FindCardProps {
  find: HistoricalFind
  regionLabel?: string
}

export function FindCard({ find, regionLabel }: FindCardProps) {
  const primaryImage = find.images[0]

  return (
    <article className="find-card">
      <Link className="find-card__media" to={`/finds/${find.id}`} tabIndex={-1}>
        {primaryImage ? (
          <img src={primaryImage.url} alt={primaryImage.caption || find.name} />
        ) : (
          <Icon name="image" className="find-card__placeholder-icon" />
        )}
      </Link>
      {find.sourceUrl && (
        <a
          className="find-card__source"
          href={find.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          ИСТОЧНИК
        </a>
      )}
      <div className="find-card__body">
        <h2>
          <Link to={`/finds/${find.id}`}>{find.name}</Link>
        </h2>
        <p className="find-card__meta">
          <span className="find-card__region">
            {regionLabel ?? find.description}
          </span>
          <span aria-hidden="true">•</span>
          <span className="find-card__centuries">
            {formatPeriodAsCenturies(find.dateFromYear, find.dateToYear)}
          </span>
        </p>
      </div>
    </article>
  )
}
