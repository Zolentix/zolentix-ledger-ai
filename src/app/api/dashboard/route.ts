import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const docs = await prisma.document.findMany({ include: { lineItems: true } })

  const totalSpend = docs.reduce((s, d) => s + d.total, 0)
  const avgInvoice = docs.length > 0 ? totalSpend / docs.length : 0

  const byVendor: Record<string, number> = {}
  const byMonth: Record<string, number> = {}
  for (const d of docs) {
    byVendor[d.vendor] = (byVendor[d.vendor] || 0) + d.total
    const month = d.date.slice(0, 7)
    byMonth[month] = (byMonth[month] || 0) + d.total
  }

  const vendorData = Object.entries(byVendor)
    .map(([vendor, total]) => ({ vendor, total }))
    .sort((a, b) => b.total - a.total)

  const monthData = Object.entries(byMonth)
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month))

  const topVendor = vendorData[0]?.vendor || 'N/A'
  const statusCounts = { extracted: 0, reviewed: 0, approved: 0 }
  for (const d of docs) {
    if (d.status in statusCounts) statusCounts[d.status as keyof typeof statusCounts]++
  }

  return NextResponse.json({
    totalSpend, avgInvoice, docCount: docs.length, topVendor,
    vendorData, monthData, statusCounts,
  })
}
