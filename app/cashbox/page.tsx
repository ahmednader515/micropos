'use client'

import MainLayout from '@/components/MainLayout'

export default function CashboxPage() {
  return (
    <MainLayout
      navbarTitle="الصندوق"
      onBack={() => window.history.back()}
      menuOptions={[
        { label: 'تقرير الصندوق', onClick: () => alert('تقرير الصندوق') },
        { label: 'إضافة حركة', onClick: () => alert('إضافة حركة') },
      ]}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">الصندوق</h1>
          <p className="mt-2 text-gray-600">متابعة وإدارة الصندوق</p>
        </div>
        <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm">
          <p className="text-gray-500">سيتم إضافة وظائف إدارة الصندوق قريبًا...</p>
        </div>
      </div>
    </MainLayout>
  )
} 