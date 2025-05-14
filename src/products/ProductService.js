import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

class ProductService {
  // دریافت همه محصولات
  getAllProducts() {
    return axios.get(`${API_URL}/products`);
  }

  // دریافت یک محصول با شناسه
  getProductById(id) {
    return axios.get(`${API_URL}/products/${id}`);
  }

  // افزودن محصول جدید
  async addProduct(productData) {
    // جدا کردن موجودی‌ها از داده‌های محصول
    const { inventory, stock_quantity, ...productInfo } = productData;
    
    try {
      // ابتدا محصول را ایجاد می‌کنیم
      const productResponse = await axios.post(`${API_URL}/products`, productInfo);
      const newProductId = productResponse.data.stock_id;
      
      // سپس موجودی‌ها را ثبت می‌کنیم
      if (inventory && inventory.length > 0) {
        const inventoryPromises = inventory.map(item => 
          axios.post(`${API_URL}/inventory`, {
            stock_id: newProductId,
            loc_id: item.loc_id,
            qty: item.qty
          })
        );
        
        await Promise.all(inventoryPromises);
      }
      
      return productResponse;
    } catch (error) {
      throw error;
    }
  }

  // ویرایش محصول
  async updateProduct(id, productData) {
    // جدا کردن موجودی‌ها از داده‌های محصول
    const { inventory, stock_quantity, ...productInfo } = productData;
    
    try {
      // ابتدا محصول را به‌روزرسانی می‌کنیم
      const productResponse = await axios.put(`${API_URL}/products/${id}`, productInfo);
      
      // سپس موجودی‌ها را به‌روزرسانی می‌کنیم
      if (inventory && inventory.length > 0) {
        // ابتدا همه موجودی‌های قبلی را حذف می‌کنیم
        await axios.delete(`${API_URL}/inventory/${id}`);
        
        // سپس موجودی‌های جدید را اضافه می‌کنیم
        const inventoryPromises = inventory.map(item => 
          axios.post(`${API_URL}/inventory`, {
            stock_id: id,
            loc_id: item.loc_id,
            qty: item.qty
          })
        );
        
        await Promise.all(inventoryPromises);
      }
      
      return productResponse;
    } catch (error) {
      throw error;
    }
  }

  // حذف محصول
  deleteProduct(id) {
    return axios.delete(`${API_URL}/products/${id}`);
  }

  // دریافت همه دسته‌بندی‌ها
  getAllCategories() {
    return axios.get(`${API_URL}/categories`);
  }

  // دریافت همه انبارها
  getAllLocations() {
    return axios.get(`${API_URL}/locations`);
  }

  // دریافت موجودی یک محصول
  getProductInventory(productId) {
    return axios.get(`${API_URL}/inventory/${productId}`);
  }
}

export default new ProductService();