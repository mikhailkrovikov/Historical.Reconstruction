export interface FindImage {
  id: string
  url: string
  sortOrder: number
  caption: string | null
}

export interface HistoricalFind {
  id: string
  name: string
  regionId: string
  findCategoryId: string
  datingLabel?: string
  dateUnknown?: boolean
  dateFromYear: number
  dateToYear: number
  description: string
  sourceUrl: string | null
  images: FindImage[]
}

export interface Region {
  id: string
  country: string
  region: string | null
  city: string | null
}

export interface FindCategory {
  id: string
  name: string
  parentId: string | null
}

export interface CreateFindRequest {
  name: string
  regionId: string
  findCategoryId: string
  dateFromYear: number
  dateToYear: number
  description: string
  sourceUrl: string | null
}

export interface FindFilters {
  query?: string
  country?: string
  regionId?: string
  yearFrom?: number
  yearTo?: number
  page: number
  pageSize: number
}

export interface PagedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface ApiPaginatedResponse<T> {
  items: T[]
  pagination: {
    pageNumber: number
    pageSize: number
    totalCount: number
  }
}
