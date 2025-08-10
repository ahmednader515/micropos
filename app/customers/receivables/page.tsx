'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import MainLayout from '@/components/MainLayout'

type Invoice = { id: string; invoiceNumber: string; customer?: { id: string; name: string } | null; date: string; total: number; paid: number; remaining: number }

export default function CustomersReceivablesPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([])
  const [rows, setRows] = useState<Invoice[]>([])
  const [summary, setSummary] = useState<{ totalRemaining: number; count: number; byCustomer: { customerId: string; name: string; remaining: number }[] } | null>(null)
  const searchParams = useSearchParams()
  const showSummary = searchParams.get('summary') === '1'
  const [status, setStatus] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED'>('ALL')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      const r = await fetch('/api/customers')
      const j = await r.json()
      setCustomers((j.customers || []).map((c: any) => ({ id: c.id, name: c.name })))
    })()
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const qp = new URLSearchParams()
      if (from) qp.set('from', from)
      if (to) qp.set('to', to)
      if (customerId) qp.set('customerId', customerId)
      if (status) qp.set('status', status)
      const r = await fetch(`/api/customers/receivables?${qp.toString()}`)
      const j = await r.json()
      setRows(j.invoices || [])
      setSummary(j.summary || null)
    } finally {
      setLoading(false)
    }
  }

  const totals = useMemo(() => {
    let remaining = 0
    for (const i of rows) remaining += Number(i.remaining || 0)
    return { remaining: Number(remaining.toFixed(2)) }
  }, [rows])

  return (
    <MainLayout navbarTitle="ذمم العملاء" onBack={() => history.back()}>
      <div className="space-y-4" dir="rtl">
        <div className="bg-white rounded p-4 shadow grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-sm mb-1">من</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">إلى</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">العميل</label>
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">الكل</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">الحالة</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full border rounded px-3 py-2">
              <option value="ALL">الكل</option>
              <option value="PENDING">معلق</option>
              <option value="COMPLETED">مكتمل</option>
              <option value="CANCELLED">ملغي</option>
              <option value="REFUNDED">مسترجع</option>
            </select>
          </div>
          <div className="flex items-end justify-end">
            <button onClick={load} className="px-4 py-2 bg-blue-600 text-white rounded">عرض</button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-6"><div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"/></div>
        ) : (
          <div className="bg-white rounded shadow overflow-x-auto">
            {!showSummary ? (
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-right">التاريخ</th>
                    <th className="px-3 py-2 text-right">الفاتورة</th>
                    <th className="px-3 py-2 text-right">العميل</th>
                    <th className="px-3 py-2 text-right">الإجمالي</th>
                    <th className="px-3 py-2 text-right">المدفوع</th>
                    <th className="px-3 py-2 text-right">المتبقي</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((i) => (
                    <tr key={i.id} className="border-t">
                      <td className="px-3 py-2">{new Date(i.date).toLocaleDateString('ar')}</td>
                      <td className="px-3 py-2">{i.invoiceNumber}</td>
                      <td className="px-3 py-2">{i.customer?.name || '-'}</td>
                      <td className="px-3 py-2">{Number(i.total).toFixed(2)}</td>
                      <td className="px-3 py-2">{Number(i.paid).toFixed(2)}</td>
                      <td className="px-3 py-2">{Number(i.remaining).toFixed(2)}</td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr><td className="px-3 py-6 text-center" colSpan={6}>لا توجد بيانات</td></tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-3 py-2" colSpan={5}>الإجمالي المتبقي</td>
                    <td className="px-3 py-2">{totals.remaining.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-right">العميل</th>
                    <th className="px-3 py-2 text-right">المتبقي</th>
                  </tr>
                </thead>
                <tbody>
                  {summary?.byCustomer?.map((c) => (
                    <tr key={c.customerId} className="border-t">
                      <td className="px-3 py-2">{c.name}</td>
                      <td className="px-3 py-2">{Number(c.remaining).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-3 py-2">الإجمالي المتبقي</td>
                    <td className="px-3 py-2">{Number(summary?.totalRemaining || 0).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  )
}


