import type { CreateFindRequest, FindCategory, FindFilters, FindImage, HistoricalFind, PagedResponse, Region } from '../types'
import { HttpError } from '../../../shared/api/httpClient'

export const demoRegions: Region[] = [
  { id: 'region-1', country: 'Россия', region: 'Новгородская область', city: 'Великий Новгород' },
  { id: 'region-2', country: 'Россия', region: 'Республика Крым', city: null },
  { id: 'region-3', country: 'Россия', region: 'Тульская область', city: null },
]
export const demoCategories: FindCategory[] = [
  { id: 'category-1', name: 'Керамика', parentId: null },
  { id: 'category-2', name: 'Украшения', parentId: null },
  { id: 'category-3', name: 'Орудия труда', parentId: null },
]
const examples = [
  ['Глиняный сосуд', -500, -300, 'category-1', 'region-2', 'vessel'],
  ['Бронзовая фибула', 100, 300, 'category-2', 'region-2', 'brooch'],
  ['Каменный наконечник', -3000, -2000, 'category-3', 'region-3', 'arrow'],
  ['Керамический кувшин', 900, 1100, 'category-1', 'region-1', 'vessel'],
  ['Височное кольцо', 1000, 1200, 'category-2', 'region-1', 'brooch'],
  ['Кремнёвое остриё', -5000, -3500, 'category-3', 'region-3', 'arrow'],
  ['Сосуд с орнаментом', -800, -600, 'category-1', 'region-2', 'vessel'],
  ['Металлическая застёжка', 700, 900, 'category-2', 'region-1', 'brooch'],
  ['Наконечник стрелы', -1200, -800, 'category-3', 'region-3', 'arrow'],
  ['Фрагмент амфоры', -200, 100, 'category-1', 'region-2', 'vessel'],
  ['Кольцевая подвеска', 1200, 1400, 'category-2', 'region-1', 'brooch'],
  ['Каменный скребок', -6000, -4000, 'category-3', 'region-3', 'arrow'],
  ['Небольшой глиняный горшок', 1300, 1500, 'category-1', 'region-1', 'vessel'],
  ['Бронзовое украшение', -600, -400, 'category-2', 'region-2', 'brooch'],
  ['Кремнёвый резец', -4000, -2500, 'category-3', 'region-3', 'arrow'],
] as const
const finds: HistoricalFind[] = examples.map(([name, from, to, category, region, picture], index) => ({
  id: `demo-${index + 1}`, name, dateFromYear: from, dateToYear: to,
  findCategoryId: category, regionId: region, sourceUrl: null,
  description: 'Учебная запись для демонстрации интерфейса. Название, датировка и место условные и не описывают документированную археологическую находку.',
  images: [{ id: `image-${index + 1}`, url: `${import.meta.env.BASE_URL}demo/${picture}.svg`, caption: 'Условная иллюстрация', sortOrder: 0 }],
}))

export function getDemoFinds(filters: FindFilters): PagedResponse<HistoricalFind> {
  const pageSize = Math.max(1, filters.pageSize)
  const page = Math.max(1, filters.page)
  return { items: finds.slice((page - 1) * pageSize, page * pageSize), page, pageSize, totalCount: finds.length, totalPages: Math.ceil(finds.length / pageSize) }
}
export function getDemoFind(id: string): HistoricalFind {
  const find = finds.find(item => item.id === id)
  if (!find) throw new HttpError(404, 'Находка не найдена')
  return find
}
export function createDemoFind(request: CreateFindRequest): HistoricalFind {
  const find = { ...request, id: crypto.randomUUID(), images: [] }
  finds.unshift(find)
  return find
}
export function uploadDemoImage(id: string, file: File, caption: string): FindImage {
  if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 5 * 1024 * 1024 || file.size === 0)
    throw new HttpError(400, 'Выберите JPEG или PNG размером до 5 МБ.')
  const find = getDemoFind(id)
  const image = { id: crypto.randomUUID(), url: URL.createObjectURL(file), caption: caption.trim() || null, sortOrder: find.images.length }
  find.images = [...find.images, image]
  return image
}
