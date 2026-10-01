import { memo } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface ProductFilterValues {
  minPrice: string
  maxPrice: string
  sort: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest'
}

interface ProductFiltersProps {
  values: ProductFilterValues
  onChange: (values: ProductFilterValues) => void
  idPrefix?: string
}

export const ProductFilters = memo(function ProductFilters({
  values,
  onChange,
  idPrefix = 'filter',
}: ProductFiltersProps) {
  const set = (patch: Partial<ProductFilterValues>) =>
    onChange({ ...values, ...patch })

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-sort`}>Sort by</Label>
        <Select value={values.sort} onValueChange={(v) => set({ sort: v as ProductFilterValues['sort'] })}>
          <SelectTrigger id={`${idPrefix}-sort`}>
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="name_asc">Name: A–Z</SelectItem>
            <SelectItem value="name_desc">Name: Z–A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-min`}>Min price (₹)</Label>
          <Input
            id={`${idPrefix}-min`}
            type="number"
            min={0}
            value={values.minPrice}
            onChange={(e) => set({ minPrice: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-max`}>Max price (₹)</Label>
          <Input
            id={`${idPrefix}-max`}
            type="number"
            min={0}
            value={values.maxPrice}
            onChange={(e) => set({ maxPrice: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
})

export const defaultProductFilters: ProductFilterValues = {
  minPrice: '',
  maxPrice: '',
  sort: 'newest',
}
