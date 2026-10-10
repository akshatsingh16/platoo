import {
  ChevronDown,
  Search,
} from "lucide-react"

import { Input } from "@/components/ui/input"

type MenuSearchProps = {
  search: string
  setSearch: (value: string) => void
  sort: string
  setSort: (value: string) => void
}

export function MenuSearch({
  search,
  setSearch,
  sort,
  setSort,
}: MenuSearchProps) {
  return (
    <div className="mb-3 flex gap-2">

      {/* Search */}
      <div className="relative flex-1">

        <Search
          className="
            absolute
            left-3
            top-1/2
            h-3.5
            w-3.5
            -translate-y-1/2
            text-gray-400
          "
        />

        <Input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search dishes, ingredients or kitchens..."
          className="
            h-9
            rounded-full
            border
            bg-white
            pl-9
            text-[9px]
            shadow-none
          "
        />

      </div>

      {/* Sort */}
      <div className="relative">

        <select
          value={sort}
          onChange={(event) =>
            setSort(event.target.value)
          }
          className="
            h-9
            appearance-none
            rounded-full
            border
            bg-white
            py-0
            pl-4
            pr-8
            text-[9px]
            outline-none
          "
        >

          <option value="Popular">
            Popular
          </option>

          <option value="Rating">
            Rating
          </option>

          <option value="Price: Low to High">
            Price: Low to High
          </option>

          <option value="Price: High to Low">
            Price: High to Low
          </option>

        </select>

        <ChevronDown
          className="
            pointer-events-none
            absolute
            right-3
            top-1/2
            h-3
            w-3
            -translate-y-1/2
          "
        />

      </div>

    </div>
  )
}