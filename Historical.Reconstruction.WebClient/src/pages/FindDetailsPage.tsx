import { Link, Navigate, useParams } from 'react-router-dom'
import backIcon from '../assets/find-details/back.svg'
import { useFind } from '../features/finds/hooks/useFind.ts'
import {
  useCategories,
  useRegions,
} from '../features/finds/hooks/useReferenceData.ts'
import { formatPeriodAsCenturies } from '../features/finds/lib/formatPeriod.ts'
import type { FindCategory, Region } from '../features/finds/types.ts'
import { HttpError } from '../shared/api/httpClient.ts'
import { Icon } from '../shared/ui/Icon'

export function FindDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { data: find, error, isError, isPending, refetch } = useFind(id)
  const regions = useRegions()
  const categories = useCategories()

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
        <div className="find-details__shell">
          <BackLink />
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
        </div>
      </main>
    )
  }

  const region = regions.data?.find((item) => item.id === find.regionId)
  const regionLabel = region ? getRegionLabel(region) : 'Место не указано'
  const categoryPath = getCategoryPath(find.findCategoryId, categories.data ?? [])
  const primaryImage = find.images[0]
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    region ? getRegionLabel(region) : find.name,
  )}`

  return (
    <main className="find-details">
      <article className="find-details__shell">
        <header className="find-details__heading">
          <BackLink />
          <h1>{find.name}</h1>
          <p>
            <span>{regionLabel}</span>
            <span aria-hidden="true">•</span>
            <span>{formatPeriodAsCenturies(find.dateFromYear, find.dateToYear)}</span>
          </p>
        </header>

        <section className="find-details__media" aria-label="Изображение находки">
          {primaryImage ? (
            <img src={primaryImage.url} alt={primaryImage.caption || find.name} />
          ) : (
            <div className="find-details__image-placeholder">
              <Icon name="image" className="find-details__placeholder-icon" />
            </div>
          )}
        </section>

        <div className="find-details__actions">
          <a href={mapUrl} target="_blank" rel="noreferrer">
            <Icon className="find-details__map-icon" name="map-pinned" />
            Карта местоположения
          </a>
          {find.sourceUrl ? (
            <a
              className="find-details__source"
              href={find.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              Источник
              <Icon name="arrow-up-right" />
            </a>
          ) : (
            <span className="find-details__source find-details__source--disabled">
              Источник не указан
            </span>
          )}
        </div>

        <section className="find-details__about">
          {categoryPath.length > 0 && (
            <ul className="find-details__tags" aria-label="Категории находки">
              {categoryPath.map((category, index) => (
                <li key={category.id}>
                  <span className={`find-details__tag-swatch find-details__tag-swatch--${index % 2}`} />
                  {category.name}
                </li>
              ))}
            </ul>
          )}

          <div className="find-details__description">
            <h2>Описание</h2>
            <p>{find.description}</p>
          </div>
        </section>
      </article>
    </main>
  )
}

function BackLink() {
  return (
    <Link className="back-link" to="/finds">
      <img src={backIcon} alt="" aria-hidden="true" />
      Назад
    </Link>
  )
}

function DetailsSkeleton() {
  return (
    <main className="find-details" aria-label="Загрузка карточки" aria-busy="true">
      <div className="find-details__shell">
        <div className="skeleton detail-skeleton__back" />
        <div className="skeleton detail-skeleton__title" />
        <div className="skeleton detail-skeleton__subtitle" />
        <div className="skeleton detail-skeleton__media" />
        <div className="detail-skeleton__actions">
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
        <div className="skeleton detail-skeleton__body" />
      </div>
    </main>
  )
}

function getRegionLabel(region: Region) {
  return [region.country, region.region, region.city].filter(Boolean).join(', ')
}

function getCategoryPath(categoryId: string, categories: FindCategory[]) {
  const path: FindCategory[] = []
  let category = categories.find((item) => item.id === categoryId)

  while (category && path.length < 3) {
    path.unshift(category)
    const parentId = category.parentId
    category = parentId
      ? categories.find((item) => item.id === parentId)
      : undefined
  }

  return path
}
