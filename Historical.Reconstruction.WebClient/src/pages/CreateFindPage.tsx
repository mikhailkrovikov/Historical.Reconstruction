import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCreateFind } from '../features/finds/hooks/useCreateFind.ts'
import {
  useCategories,
  useRegions,
} from '../features/finds/hooks/useReferenceData.ts'
import type { FindCategory, Region } from '../features/finds/types.ts'

export function CreateFindPage() {
  const navigate = useNavigate()
  const regions = useRegions()
  const categories = useCategories()
  const createFind = useCreateFind()
  const [validationError, setValidationError] = useState<string | null>(null)
  const isLoadingReferences = regions.isPending || categories.isPending
  const referenceError = regions.error ?? categories.error

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setValidationError(null)

    const formData = new FormData(event.currentTarget)
    const dateFromYear = Number(formData.get('dateFromYear'))
    const dateToYear = Number(formData.get('dateToYear'))

    if (dateFromYear > dateToYear) {
      setValidationError('Начальный год не может быть позже конечного.')
      return
    }

    const sourceUrl = String(formData.get('sourceUrl') ?? '').trim()

    createFind.mutate(
      {
        name: String(formData.get('name')).trim(),
        regionId: String(formData.get('regionId')),
        findCategoryId: String(formData.get('findCategoryId')),
        dateFromYear,
        dateToYear,
        description: String(formData.get('description')).trim(),
        sourceUrl: sourceUrl || null,
      },
      {
        onSuccess: (find) => navigate(`/finds/${find.id}`),
      },
    )
  }

  return (
    <main className="find-editor">
      <Link className="back-link" to="/finds">
        ← Вернуться в каталог
      </Link>

      <section className="find-editor__card">
        <header className="find-editor__header">
          <p className="catalog__eyebrow">Новая запись</p>
          <h1>Добавить находку</h1>
          <p>
            {import.meta.env.MODE === 'demo' ? 'Заполните основные сведения. В демоверсии запись сохранится до обновления страницы.' : <>Заполните основные сведения. Изображения можно будет загрузить
            на следующем шаге в карточке находки.</>}
          </p>
        </header>

        {referenceError ? (
          <section className="find-editor__reference-error" role="alert">
            <h2>Не удалось загрузить справочники</h2>
            <p>{referenceError.message}</p>
            <button
              type="button"
              onClick={() => {
                void regions.refetch()
                void categories.refetch()
              }}
            >
              Попробовать снова
            </button>
          </section>
        ) : (
          <form className="find-form" onSubmit={handleSubmit}>
            <div className="find-form__field find-form__field--wide">
              <label htmlFor="find-name">Название</label>
              <input
                id="find-name"
                name="name"
                type="text"
                maxLength={200}
                placeholder="Например, бронзовая фибула"
                required
                autoFocus
              />
            </div>

            <div className="find-form__field">
              <label htmlFor="find-region">Место находки</label>
              <select
                id="find-region"
                name="regionId"
                defaultValue=""
                disabled={isLoadingReferences}
                required
              >
                <option value="" disabled>
                  {isLoadingReferences ? 'Загрузка…' : 'Выберите регион'}
                </option>
                {regions.data?.map((region) => (
                  <option key={region.id} value={region.id}>
                    {getRegionLabel(region)}
                  </option>
                ))}
              </select>
            </div>

            <div className="find-form__field">
              <label htmlFor="find-category">Категория</label>
              <select
                id="find-category"
                name="findCategoryId"
                defaultValue=""
                disabled={isLoadingReferences}
                required
              >
                <option value="" disabled>
                  {isLoadingReferences ? 'Загрузка…' : 'Выберите категорию'}
                </option>
                {categories.data?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {getCategoryLabel(category, categories.data)}
                  </option>
                ))}
              </select>
            </div>

            <fieldset className="find-form__period">
              <legend>Датировка</legend>
              <div className="find-form__period-fields">
                <div className="find-form__field">
                  <label htmlFor="find-year-from">Год от</label>
                  <input
                    id="find-year-from"
                    name="dateFromYear"
                    type="number"
                    placeholder="−1300"
                    required
                  />
                </div>
                <div className="find-form__field">
                  <label htmlFor="find-year-to">Год до</label>
                  <input
                    id="find-year-to"
                    name="dateToYear"
                    type="number"
                    placeholder="−1200"
                    required
                  />
                </div>
              </div>
              <p>Для дат до нашей эры используйте отрицательные числа.</p>
            </fieldset>

            <div className="find-form__field find-form__field--wide">
              <label htmlFor="find-description">Описание</label>
              <textarea
                id="find-description"
                name="description"
                rows={7}
                maxLength={1000}
                placeholder="Опишите находку, её материал, состояние и контекст обнаружения"
                required
              />
            </div>

            <div className="find-form__field find-form__field--wide">
              <label htmlFor="find-source">Ссылка на источник <span>необязательно</span></label>
              <input
                id="find-source"
                name="sourceUrl"
                type="url"
                maxLength={300}
                placeholder="https://example.com/archive/item"
              />
            </div>

            {(validationError || createFind.isError) && (
              <p className="find-form__error" role="alert">
                {validationError ?? createFind.error?.message}
              </p>
            )}

            <div className="find-form__actions">
              <Link to="/finds">Отмена</Link>
              <button
                type="submit"
                disabled={isLoadingReferences || createFind.isPending}
              >
                {createFind.isPending ? 'Сохраняем…' : 'Создать находку'}
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  )
}

function getRegionLabel(region: Region) {
  return [region.country, region.region, region.city].filter(Boolean).join(', ')
}

function getCategoryLabel(category: FindCategory, categories: FindCategory[]) {
  const parent = category.parentId
    ? categories.find((item) => item.id === category.parentId)
    : undefined

  return parent ? `${parent.name} — ${category.name}` : category.name
}
