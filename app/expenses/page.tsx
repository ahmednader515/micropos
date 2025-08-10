'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/MainLayout'
import FlashNotification from '@/components/FlashNotification'

interface Expense {
  id: string
  title: string
  description: string
  amount: string
  category: string
  date: string
  paymentMethod: string
  receiptUrl: string
  createdAt: string
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH',
    receiptUrl: ''
  })
  const [filters, setFilters] = useState({
    paymentMethod: 'ALL',
    startDate: '',
    endDate: ''
  })
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  useEffect(() => {
    fetchExpenses()
  }, [filters])

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.paymentMethod !== 'ALL') params.append('paymentMethod', filters.paymentMethod)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const response = await fetch(`/api/expenses?${params}`)
      if (response.ok) {
        const data = await response.json()
        setExpenses(data)
      } else {
        throw new Error('فشل في جلب المصروفات')
      }
    } catch (error) {
      showNotification('error', 'فشل في جلب المصروفات')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!formData.title || !formData.amount) {
        showNotification('error', 'العنوان والمبلغ مطلوبان')
        return
      }

      const amount = parseFloat(formData.amount)
      if (amount <= 0) {
        showNotification('error', 'المبلغ يجب أن يكون أكبر من صفر')
        return
      }

      setSubmitting(true)
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          amount,
          date: formData.date || new Date().toISOString()
        })
      })

      if (response.ok) {
        showNotification('success', 'تم إضافة المصروف بنجاح')
        setFormData({
          title: '',
          description: '',
          amount: '',
          category: '',
          date: new Date().toISOString().split('T')[0],
          paymentMethod: 'CASH',
          receiptUrl: ''
        })
        setShowAddForm(false)
        fetchExpenses()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في إضافة المصروف')
      }
    } catch (error: any) {
      showNotification('error', error.message || 'فشل في إضافة المصروف')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setFormData({
      title: expense.title,
      description: expense.description || '',
      amount: expense.amount,
      category: expense.category || '',
      date: expense.date.split('T')[0],
      paymentMethod: expense.paymentMethod,
      receiptUrl: expense.receiptUrl || ''
    })
    setShowEditForm(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingExpense) return

    try {
      if (!formData.title || !formData.amount) {
        showNotification('error', 'العنوان والمبلغ مطلوبان')
        return
      }

      const amount = parseFloat(formData.amount)
      if (amount <= 0) {
        showNotification('error', 'المبلغ يجب أن يكون أكبر من صفر')
        return
      }

      setSubmitting(true)
      const response = await fetch('/api/expenses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: editingExpense.id,
          ...formData,
          amount,
          date: formData.date || new Date().toISOString()
        })
      })

      if (response.ok) {
        showNotification('success', 'تم تحديث المصروف بنجاح')
        setShowEditForm(false)
        setEditingExpense(null)
        fetchExpenses()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في تحديث المصروف')
      }
    } catch (error: any) {
      showNotification('error', error.message || 'فشل في تحديث المصروف')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = (expense: Expense) => {
    setDeletingExpense(expense)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!deletingExpense) return

    try {
      setSubmitting(true)
      const response = await fetch(`/api/expenses?id=${deletingExpense.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showNotification('success', 'تم حذف المصروف بنجاح')
        setShowDeleteConfirm(false)
        setDeletingExpense(null)
        fetchExpenses()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في حذف المصروف')
      }
    } catch (error: any) {
      showNotification('error', error.message || 'فشل في حذف المصروف')
    } finally {
      setSubmitting(false)
    }
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const formatCurrency = (amount: string) => {
    return parseFloat(amount).toLocaleString('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: { [key: string]: string } = {
      'CASH': 'نقداً',
      'CARD': 'بطاقة',
      'CHECK': 'شيك',
      'CASHBOX': 'صندوق'
    }
    return labels[method] || method
  }

  const getPaymentMethodColor = (method: string) => {
    const colors: { [key: string]: string } = {
      'CASH': 'text-green-600',
      'CARD': 'text-blue-600',
      'CHECK': 'text-purple-600',
      'CASHBOX': 'text-orange-600'
    }
    return colors[method] || 'text-gray-600'
  }

  const getPaymentMethodBgColor = (method: string) => {
    const colors: { [key: string]: string } = {
      'CASH': 'bg-green-50',
      'CARD': 'bg-blue-50',
      'CHECK': 'bg-purple-50',
      'CASHBOX': 'bg-orange-50'
    }
    return colors[method] || 'bg-gray-50'
  }

  const getPaymentMethodIcon = (method: string) => {
    const icons: { [key: string]: string } = {
      'CASH': '💵',
      'CARD': '💳',
      'CHECK': '📋',
      'CASHBOX': '🏦'
    }
    return icons[method] || '💰'
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0)

  const filteredExpenses = expenses.filter(expense => {
    if (filters.paymentMethod !== 'ALL' && expense.paymentMethod !== filters.paymentMethod) {
      return false
    }
    if (filters.startDate && new Date(expense.date) < new Date(filters.startDate)) {
      return false
    }
    if (filters.endDate && new Date(expense.date) > new Date(filters.endDate + 'T23:59:59.999Z')) {
      return false
    }
    return true
  })

  const clearFilters = () => {
    setFilters({
      paymentMethod: 'ALL',
      startDate: '',
      endDate: ''
    })
  }

  const exportToCSV = () => {
    const headers = ['التاريخ', 'العنوان', 'الوصف', 'المبلغ', 'الفئة', 'طريقة الدفع', 'رابط الإيصال']
    const csvData = filteredExpenses.map(expense => [
      formatDate(expense.date),
      expense.title,
      expense.description || '',
      expense.amount,
      expense.category || '',
      getPaymentMethodLabel(expense.paymentMethod),
      expense.receiptUrl || ''
    ])
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <MainLayout
        navbarTitle="المصروفات"
        onBack={() => window.history.back()}
        menuOptions={[]}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">جاري التحميل...</div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout
      navbarTitle="المصروفات"
      onBack={() => window.history.back()}
      menuOptions={[]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">المصروفات</h1>
          <p className="mt-2 text-gray-600">متابعة مصروفات العمل</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
            <div className="text-center">
              <h3 className="text-sm font-medium">إجمالي المصروفات</h3>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(totalExpenses.toString())}
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="text-center">
              <h3 className="text-sm font-medium">عدد المصروفات</h3>
              <p className="text-2xl font-bold mt-1">
                {expenses.length}
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="text-center">
              <h3 className="text-sm font-medium">من الصندوق</h3>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(expenses.filter(e => e.paymentMethod === 'CASHBOX').reduce((sum, e) => sum + parseFloat(e.amount), 0).toString())}
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="text-center">
              <h3 className="text-sm font-medium">من البطاقة</h3>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(expenses.filter(e => e.paymentMethod === 'CARD').reduce((sum, e) => sum + parseFloat(e.amount), 0).toString())}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={exportToCSV}
            disabled={filteredExpenses.length === 0}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            تصدير CSV
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري الإضافة...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                إضافة مصروف جديد
              </>
            )}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">تصفية النتائج</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              مسح الفلاتر
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">طريقة الدفع</label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">جميع الطرق</option>
                <option value="CASH">نقداً</option>
                <option value="CARD">بطاقة</option>
                <option value="CHECK">شيك</option>
                <option value="CASHBOX">صندوق</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {Object.values(filters).some(value => value !== 'ALL' && value !== '') && (
            <div className="mt-3 text-sm text-gray-600">
              النتائج المفلترة: {filteredExpenses.length} من أصل {expenses.length} مصروف
            </div>
          )}
        </div>

        {/* Add Expense Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">إضافة مصروف جديد</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">العنوان *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="عنوان المصروف"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="وصف المصروف"
                  rows={3}
                  disabled={submitting}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="فئة المصروف"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">طريقة الدفع</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                  >
                    <option value="CASH">نقداً</option>
                    <option value="CARD">بطاقة</option>
                    <option value="CHECK">شيك</option>
                    <option value="CASHBOX">صندوق</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رابط الإيصال (اختياري)</label>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={formData.receiptUrl}
                    onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="رابط صورة أو ملف الإيصال"
                    disabled={submitting}
                  />
                  <p className="text-xs text-gray-500">
                    يمكنك رفع صورة الإيصال على خدمة سحابية مثل Google Drive أو Dropbox وإضافة الرابط هنا
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {submitting ? 'جاري الإضافة...' : 'إضافة المصروف'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  disabled={submitting}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Expense Form */}
        {showEditForm && editingExpense && (
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">تعديل المصروف</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">العنوان *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="عنوان المصروف"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="وصف المصروف"
                  rows={3}
                  disabled={submitting}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="فئة المصروف"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">طريقة الدفع</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                  >
                    <option value="CASH">نقداً</option>
                    <option value="CARD">بطاقة</option>
                    <option value="CHECK">شيك</option>
                    <option value="CASHBOX">صندوق</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رابط الإيصال (اختياري)</label>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={formData.receiptUrl}
                    onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="رابط صورة أو ملف الإيصال"
                    disabled={submitting}
                  />
                  <p className="text-xs text-gray-500">
                    يمكنك رفع صورة الإيصال على خدمة سحابية مثل Google Drive أو Dropbox وإضافة الرابط هنا
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {submitting ? 'جاري التحديث...' : 'تحديث المصروف'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false)
                    setEditingExpense(null)
                  }}
                  disabled={submitting}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && deletingExpense && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">تأكيد الحذف</h3>
              <p className="text-gray-600 mb-6">
                هل أنت متأكد من حذف المصروف "{deletingExpense.title}"؟ هذا الإجراء لا يمكن التراجع عنه.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  disabled={submitting}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {submitting ? 'جاري الحذف...' : 'حذف'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeletingExpense(null)
                  }}
                  disabled={submitting}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Expenses List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">قائمة المصروفات</h3>
            <p className="text-sm text-gray-500 mt-1">
              {filteredExpenses.length} مصروف • إجمالي: {formatCurrency(filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0).toString())}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm" dir="rtl">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right font-medium text-gray-500">التاريخ</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500">العنوان</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500">المبلغ</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500">الفئة</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500">طريقة الدفع</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500">الإيصال</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className={`hover:bg-gray-50 ${getPaymentMethodBgColor(expense.paymentMethod)}`}>
                    <td className="px-6 py-4 text-gray-900">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      <div>
                        <div className="font-medium">{expense.title}</div>
                        {expense.description && (
                          <div className="text-sm text-gray-500">{expense.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {expense.category || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentMethodColor(expense.paymentMethod)} ${getPaymentMethodBgColor(expense.paymentMethod)}`}>
                        <span>{getPaymentMethodIcon(expense.paymentMethod)}</span>
                        {getPaymentMethodLabel(expense.paymentMethod)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {expense.receiptUrl ? (
                        <a
                          href={expense.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          عرض الإيصال
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded"
                          title="تعديل"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(expense)}
                          className="text-red-600 hover:text-red-800 p-1 rounded"
                          title="حذف"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      {expenses.length === 0 ? 'لا توجد مصروفات' : 'لا توجد نتائج تطابق الفلاتر المحددة'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <FlashNotification
          type={notification.type}
          message={notification.message}
          isVisible={!!notification}
          onClose={() => setNotification(null)}
        />
      )}
    </MainLayout>
  )
} 