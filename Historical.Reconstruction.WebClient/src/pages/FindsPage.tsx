import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import searchIcon from '../assets/search.svg'
import { FindCard } from '../features/finds/components/FindCard.tsx'
import { useFinds } from '../features/finds/hooks/useFinds.ts'
import {
  useCategories,
  useRegions,
} from '../features/finds/hooks/useReferenceData.ts'
import type { FindFilters } from '../features/finds/types.ts'
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
  const [regionId, setRegionId] = useState('')
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
  const regionOptions = useMemo<DropdownOption[]>(
    () => [
      { value: '', label: 'Регион' },
      ...(regions.data?.map((region) => ({
        value: region.id,
        label: [region.country, region.region, region.city]
          .filter(Boolean)
          .join(', '),
      })) ?? []),
    ],
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
      const matchesRegion = !regionId || find.regionId === regionId

      return (
        matchesQuery &&
        matchesCategory &&
        matchesRegion &&
        matchesPeriod(find.dateFromYear, find.dateToYear, period)
      )
    })
  }, [categoryId, finds, period, query, regionId])

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
              options={regionOptions}
              value={regionId}
              placeholder="Регион"
              aria-label="Фильтр по региону"
              onChange={setRegionId}
            />
            <Dropdown
              className="catalog__filter"
              options={PERIOD_OPTIONS}
              value={period}
              placeholder="Датировка"
              aria-label="Фильтр по датировке"
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
  { value: '', label: 'Датировка' },
  { value: 'bc', label: 'До н. э.' },
  { value: '1-5', label: 'I-V вв.' },
  { value: '6-10', label: 'VI-X вв.' },
  { value: '11-15', label: 'XI-XV вв.' },
  { value: '16-21', label: 'XVI-XXI вв.' },
]

function matchesPeriod(fromYear: number, toYear: number, period: string) {
  if (!period) return true
  if (period === 'bc') return fromYear < 0

  const [fromCentury, toCentury] = period.split('-').map(Number)
  const filterFromYear = (fromCentury - 1) * 100 + 1
  const filterToYear = toCentury * 100

  return toYear >= filterFromYear && fromYear <= filterToYear
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
