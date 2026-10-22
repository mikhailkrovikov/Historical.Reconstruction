import { Link } from 'react-router-dom'
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="find-card__placeholder-icon"
            aria-hidden="true"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M15 8h.01" />
            <path d="M19.875 6.27c.7 .398 1.13 1.143 1.125 1.948v7.284c0 .809 -.443 1.555 -1.158 1.948l-6.75 4.27a2.269 2.269 0 0 1 -2.184 0l-6.75 -4.27a2.225 2.225 0 0 1 -1.158 -1.948v-7.285c0 -.809 .443 -1.554 1.158 -1.947l6.75 -3.98a2.33 2.33 0 0 1 2.25 0l6.75 3.98h-.033" />
            <path d="M3.5 15.5l4.5 -4.5c.928 -.893 2.072 -.893 3 0l5 5" />
            <path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l2.5 2.5" />
          </svg>
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
