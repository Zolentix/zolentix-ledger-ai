import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const vendors = [
  { name: 'TechCorp Solutions', items: ['Cloud hosting (monthly)', 'SSL Certificate', 'Domain renewal'] },
  { name: 'CloudBase Inc', items: ['AWS Infrastructure', 'Data transfer', 'Support plan'] },
  { name: 'DesignHQ Studio', items: ['Brand identity package', 'UI/UX consultation', 'Asset library'] },
  { name: 'PrintWorks GmbH', items: ['Business cards (500x)', 'Letterheads', 'Envelopes'] },
  { name: 'Office Depot', items: ['Monitors (2x)', 'Keyboard set', 'Desk lamp', 'Cable organizer'] },
  { name: 'DataStream Analytics', items: ['Analytics platform', 'Custom dashboard', 'API access'] },
  { name: 'LegalEase Partners', items: ['Contract review', 'Compliance audit'] },
  { name: 'MarketingPro Agency', items: ['Social media campaign', 'Content creation', 'SEO audit'] },
  { name: 'Velocity Logistics', items: ['Express shipping (12x)', 'Packaging materials'] },
  { name: 'SecureNet Systems', items: ['Firewall license', 'Penetration testing', 'Security audit'] },
  { name: 'GreenOffice Supplies', items: ['Recycled paper (10 reams)', 'Eco pens (box)', 'Notebooks'] },
  { name: 'WebFlow Hosting', items: ['Premium hosting plan', 'CDN service', 'Email hosting'] },
]

async function main() {
  await prisma.lineItem.deleteMany()
  await prisma.document.deleteMany()

  let count = 0
  for (let i = 0; i < vendors.length; i++) {
    const v = vendors[i]
    const d = new Date()
    d.setDate(d.getDate() - Math.floor(Math.random() * 180))
    const dateStr = d.toISOString().split('T')[0]

    const items = v.items.map(desc => {
      const qty = 1 + Math.floor(Math.random() * 3)
      const unit = 50 + Math.floor(Math.random() * 500)
      return { description: desc, quantity: qty, unitPrice: unit, total: qty * unit }
    })

    const subtotal = items.reduce((s, it) => s + it.total, 0)
    const tax = Math.round(subtotal * 0.21)
    const total = subtotal + tax
    const confidence = 0.85 + Math.random() * 0.14
    const statuses = ['extracted', 'reviewed', 'approved']
    const status = statuses[Math.floor(Math.random() * statuses.length)]

    await prisma.document.create({
      data: {
        fileName: `INV-${2024000 + i + 1}.pdf`,
        vendor: v.name,
        date: dateStr,
        subtotal,
        tax,
        total,
        currency: 'EUR',
        status,
        confidence: Math.round(confidence * 100) / 100,
        lineItems: { create: items },
      },
    })
    count++
  }
  console.log(`Seeded ${count} documents with line items`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
