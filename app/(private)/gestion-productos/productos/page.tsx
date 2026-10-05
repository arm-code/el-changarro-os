'use client'

import { Loader } from '@/components/Loaders/Loader.component';
import { useApi } from '@/hooks/useApi'
import { Product } from '@/types/products.types';
import { useEffect, useState } from 'react'
import { Search, Package, Edit2, Trash2 } from 'lucide-react'

export default function ProductsPage() {

  const { error, loading, request } = useApi();
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const fetchProducts = async () => {
    const res = await request('/productos')
    if (res.data) {
      setProducts(res.data.products);
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])


  // Función para manejar la eliminación de productos
  const handleDeleteProduct = async (id: number, nombre: string) => {

  }

  const handleEditProduct = async (id: number, productData: Partial<Product>) => {

  }

  // Mostrar error si existe
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4">
        <div className="text-lg text-red-600 text-center mb-4">Error: {error}</div>
        <button
          onClick={fetchProducts}
          className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <Loader />
    )
  }


  const filteredProducts = products.filter(product =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )



  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-violet-900">Productos</h1>
          <p className="text-violet-600 mt-1">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'} encontrados
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 pl-10 pr-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 md:py-16">
          <div className="flex justify-center mb-4">
            <Package className="w-16 h-16 text-violet-300" />
          </div>
          <h3 className="text-lg font-medium text-violet-900 mb-2">
            {searchTerm ? 'No se encontraron productos' : 'No hay productos'}
          </h3>
          <p className="text-violet-600 max-w-md mx-auto">
            {searchTerm ? 'Intenta con otro término de búsqueda' : 'Comienza agregando tu primer producto'}
          </p>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-violet-100 rounded-xl p-4 md:p-6 hover:shadow-lg transition-all duration-200"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-violet-900 text-lg leading-tight pr-2">
                  {product.nombre}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full min-w-[60px] text-center ${product.stock > 0
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                  Stock: {product.stock}
                </span>
              </div>

              {/* Description */}
              {product.descripcion && (
                <p className="text-violet-600 text-sm mb-4 line-clamp-2">
                  {product.descripcion}
                </p>
              )}

              {/* Price */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-2xl font-bold text-violet-700">
                    ${parseFloat(product.precioVenta).toFixed(2)}
                  </span>
                  {product.precioCompra && (
                    <p className="text-violet-400 text-sm line-through">
                      ${parseFloat(product.precioCompra).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditProduct(product.id!, product)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-violet-50 text-violet-700 rounded-lg hover:bg-violet-100 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="text-sm">Editar</span>
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id!, product.nombre)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">Eliminar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}