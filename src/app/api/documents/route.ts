import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''

  const where: any = {}
  if (search) where.vendor = { contains: search }
  if (status) where.status = status

  const docs = await prisma.document.findMany({
    where,
    include: { lineItems: true },
    orderBy: { extractedAt: 'desc' },
  })
  return NextResponse.json({ documents: docs })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const doc = await prisma.document.create({
    data: {
      fileName: body.fileName,
      vendor: body.vendor,
      date: body.date,
      subtotal: body.subtotal,
      tax: body.tax,
      total: body.total,
      currency: body.currency || 'EUR',
      confidence: body.confidence || 0.92,
      status: 'extracted',
      lineItems: { create: body.lineItems || [] },
    },
    include: { lineItems: true },
  })
  return NextResponse.json({ document: doc })
}
