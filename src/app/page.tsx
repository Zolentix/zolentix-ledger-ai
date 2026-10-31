'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface LineItem { id: string; description: string; quantity: number; unitPrice: number; total: number }
interface Doc { id: string; fileName: string; vendor: string; date: string; subtotal: number; tax: number; total: number; currency: string; status: string; confidence: number; lineItems: LineItem[] }
interface DashData { totalSpend: number; avgInvoice: number; docCount: number; topVendor: string; vendorData: Array<{vendor:string;total:number}>; monthData: Array<{month:string;total:number}>; statusCounts: Record<string,number> }

function fmt(n: number) { return new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n) }

const STATUS_COLORS: Record<string,string> = { extracted: '#F59E0B', reviewed: '#22D3EE', approved: '#22C55E' }

export default function LedgerDashboard() {
  const [dash, setDash] = useState<DashData | null>(null)
  const [docs, setDocs] = useState<Doc[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(setDash)
    fetch('/api/documents').then(r => r.json()).then(d => setDocs(d.documents || []))
  }, [])

  const filtered = docs.filter(d =>
    (!search || d.vendor.toLowerCase().includes(search.toLowerCase()) || d.fileName.toLowerCase().includes(search.toLowerCase())) &&
    (!filter || d.status === filter)
  )

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#1E1E36] bg-[#0A0A0F]/80 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #6D4AFF, #8B5CF6)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8M10 9H8"/></svg>
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Ledger-AI</h1>
            <p className="text-xs text-[#6B6B8D]">Invoice Intelligence</p>
          </div>
        </div>
        <button onClick={() => setShowUpload(true)} className="rounded-xl bg-gradient-to-r from-[#6D4AFF] to-[#8B5CF6] px-5 py-2.5 text-sm font-bold text-white hover:opacity-90">
          + Upload Invoice
        </button>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-6">
        {dash && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'TOTAL SPEND', value: fmt(dash.totalSpend), color: '#22C55E' },
                { label: 'DOCUMENTS', value: dash.docCount.toString(), color: '#22D3EE' },
                { label: 'AVG INVOICE', value: fmt(dash.avgInvoice), color: '#8B5CF6' },
                { label: 'TOP VENDOR', value: dash.topVendor, color: '#F59E0B' },
              ].map(k => (
                <div key={k.label} className="rounded-2xl border border-[#1E1E36] bg-[#13131C] p-5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6B8D]">{k.label}</span>
                  <div className="mt-2 text-2xl font-bold" style={{ fontFamily: '"Space Grotesk", sans-serif', color: k.color }}>{k.value}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-[#1E1E36] bg-[#13131C] p-5">
                <h2 className="mb-4 text-base font-bold" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Spend by Month</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dash.monthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E1E36" />
                      <XAxis dataKey="month" tick={{ fill: '#6B6B8D', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#6B6B8D', fontSize: 11 }} tickFormatter={v => `€${Math.round(Number(v)/1000)}k`} />
                      <Tooltip contentStyle={{ background: '#13131C', border: '1px solid #1E1E36', borderRadius: 12 }} labelStyle={{ color: '#6B6B8D' }} formatter={(v: number) => fmt(v)} />
                      <Bar dataKey="total" fill="#6D4AFF" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-[#1E1E36] bg-[#13131C] p-5">
                <h2 className="mb-4 text-base font-bold" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>By Vendor</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dash.vendorData.slice(0, 6)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E1E36" horizontal={false} />
                      <XAxis type="number" tick={{ fill: '#6B6B8D', fontSize: 11 }} tickFormatter={v => `€${Math.round(Number(v)/1000)}k`} />
                      <YAxis dataKey="vendor" type="category" tick={{ fill: '#6B6B8D', fontSize: 10 }} width={120} />
                      <Tooltip contentStyle={{ background: '#13131C', border: '1px solid #1E1E36', borderRadius: 12 }} formatter={(v: number) => fmt(v)} />
                      <Bar dataKey="total" fill="#22D3EE" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="rounded-2xl border border-[#1E1E36] bg-[#13131C] p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Documents</h2>
            <div className="flex items-center gap-2">
              <input type="text" placeholder="Search vendor..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 rounded-lg border border-[#1E1E36] bg-[#0A0A0F] px-3 text-xs text-[#EDEDF2] placeholder:text-[#6B6B8D] focus:border-[#6D4AFF] focus:outline-none" />
              <select value={filter} onChange={e => setFilter(e.target.value)} className="h-9 rounded-lg border border-[#1E1E36] bg-[#0A0A0F] px-3 text-xs text-[#EDEDF2] focus:outline-none">
                <option value="">All</option>
                <option value="extracted">Extracted</option>
                <option value="reviewed">Reviewed</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#1E1E36] text-xs text-[#6B6B8D]">
                <tr>
                  <th className="pb-3 font-medium">File</th>
                  <th className="pb-3 font-medium">Vendor</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                  <th className="pb-3 font-medium text-center">Confidence</th>
                  <th className="pb-3 font-medium text-center">Status</th>
                  <th className="pb-3 font-medium text-center">Items</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E1E36]">
                {filtered.map(d => (
                  <tr key={d.id} className="cursor-pointer hover:bg-[#1A1A28]/50" onClick={() => setExpandedDoc(expandedDoc === d.id ? null : d.id)}>
                    <td className="py-3 font-mono text-xs text-[#A78BFA]">{d.fileName}</td>
                    <td className="py-3">{d.vendor}</td>
                    <td className="py-3 text-[#6B6B8D]">{d.date}</td>
                    <td className="py-3 text-right font-mono font-semibold">{fmt(d.total)}</td>
                    <td className="py-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${d.confidence >= 0.95 ? 'bg-[#22C55E]/10 text-[#22C55E]' : d.confidence >= 0.9 ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                        {Math.round(d.confidence * 100)}%
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: `${STATUS_COLORS[d.status]}15`, color: STATUS_COLORS[d.status] }}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3 text-center text-[#6B6B8D]">{d.lineItems.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowUpload(false)}>
          <div className="mx-4 w-full max-w-lg rounded-2xl border border-[#1E1E36] bg-[#13131C] p-6" onClick={e => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-bold" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Mock Extraction Preview</h3>
            <p className="mb-4 text-sm text-[#6B6B8D]">Upload simulation — in production this uses AI vision to extract fields.</p>
            <div className="space-y-3 rounded-xl bg-[#0A0A0F] p-4">
              {[
                { label: 'Vendor', value: 'TechCorp Solutions', conf: 0.98 },
                { label: 'Date', value: '2024-10-15', conf: 0.95 },
                { label: 'Subtotal', value: '€2,450.00', conf: 0.92 },
                { label: 'Tax (21%)', value: '€514.50', conf: 0.88 },
                { label: 'Total', value: '€2,964.50', conf: 0.96 },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-3">
                  <span className="w-20 text-xs text-[#6B6B8D]">{f.label}</span>
                  <input defaultValue={f.value} className="flex-1 rounded-lg border border-[#1E1E36] bg-[#13131C] px-3 py-2 text-sm text-[#EDEDF2] focus:border-[#6D4AFF] focus:outline-none" />
                  <span className={`text-xs font-bold ${f.conf >= 0.95 ? 'text-[#22C55E]' : f.conf >= 0.9 ? 'text-[#F59E0B]' : 'text-[#EF4444]'}`}>{Math.round(f.conf * 100)}%</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowUpload(false)} className="rounded-xl border border-[#1E1E36] px-4 py-2 text-sm text-[#6B6B8D] hover:text-[#EDEDF2]">Cancel</button>
              <button onClick={() => setShowUpload(false)} className="rounded-xl bg-gradient-to-r from-[#6D4AFF] to-[#8B5CF6] px-4 py-2 text-sm font-bold text-white">Save Record</button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-[#1E1E36] py-6 text-center text-xs text-[#6B6B8D]">
        Built by <a href="https://zolentix.com" className="text-[#A78BFA] hover:underline">Zolentix</a>
      </footer>
    </div>
  )
}
