import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { Table, Form, Button, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { FaSearch, FaPlus, FaMinus } from 'react-icons/fa';

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observer = useRef();
  const itemsPerPage = 20;
  
  // تنظیم آدرس پایه API - این را متناسب با پروژه خود تغییر دهید
  const API_BASE_URL = 'http://localhost:3000'; // یا آدرس واقعی API شما
  
  useEffect(() => {
    fetchData();
  }, []);
  
  // فیلتر کردن موجودی بر اساس شعبه و نام محصول
  const filteredInventory = inventory.filter(item => {
    const matchesLocation = selectedLocation ? item.loc_id.toString() === selectedLocation : true;
    const matchesProductName = productSearchTerm 
      ? item.stock_name.toLowerCase().includes(productSearchTerm.toLowerCase()) 
      : true;
    return matchesLocation && matchesProductName;
  });

  // محصولات صفحه‌بندی شده
  const paginatedInventory = filteredInventory.slice(0, page * itemsPerPage);
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // دریافت لیست موجودی‌ها
      const inventoryResponse = await axios.get(`${API_BASE_URL}/api/inventory`);
      setInventory(inventoryResponse.data);
      
      // دریافت محصولات
      const productsResponse = await axios.get(`${API_BASE_URL}/api/products`);
      setProducts(productsResponse.data);
      
      // دریافت شعبه‌ها
      const locationsResponse = await axios.get(`${API_BASE_URL}/api/locations`);
      setLocations(locationsResponse.data);
      
    } catch (error) {
      console.error('خطا در دریافت اطلاعات:', error);
      setError('خطا در دریافت اطلاعات از سرور. لطفاً مطمئن شوید که سرور API در حال اجراست.');
    } finally {
      setLoading(false);
    }
  };

  // تنظیم مجدد صفحه‌بندی هنگام تغییر فیلترها
  useEffect(() => {
    setPage(1);
  }, [selectedLocation, productSearchTerm]);

  // بررسی آیا محصولات بیشتری برای نمایش وجود دارد
  useEffect(() => {
    setHasMore(page * itemsPerPage < filteredInventory.length);
  }, [filteredInventory, page]);

  // تابع برای بارگذاری محصولات بیشتر
  const loadMoreItems = () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    // شبیه‌سازی تأخیر در بارگذاری برای نمایش اسپینر
    setTimeout(() => {
      setPage(prevPage => prevPage + 1);
      setLoadingMore(false);
    }, 500);
  };

  // تنظیم observer برای تشخیص رسیدن به انتهای صفحه
  const lastItemRef = useCallback(node => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreItems();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  const handleEditInventory = async (stock_id, loc_id, qty) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/inventory`, { stock_id, loc_id, qty });
      setSuccess(response.data.message || 'موجودی با موفقیت ویرایش شد.');
      
      // به‌روزرسانی لیست موجودی‌ها در حافظه
      setInventory(inventory.map(item => 
        item.stock_id === stock_id && item.loc_id === loc_id 
          ? { ...item, qty } 
          : item
      ));
      
      // پاک کردن پیام موفقیت بعد از 3 ثانیه
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('خطا در ویرایش موجودی:', error);
      setError('خطا در ویرایش موجودی. لطفاً دوباره تلاش کنید.');
    }
  };

  const handleDeleteInventory = async (stock_id, loc_id) => {
    if (!window.confirm('آیا از حذف این موجودی اطمینان دارید؟')) {
      return;
    }
    
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/inventory`, { 
        data: { stock_id, loc_id } 
      });
      
      setSuccess(response.data.message || 'موجودی با موفقیت حذف شد.');
      
      // به‌روزرسانی لیست موجودی‌ها در حافظه
      setInventory(inventory.filter(item => 
        item.stock_id !== stock_id || item.loc_id !== loc_id
      ));
      
      // پاک کردن پیام موفقیت بعد از 3 ثانیه
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('خطا در حذف موجودی:', error);
      setError('خطا در حذف موجودی. لطفاً دوباره تلاش کنید.');
    }
  };
  
  // افزایش موجودی
  const handleIncreaseQuantity = (stock_id, loc_id, currentQty) => {
    const newQty = currentQty + 1;
    handleEditInventory(stock_id, loc_id, newQty);
  };
  
  // کاهش موجودی
  const handleDecreaseQuantity = (stock_id, loc_id, currentQty) => {
    if (currentQty > 0) {
      const newQty = currentQty - 1;
      handleEditInventory(stock_id, loc_id, newQty);
    }
  };

  // نمایش وضعیت بارگذاری
  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </Spinner>
        <p className="mt-2">در حال بارگذاری اطلاعات...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">مدیریت موجودی انبار</h2>
      
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
          {success}
        </Alert>
      )}

      {/* فیلترهای جدول */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title h5 mb-0">فیلتر موجودی</h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <Form.Group>
                <Form.Label>جستجوی محصول</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="نام محصول را وارد کنید..."
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                  />
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </div>
            <div className="col-md-6 mb-3">
              <Form.Group>
                <Form.Label>فیلتر بر اساس شعبه</Form.Label>
                <Form.Select 
                  value={selectedLocation} 
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="">همه شعبه‌ها</option>
                  {locations.map(location => (
                    <option key={location.loc_id} value={location.loc_id}>
                      {location.loc_name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => {
                  setProductSearchTerm('');
                  setSelectedLocation('');
                }}
              >
                پاک کردن فیلترها
              </Button>
            </div>
          </div>
        </div>
      </div>

      {filteredInventory.length === 0 ? (
        <Alert variant="info">
          {inventory.length === 0 ? 'هیچ موجودی ثبت نشده است.' : 'هیچ موجودی با فیلترهای انتخاب شده یافت نشد.'}
        </Alert>
      ) : (
        <>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>نام محصول</th>
                  <th>شعبه</th>
                  <th>مقدار موجودی</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {paginatedInventory.map((item, index) => (
                  <tr 
                    key={`${item.stock_id}-${item.loc_id}`} 
                    ref={index === paginatedInventory.length - 1 ? lastItemRef : null}
                  >
                    <td>{item.stock_name}</td>
                    <td>{item.loc_name}</td>
                    <td>
                      <InputGroup style={{ width: '150px' }}>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDecreaseQuantity(item.stock_id, item.loc_id, item.qty)}
                          disabled={item.qty <= 0}
                        >
                          <FaMinus />
                        </Button>
                        <Form.Control 
                          type="number" 
                          value={item.qty}
                          min="0"
                          onChange={(e) => {
                            const newQty = parseInt(e.target.value) || 0;
                            if (newQty !== item.qty) {
                              handleEditInventory(item.stock_id, item.loc_id, newQty);
                            }
                          }}
                          style={{ textAlign: 'center' }}
                        />
                        <Button 
                          variant="outline-success" 
                          size="sm"
                          onClick={() => handleIncreaseQuantity(item.stock_id, item.loc_id, item.qty)}
                        >
                          <FaPlus />
                        </Button>
                      </InputGroup>
                    </td>
                    <td>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDeleteInventory(item.stock_id, item.loc_id)}
                      >
                        حذف
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          
          {/* نمایش وضعیت بارگذاری بیشتر */}
          {loadingMore && (
            <div className="text-center my-3">
              <Spinner animation="border" size="sm" role="status" />
              <span className="ms-2">در حال بارگذاری موارد بیشتر...</span>
            </div>
          )}
          
          {/* نمایش اطلاعات تعداد موارد */}
          <div className="text-muted mt-3 mb-5">
            نمایش {Math.min(page * itemsPerPage, filteredInventory.length)} از {filteredInventory.length} مورد
          </div>
        </>
      )}
    </div>
  );
}

export default Inventory;
