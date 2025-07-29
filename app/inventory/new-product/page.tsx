'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/MainLayout'
import BarcodeReader from '@/components/BarcodeReader'

interface Category {
  id: string
  name: string
}

interface NewProductForm {
  name: string
  description: string
  price: string
  costPrice: string
  stock: string
  minStock: string
  barcode: string
  sku: string
  categoryId: string
}

export default function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [showBarcodeReader, setShowBarcodeReader] = useState(false)
  const [formData, setFormData] = useState<NewProductForm>({
    name: '',
    description: '',
    price: '',
    costPrice: '',
    stock: '',
    minStock: '',
    barcode: '',
    sku: '',
    categoryId: ''
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          costPrice: parseFloat(formData.costPrice),
          stock: parseInt(formData.stock),
          minStock: parseInt(formData.minStock),
        }),
      })

      if (response.ok) {
        alert('تم إضافة المنتج بنجاح!')
        // Reset form
        setFormData({
          name: '',
          description: '',
          price: '',
          costPrice: '',
          stock: '',
          minStock: '',
          barcode: '',
          sku: '',
          categoryId: ''
        })
      } else {
        const error = await response.json()
        alert(`خطأ: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating product:', error)
      alert('حدث خطأ أثناء إضافة المنتج')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleBarcodeResult = (barcode: string) => {
    setFormData(prev => ({
      ...prev,
      barcode: barcode
    }))
    setShowBarcodeReader(false)
  }

  return (
    <>
      <style jsx>{`
        input[type="text"] {
          color: black !important;
        }
        input[type="number"] {
          color: black !important;
        }
        textarea {
          color: black !important;
        }
        select {
          color: black !important;
        }
        input::placeholder {
          color: #6b7280 !important;
        }
        textarea::placeholder {
          color: #6b7280 !important;
        }
      `}</style>
      <MainLayout
        navbarTitle="إضافة منتج جديد"
        onBack={() => window.history.back()}
      >
      <div className="space-y-6" dir="rtl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">إضافة منتج جديد</h1>
          <p className="mt-2 text-gray-600">أدخل تفاصيل المنتج الجديد</p>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  اسم المنتج *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل اسم المنتج"
                />
              </div>

              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                  الفئة
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر الفئة</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                الوصف
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="وصف المنتج (اختياري)"
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  سعر البيع *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  سعر التكلفة
                </label>
                <input
                  type="number"
                  id="costPrice"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Stock Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                  الكمية المتوفرة *
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label htmlFor="minStock" className="block text-sm font-medium text-gray-700 mb-2">
                  الحد الأدنى للمخزون
                </label>
                <input
                  type="number"
                  id="minStock"
                  name="minStock"
                  value={formData.minStock}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Product Codes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-2">
                  الباركود
                </label>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="flex-1">
                    <input
                      type="text"
                      id="barcode"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="باركود المنتج"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBarcodeReader(true)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
                  رمز المنتج (SKU)
                </label>
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="رمز المنتج"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 space-x-reverse">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'جاري الإضافة...' : 'إضافة المنتج'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Barcode Reader */}
      <BarcodeReader
        isVisible={showBarcodeReader}
        onResult={handleBarcodeResult}
        onClose={() => setShowBarcodeReader(false)}
      />
    </MainLayout>
    </>
  )
} 