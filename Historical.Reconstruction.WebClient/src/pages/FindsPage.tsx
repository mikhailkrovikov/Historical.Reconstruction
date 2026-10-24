import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import searchIcon from '../assets/search.svg'
import { FindCard } from '../features/finds/components/FindCard.tsx'
import { useFinds } from '../features/finds/hooks/useFinds.ts'
import {
  useCategories,
  useRegions,
} from '../features/finds/hooks/useReferenceData.ts'
import type { FindFilters, HistoricalFind } from '../features/finds/types.ts'
import { Dropdown, type DropdownOption } from '../shared/ui/Dropdown'
import { Heading } from '../shared/ui/Heading'

const PAGE_SIZE = 12

export function FindsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = getFilters(searchParams)
  const { data, error, isError, isPending, refetch } = useFinds(filters)
  const categories = useCategories()
  const regions = useRegions()
  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [country, setCountry] = useState('')
  const [period, setPeriod] = useState('')
  const finds = useMemo(() => data?.items ?? [], [data?.items])
  const categoryOptions = useMemo<DropdownOption[]>(
    () => [
      { value: '', label: 'Тип' },
      ...(categories.data?.map((category) => ({
        value: category.id,
        label: category.name,
      })) ?? []),
    ],
    [categories.data],
  )
  const countryOptions = useMemo<DropdownOption[]>(
    () => [
      { value: '', label: 'Страна' },
      ...[...new Set(regions.data?.map(region => region.country) ?? [])]
        .sort((a, b) => a.localeCompare(b, 'ru'))
        .map(name => ({ value: name, label: name })),
    ],
    [regions.data],
  )
  const countriesByRegion = useMemo(
    () => new Map(regions.data?.map(region => [region.id, region.country]) ?? []),
    [regions.data],
  )
  const regionLabels = useMemo(
    () =>
      new Map(
        regions.data?.map((region) => [
          region.id,
          region.region ?? region.city ?? region.country,
        ]) ?? [],
      ),
    [regions.data],
  )
  const visibleFinds = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ru')

    return finds.filter((find) => {
      const matchesQuery =
        !normalizedQuery ||
        find.name.toLocaleLowerCase('ru').includes(normalizedQuery) ||
        find.description.toLocaleLowerCase('ru').includes(normalizedQuery)
      const matchesCategory = !categoryId || find.findCategoryId === categoryId
      const matchesCountry = !country || countriesByRegion.get(find.regionId) === country

      return (
        matchesQuery &&
        matchesCategory &&
        matchesCountry &&
        matchesCentury(find, period)
      )
    })
  }, [categoryId, country, countriesByRegion, finds, period, query])

  function changePage(page: number) {
    const nextParams = new URLSearchParams(searchParams)

    if (page <= 1) {
      nextParams.delete('page')
    } else {
      nextParams.set('page', page.toString())
    }

    setSearchParams(nextParams)
  }

  return (
    <main className="catalog">
      <div className="catalog__shell">
        <Heading
          leftContent="Каталог"
          buttonLabel="Добавить находку"
          buttonProps={{ onClick: () => navigate('/finds/new') }}
        />

        <section className="catalog__toolbar" aria-label="Фильтры каталога">
          <label className="catalog__search">
            <img src={searchIcon} alt="" aria-hidden="true" />
            <input
              type="search"
              value={query}
              placeholder="Поиск"
              aria-label="Поиск находок"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <div className="catalog__dropdowns">
            <Dropdown
              className="catalog__filter"
              options={categoryOptions}
              value={categoryId}
              placeholder="Тип"
              aria-label="Фильтр по типу"
              onChange={setCategoryId}
            />
            <Dropdown
              className="catalog__filter"
              options={countryOptions}
              value={country}
              placeholder="Страна"
              aria-label="Фильтр по стране"
              onChange={setCountry}
            />
            <Dropdown
              className="catalog__filter"
              options={PERIOD_OPTIONS}
              value={period}
              placeholder="Век"
              aria-label="Фильтр по веку"
              onChange={setPeriod}
            />
          </div>
        </section>

        {isPending && <FindsSkeleton />}

        {isError && (
          <section className="catalog-state" role="alert">
            <span className="catalog-state__icon" aria-hidden="true">
              !
            </span>
            <h2>Не удалось загрузить находки</h2>
            <p>{getErrorMessage(error)}</p>
            <button type="button" onClick={() => void refetch()}>
              Попробовать снова
            </button>
          </section>
        )}

        {!isPending && !isError && finds.length === 0 && (
          <section className="catalog-state">
            <span className="catalog-state__icon" aria-hidden="true">
              0
            </span>
            <h2>Каталог пока пуст</h2>
            <p>В API пока нет находок для отображения.</p>
          </section>
        )}

        {!isPending && !isError && finds.length > 0 && visibleFinds.length === 0 && (
          <section className="catalog-state">
            <span className="catalog-state__icon" aria-hidden="true">
              0
            </span>
            <h2>Ничего не найдено</h2>
            <p>Измените поисковый запрос или выбранные фильтры.</p>
          </section>
        )}

        {!isPending && !isError && visibleFinds.length > 0 && data && (
          <>
            <section className="finds-grid" aria-label="Список исторических находок">
              {visibleFinds.map((find) => (
                <FindCard
                  key={find.id}
                  find={find}
                  regionLabel={regionLabels.get(find.regionId)}
                />
              ))}
            </section>

            {data.totalPages > 1 && (
              <nav className="pagination" aria-label="Навигация по страницам">
                <button
                  type="button"
                  disabled={data.page <= 1}
                  onClick={() => changePage(data.page - 1)}
                >
                  ← Назад
                </button>
                <span>
                  Страница <strong>{data.page}</strong> из {data.totalPages}
                </span>
                <button
                  type="button"
                  disabled={data.page >= data.totalPages}
                  onClick={() => changePage(data.page + 1)}
                >
                  Дальше →
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  )
}

const PERIOD_OPTIONS: DropdownOption[] = [
  { value: '', label: 'Век' },
  { value: 'bc', label: 'До н. э.' },
  ...Array.from({ length: 21 }, (_, index) => ({
    value: String(index + 1),
    label: `${index + 1} век`,
  })),
]

function matchesCentury(find: HistoricalFind, century: string) {
  if (!century) return true
  if (find.dateUnknown) return false
  if (century === 'bc') return find.dateFromYear < 0

  // Preserve explicitly listed centuries from the source (e.g. 8 and 11, not 9–10).
  const listed = [...(find.datingLabel ?? '').matchAll(/(\d+)\s*век/g)]
  if (listed.length) return listed.some(match => match[1] === century)

  const value = Number(century)
  return find.dateToYear >= (value - 1) * 100 + 1 && find.dateFromYear <= value * 100
}
function FindsSkeleton() {
  return (
    <section className="finds-grid" aria-label="Загрузка находок" aria-busy="true">
      {Array.from({ length: PAGE_SIZE }, (_, index) => index).map((item) => (
        <article className="find-card find-card--skeleton" key={item}>
          <div className="skeleton skeleton--media" />
          <div className="find-card__body">
            <div className="skeleton skeleton--label" />
            <div className="skeleton skeleton--title" />
            <div className="skeleton skeleton--text" />
            <div className="skeleton skeleton--text skeleton--short" />
          </div>
        </article>
      ))}
    </section>
  )
}

function getFilters(searchParams: URLSearchParams): FindFilters {
  return {
    page: parsePositiveInteger(searchParams.get('page')),
    pageSize: PAGE_SIZE,
  }
}

function parsePositiveInteger(value: string | null) {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

function getErrorMessage(error: Error) {
  return error.message || 'Убедитесь, что backend запущен на порту 5145.'
}
