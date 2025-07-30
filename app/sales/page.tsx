'use client'

import MainLayout from '@/components/MainLayout'
import { useState } from 'react'

const salesMenuOptions = [
  { label: 'اعاده طباعة الفاتورة', onClick: () => alert('اعاده طباعة الفاتورة') },
  { label: 'تعديل فاتورة بيع', onClick: () => alert('تعديل فاتورة بيع') },
  { label: 'تثبيت سعر البيع 1', onClick: () => alert('تثبيت سعر البيع 1') },
  { label: 'تثبيت سعر البيع 2', onClick: () => alert('تثبيت سعر البيع 2') },
  { label: 'تثبيت سعر البيع 3', onClick: () => alert('تثبيت سعر البيع 3') },
  { label: 'الحاسبة', onClick: () => alert('الحاسبة') },
  { label: 'الأستعلام عن الباقي عند العميل', onClick: () => alert('الأستعلام عن الباقي عند العميل') },
  { label: 'استيراد البيانات من عرض سعر', onClick: () => alert('استيراد البيانات من عرض سعر') },

  { label: 'اضافة منتج جديد', onClick: () => alert('اضافة منتج جديد') },
  { label: 'مسح المنتجات من القائمة', onClick: () => alert('مسح المنتجات من القائمة') },
];

const sampleSales = [
  { name: 'حاسوب محمول', price: 3500, quantity: 2, total: 7000 },
  { name: 'هاتف ذكي', price: 1200, quantity: 1, total: 1200 },
  { name: 'سماعات بلوتوث', price: 250, quantity: 3, total: 750 },
];

export default function SalesPage() {
  const [search, setSearch] = useState('');

  return (
    <MainLayout
      navbarTitle="المبيعات"
      onBack={() => window.history.back()}
      menuOptions={salesMenuOptions}
    >
      <div className="space-y-4">
        {/* Filter/Search Bar */}
        <div className="bg-white rounded-lg p-3 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="flex-1">
              <input
                type="text"
                placeholder="ابحث عن منتج"
                className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full text-sm text-right" dir="rtl">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 font-bold text-black">اسم المنتج</th>
                <th className="px-3 py-2 font-bold text-black">السعر</th>
                <th className="px-3 py-2 font-bold text-black">الكمية</th>
                <th className="px-3 py-2 font-bold text-black">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {sampleSales.map((item, idx) => (
                <tr key={idx} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="px-3 py-2 text-black">{item.name}</td>
                  <td className="px-3 py-2 text-black">{item.price.toLocaleString()} ر.س</td>
                  <td className="px-3 py-2 text-black">{item.quantity}</td>
                  <td className="px-3 py-2 text-black">{item.total.toLocaleString()} ر.س</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


    </MainLayout>
  );
} 