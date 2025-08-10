'use client'

import { useEffect, useState } from 'react'
import MainLayout from '@/components/MainLayout'

export default function PriceAdjustPage() {
  const [mode, setMode] = useState<'percent' | 'fixed'>('percent')
  const [direction, setDirection] = useState<'increase' | 'decrease'>('increase')
  const [amount, setAmount] = useState('0')
  const [targets, setTargets] = useState<{ price: boolean; price2: boolean; price3: boolean }>({ price: true, price2: false, price3: false })
  const [onlyActive, setOnlyActive] = useState(true)
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)

  // Load categories once
  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch('/api/categories')
        const j = await r.json()
        setCategories(j.categories || [])
      } catch {}
    })()
  }, [])

  const toggle = (key: keyof typeof targets) => setTargets((p) => ({ ...p, [key]: !p[key] }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const value = parseFloat(amount)
    if (!(value > 0)) return alert('أدخل قيمة صحيحة')
    const selectedTargets = (['price', 'price2', 'price3'] as const).filter((k) => targets[k])
    if (selectedTargets.length === 0) return alert('اختر حقلاً واحداً على الأقل')
    setLoading(true)
    try {
      const r = await fetch('/api/products/bulk-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, direction, amount: value, targets: selectedTargets, onlyActive, categoryId: categoryId || null }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'فشل العملية')
      alert(`تم تحديث ${j.updated} منتج`)
    } catch (e: any) {
      alert(e.message || 'خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout navbarTitle="تعديل أسعار المنتجات" onBack={() => history.back()}>
      <div className="max-w-2xl mx-auto" dir="rtl">
        <form onSubmit={onSubmit} className="bg-white p-4 rounded shadow space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">الوضع</label>
              <select value={mode} onChange={(e) => setMode(e.target.value as any)} className="w-full border rounded px-3 py-2">
                <option value="percent">نسبة مئوية %</option>
                <option value="fixed">قيمة ثابتة</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">الاتجاه</label>
              <select value={direction} onChange={(e) => setDirection(e.target.value as any)} className="w-full border rounded px-3 py-2">
                <option value="increase">زيادة</option>
                <option value="decrease">تخفيض</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">القيمة</label>
              <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm mb-1">التصنيف</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="">كل التصنيفات</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">الحقول المستهدفة</label>
            <div className="flex gap-4">
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={targets.price} onChange={() => toggle('price')} /> سعر 1</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={targets.price2} onChange={() => toggle('price2')} /> سعر 2</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={targets.price3} onChange={() => toggle('price3')} /> سعر 3</label>
            </div>
          </div>

          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} /> المنتجات الفعالة فقط</label>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => history.back()} className="px-4 py-2 bg-gray-100 rounded">إلغاء</button>
            <button disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'جاري التنفيذ...' : 'تنفيذ'}</button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}


