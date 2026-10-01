import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal } from 'lucide-react'
import { productApi } from '@/api/product.api'
import { ProductGrid } from '@/components/ProductGrid'
import { Pagination } from '@/components/Pagination'
import {
  ProductFilters,
  type ProductFilterValues,
} from '@/components/ProductFilters'
import { LoadingState } from '@/components/LoadingState'
import { EmptyState } from '@/components/EmptyState'
import { ErrorMessage } from '@/components/ErrorMessage'
import { Button } from '@/components/ui/button'
import { LoadingButton } from '@/components/ui/loading-button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { createEffectGuard } from '@/lib/effect-guard'
import type { PaginatedProducts } from '@/types/product'

const PAGE_SIZE = 20

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState<PaginatedProducts | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '')

  const page = Number(searchParams.get('page') ?? '1') || 1
  const search = searchParams.get('search') ?? ''

  const filters: ProductFilterValues = useMemo(
    () => ({
      minPrice: searchParams.get('min_price') ?? '',
      maxPrice: searchParams.get('max_price') ?? '',
      sort: (searchParams.get('sort') as ProductFilterValues['sort']) ?? 'newest',
    }),
    [searchParams],
  )

  const updateParams = useCallback(
    (patch: Record<string, string | null>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        Object.entries(patch).forEach(([key, value]) => {
          if (value === null || value === '') next.delete(key)
          else next.set(key, value)
        })
        return next
      })
    },
    [setSearchParams],
  )

  const loadProducts = useCallback(
    (isActive: () => boolean = () => true) => {
      setLoading(true)
      setError(null)
      const min = filters.minPrice ? Number(filters.minPrice) : undefined
      const max = filters.maxPrice ? Number(filters.maxPrice) : undefined
      productApi
        .getProducts({
          page,
          limit: PAGE_SIZE,
          search: search || undefined,
          min_price: min,
          max_price: max,
          sort: filters.sort,
        })
        .then((result) => {
          if (isActive()) setData(result)
        })
        .catch(() => {
          if (isActive()) setError('Something went wrong. Please try again.')
        })
        .finally(() => {
          if (isActive()) setLoading(false)
        })
    },
    [filters, page, search],
  )

  useEffect(() => {
    const guard = createEffectGuard()
    loadProducts(guard.isActive)
    return () => guard.cancel()
  }, [loadProducts])

  useEffect(() => {
    const stale: Record<string, null> = {}
    if (searchParams.has('product_type')) stale.product_type = null
    if (searchParams.has('in_stock')) stale.in_stock = null
    if (Object.keys(stale).length > 0) updateParams(stale)
  }, [searchParams, updateParams])

  const applyFilters = useCallback(
    (values: ProductFilterValues) => {
      updateParams({
        page: '1',
        min_price: values.minPrice || null,
        max_price: values.maxPrice || null,
        sort: values.sort === 'newest' ? null : values.sort,
      })
    },
    [updateParams],
  )

  const submitSearch = (e: FormEvent) => {
    e.preventDefault()
    updateParams({ page: '1', search: searchInput.trim() || null })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl">Products</h1>
        <p className="text-muted-foreground">Browse paintings and art materials</p>
      </div>

      <form onSubmit={submitSearch} className="flex gap-2">
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search paintings and art materials..."
          aria-label="Search products"
          className="max-w-xl"
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <LoadingButton type="submit" size="icon" loading={loading} aria-label="Search products">
              <Search className="h-4 w-4" />
            </LoadingButton>
          </TooltipTrigger>
          <TooltipContent>Search</TooltipContent>
        </Tooltip>
      </form>

      <div className="flex gap-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <ProductFilters values={filters} onChange={applyFilters} />
        </aside>

        <div className="min-w-0 flex-1 space-y-6">
          <div className="flex justify-end lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <ProductFilters
                    idPrefix="mobile"
                    values={filters}
                    onChange={applyFilters}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {loading ? <LoadingState message="Loading products..." /> : null}
          {error ? (
            <ErrorMessage message={error} onRetry={() => loadProducts()} retryLoading={loading} />
          ) : null}
          {!loading && !error && (data?.items?.length ?? 0) === 0 ? (
            <EmptyState title="No products found." />
          ) : null}
          {!loading && !error && data && (data.items?.length ?? 0) > 0 ? (
            <>
              <ProductGrid products={data.items} />
              <Pagination
                page={data.page}
                totalPages={data.total_pages}
                disabled={loading}
                onPageChange={(p) => updateParams({ page: String(p) })}
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
