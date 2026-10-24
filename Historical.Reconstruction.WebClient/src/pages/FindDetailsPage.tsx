import { Link, Navigate, useParams } from 'react-router-dom'
import { useFind } from '../features/finds/hooks/useFind.ts'
import { formatPeriod } from '../features/finds/lib/formatPeriod.ts'
import { HttpError } from '../shared/api/httpClient.ts'

export function FindDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { data: find, error, isError, isPending, refetch } = useFind(id)

  if (!id) {
    return <Navigate to="/finds" replace />
  }

  if (isPending) {
    return <DetailsSkeleton />
  }

  if (isError) {
    const isNotFound = error instanceof HttpError && error.status === 404

    return (
      <main className="find-details">
        <Link className="back-link" to="/finds">
          ← Вернуться в каталог
        </Link>
        <section className="catalog-state" role="alert">
          <span className="catalog-state__icon" aria-hidden="true">
            {isNotFound ? '404' : '!'}
          </span>
          <h2>{isNotFound ? 'Находка не найдена' : 'Не удалось загрузить карточку'}</h2>
          <p>
            {isNotFound
              ? 'Возможно, запись была удалена или ссылка неверна.'
              : error.message}
          </p>
          {!isNotFound && (
            <button type="button" onClick={() => void refetch()}>
              Попробовать снова
            </button>
          )}
        </section>
      </main>
    )
  }

  return (
    <main className="find-details">
      <Link className="back-link" to="/finds">
        ← Вернуться в каталог
      </Link>

      <article className="find-details__card">
        <header className="find-details__hero">
          <p className="catalog__eyebrow">Карточка находки</p>
          <p className="find-details__period">
            {find.datingLabel ?? formatPeriod(find.dateFromYear, find.dateToYear)}
          </p>
          <h1>{find.name}</h1>
        </header>

        {find.images.length > 0 && (
          <section className="find-gallery" aria-label="Изображения находки">
            {find.images.map((image) => (
              <figure key={image.id}>
                <img src={image.url} alt={image.caption || find.name} />
                {image.caption && <figcaption>{image.caption}</figcaption>}
              </figure>
            ))}
          </section>
        )}

        <div className="find-details__content">
          <section className="find-details__description">
            <h2>О находке</h2>
            <p style={{ whiteSpace: 'pre-line' }}>{find.description}</p>
          </section>

          <aside className="find-details__facts" aria-label="Сведения о находке">
            <h2>Сведения</h2>
            <dl>
              <div>
                <dt>Период</dt>
                <dd>{find.datingLabel ?? formatPeriod(find.dateFromYear, find.dateToYear)}</dd>
              </div>
              <div>
                <dt>ID записи</dt>
                <dd title={find.id}>{find.id.slice(0, 8)}</dd>
              </div>
            </dl>
            {find.sourceUrl && (
              <a href={find.sourceUrl} target="_blank" rel="noreferrer">
                Открыть источник ↗
              </a>
            )}

          </aside>
        </div>
      </article>
    </main>
  )
}

function DetailsSkeleton() {
  return (
    <main className="find-details" aria-label="Загрузка карточки" aria-busy="true">
      <div className="skeleton detail-skeleton__back" />
      <article className="find-details__card">
        <header className="find-details__hero">
          <div className="skeleton detail-skeleton__label" />
          <div className="skeleton detail-skeleton__period" />
          <div className="skeleton detail-skeleton__title" />
        </header>
        <div className="find-details__content">
          <div className="skeleton detail-skeleton__body" />
          <div className="skeleton detail-skeleton__facts" />
        </div>
      </article>
    </main>
  )
}
