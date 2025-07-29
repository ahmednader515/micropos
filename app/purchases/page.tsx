'use client'

import MainLayout from '@/components/MainLayout'

export default function PurchasesPage() {
  return (
    <MainLayout
      navbarTitle="المشتريات"
      onBack={() => window.history.back()}
      menuOptions={[
        { label: 'تقرير المشتريات', onClick: () => alert('تقرير المشتريات') },
        { label: 'إضافة فاتورة مشتريات', onClick: () => alert('إضافة فاتورة مشتريات') },
      ]}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">المشتريات</h1>
          <p className="mt-2 text-gray-600">إدارة ومتابعة المشتريات الخاصة بك</p>
        </div>
        <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm">
          <p className="text-gray-500">سيتم إضافة وظائف إدارة المشتريات قريبًا...</p>
        </div>
      </div>
    </MainLayout>
  )
} 