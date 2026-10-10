import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Formats an amount as Indian Rupees, e.g. 1192.8 → "₹1,192.80". */
export function formatCurrency(amount: number | null | undefined): string {
  return inrFormatter.format(Number(amount ?? 0))
}
