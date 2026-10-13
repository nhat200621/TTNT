import React, { useEffect, useState } from 'react';
import { productApi, saleApi } from '../services/api';
import { Product } from '../types';
import { ShoppingCart, Trash2, Plus, AlertCircle, CheckCircle } from 'lucide-react';

interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  sellingPrice: number;
  availableStock: number;
  unit: string;
}

const Sale: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [saleQuantity, setSaleQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productApi.getAll();
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!selectedProductId) return;

    try {
      const product = products.find(p => p._id === selectedProductId);
      if (!product) return;

      // Check stock from API
      const stockRes = await productApi.getStock(selectedProductId);
      const availableStock = stockRes.data.totalStock;

      if (availableStock < saleQuantity) {
        setError(`Không đủ tồn kho. Hiện có: ${availableStock} ${product.unit}`);
        return;
      }

      const existingItem = cart.find(item => item.productId === selectedProductId);
      if (existingItem) {
        if (existingItem.quantity + saleQuantity > availableStock) {
          setError(`Tổng số lượng trong giỏ vượt quá tồn kho hiện có (${availableStock})`);
          return;
        }
        setCart(cart.map(item =>
          item.productId === selectedProductId
            ? { ...item, quantity: item.quantity + saleQuantity }
            : item
        ));
      } else {
        setCart([...cart, {
          productId: selectedProductId,
          name: product.name,
          quantity: saleQuantity,
          sellingPrice: product.currentSellingPrice,
          availableStock,
          unit: product.unit
        }]);
      }

      setError(null);
      setSelectedProductId('');
      setSaleQuantity(1);
    } catch (err) {
      setError('Lỗi khi kiểm tra tồn kho');
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      const saleData = {
        transactionDate,
        paymentMethod,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          sellingPrice: item.sellingPrice
        }))
      };

      await saleApi.create(saleData);
      setSuccess(true);
      setCart([]);
      setError(null);
      setTimeout(() => setSuccess(false), 3000);
      fetchProducts(); // Refresh product list (if prices changed or to keep local state updated)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi thanh toán');
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.quantity * item.sellingPrice), 0);

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Chọn sản phẩm bán</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-1">Sản phẩm</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Chọn sản phẩm</option>
                {products.map(p => (
                  <option key={p._id} value={p._id}>{p.name} ({p.unit})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Số lượng</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={saleQuantity}
                onChange={(e) => setSaleQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={addToCart}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center"
              >
                <Plus size={20} className="mr-2" /> Thêm vào giỏ
              </button>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center text-sm">
              <AlertCircle size={16} className="mr-2" /> {error}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Giỏ hàng</h3>
            <span className="text-sm text-gray-500">{cart.length} sản phẩm</span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">Sản phẩm</th>
                <th className="px-6 py-3">Số lượng</th>
                <th className="px-6 py-3">Đơn giá</th>
                <th className="px-6 py-3 text-right">Thành tiền</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {cart.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic">
                    Giỏ hàng trống
                  </td>
                </tr>
              ) : (
                cart.map(item => (
                  <tr key={item.productId}>
                    <td className="px-6 py-4 font-medium">{item.name}</td>
                    <td className="px-6 py-4">{item.quantity} {item.unit}</td>
                    <td className="px-6 py-4">{new Intl.NumberFormat('vi-VN').format(item.sellingPrice)} đ</td>
                    <td className="px-6 py-4 text-right font-semibold">
                      {new Intl.NumberFormat('vi-VN').format(item.quantity * item.sellingPrice)} đ
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => removeFromCart(item.productId)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-6">Thanh toán</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ngày bán</label>
              <input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phương thức thanh toán</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="Tiền mặt">Tiền mặt</option>
                <option value="Chuyển khoản">Chuyển khoản</option>
                <option value="Thẻ">Thẻ</option>
              </select>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Tổng cộng:</span>
                <span className="text-blue-600">{new Intl.NumberFormat('vi-VN').format(totalAmount)} đ</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center transition-all ${
                cart.length === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white active:scale-95'
              }`}
            >
              <ShoppingCart size={24} className="mr-2" /> XÁC NHẬN BÁN HÀNG
            </button>
          </div>
        </div>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center animate-bounce">
            <CheckCircle className="mr-2" size={20} />
            <span>Giao dịch thành công!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sale;
