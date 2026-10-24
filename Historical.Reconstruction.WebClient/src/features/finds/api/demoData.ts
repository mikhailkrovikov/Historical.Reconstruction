import type { CreateFindRequest, FindCategory, FindFilters, FindImage, HistoricalFind, PagedResponse, Region } from '../types'
import { HttpError } from '../../../shared/api/httpClient'
import cards from './catalogCards.json'

// Snapshot of the «Карточки» tab. Updating the spreadsheet does not change the site automatically.
const locations = [...new Set(cards.map(card => `${card.country}|${card.location}`))]
const categories = [...new Set(cards.map(card => card.type))]
export const demoRegions: Region[] = locations.map((location, index) => {
  const [country, region] = location.split('|')
  return { id: `region-${index + 1}`, country, region, city: null }
})
export const demoCategories: FindCategory[] = categories.map((name, index) => ({
  id: `category-${index + 1}`, name, parentId: null,
}))
const photos: Record<string, { file: string; caption: string }> = {
  'sheet-2': { file: 'trefoil-oland.png', caption: 'Трёхлистная фибула, остров Эланд. Фото: Kalmar läns museum.' },
  'sheet-4': { file: 'ring-pin.png', caption: 'Плащевая фибула типа «игла с кольцом».' },
}
const finds: HistoricalFind[] = cards.map(card => {
  const centuries = [...card.dating.matchAll(/(\d+)\s*век/g)].map(match => Number(match[1]))
  const knownDate = centuries.length > 0
  const photo = photos[card.id]
  return {
    id: card.id,
    name: card.name,
    regionId: `region-${locations.indexOf(`${card.country}|${card.location}`) + 1}`,
    findCategoryId: `category-${categories.indexOf(card.type) + 1}`,
    dateFromYear: knownDate ? (Math.min(...centuries) - 1) * 100 + 1 : 0,
    dateToYear: knownDate ? Math.max(...centuries) * 100 : 0,
    datingLabel: card.dating,
    dateUnknown: !knownDate,
    description: `${card.description}\n\nМатериал: ${card.material}.\nМесто находки: ${card.country}, ${card.location}.\n\nИсточник: ${card.sourceText}`,
    sourceUrl: card.sourceUrl,
    images: photo ? [{ id: `${card.id}-image`, url: `${import.meta.env.BASE_URL}catalog/${photo.file}`, caption: photo.caption, sortOrder: 0 }] : [],
  }
})

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
