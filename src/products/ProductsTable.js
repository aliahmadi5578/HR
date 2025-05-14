import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Alert,
  Form,
  InputGroup,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import ProductService from "./ProductService";
import AddProductForm from "./AddProductForm";
import EditProductForm from "./EditProductForm";

const ProductsTable = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [message, setMessage] = useState({ show: false, text: "", type: "" });

  // فیلترها
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("id"); // 'id', 'price-asc', 'price-desc'
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'active', 'inactive'

  // صفحه‌بندی و بارگذاری بیشتر
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observer = useRef();
  const itemsPerPage = 20;

  // دریافت محصولات و دسته‌بندی‌ها در هنگام بارگذاری کامپوننت
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // اعمال فیلترها روی محصولات
  useEffect(() => {
    if (products.length > 0) {
      applyFilters();
    }
  }, [products, searchTerm, selectedCategory, sortOrder, activeFilter]);

  // تنظیم مجدد صفحه‌بندی هنگام تغییر فیلترها
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategory, sortOrder, activeFilter]);

  // بررسی آیا محصولات بیشتری برای نمایش وجود دارد
  useEffect(() => {
    setHasMore(page * itemsPerPage < filteredProducts.length);
  }, [filteredProducts, page]);

  // نمایش پیام
  const showMessage = (text, type = "success") => {
    setMessage({ show: true, text, type });
    setTimeout(() => {
      setMessage({ show: false, text: "", type: "" });
    }, 3000);
  };

  // دریافت محصولات از API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await ProductService.getAllProducts();
      console.log("محصولات دریافت شده:", response.data);
      setProducts(response.data);
    } catch (error) {
      console.error("خطا در دریافت محصولات:", error);
      showMessage("خطا در دریافت محصولات", "danger");
    } finally {
      setLoading(false);
    }
  };

  // دریافت دسته‌بندی‌ها از API
  const fetchCategories = async () => {
    try {
      const response = await ProductService.getAllCategories();
      setCategories(response.data);
    } catch (error) {
      console.error("خطا در دریافت دسته‌بندی‌ها:", error);
      showMessage("خطا در دریافت دسته‌بندی‌ها", "danger");
    }
  };

  // اعمال فیلترها
  // const applyFilters = () => {
  //   let result = [...products];

  //   // فیلتر بر اساس نام محصول
  //   if (searchTerm.trim() !== '') {
  //     result = result.filter(product =>
  //       product.stock_name.toLowerCase().includes(searchTerm.toLowerCase())
  //     );
  //   }

  //   // فیلتر بر اساس دسته‌بندی
  //   if (selectedCategory !== '') {
  //     result = result.filter(product =>
  //       product.category_id && product.category_id.toString() === selectedCategory
  //     );
  //   }

  //   // فیلتر بر اساس وضعیت فعال بودن
  //   if (activeFilter !== 'all') {
  //     const isActive = activeFilter === 'active';
  //     result = result.filter(product => product.is_active === isActive);
  //   }

  //   // مرتب‌سازی
  //   switch (sortOrder) {
  //     case 'price-asc':
  //       result.sort((a, b) => a.price - b.price);
  //       break;
  //     case 'price-desc':
  //       result.sort((a, b) => b.price - a.price);
  //       break;
  //     case 'id':
  //     default:
  //       result.sort((a, b) => a.stock_id - b.stock_id);
  //       break;
  //   }

  //   setFilteredProducts(result);
  // };
  // اعمال فیلترها
  const applyFilters = () => {
    let result = [...products];

    // فیلتر بر اساس نام محصول
    if (searchTerm.trim() !== "") {
      result = result.filter((product) =>
        product.stock_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // فیلتر بر اساس دسته‌بندی
    if (selectedCategory !== "") {
      result = result.filter(
        (product) =>
          product.category_id &&
          product.category_id.toString() === selectedCategory
      );
    }

    // فیلتر بر اساس وضعیت فعال بودن
    if (activeFilter !== "all") {
      const isActive = activeFilter === "active";
      result = result.filter(
        (product) => Boolean(product.is_active) === isActive
      );
    }

    // مرتب‌سازی
    switch (sortOrder) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "id":
      default:
        result.sort((a, b) => a.stock_id - b.stock_id);
        break;
    }

    setFilteredProducts(result);
  };

  // پاک کردن فیلترها
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSortOrder("id");
    setActiveFilter("all");
  };

  // تابع برای بارگذاری محصولات بیشتر
  const loadMoreItems = () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    // شبیه‌سازی تأخیر در بارگذاری برای نمایش اسپینر
    setTimeout(() => {
      setPage((prevPage) => prevPage + 1);
      setLoadingMore(false);
    }, 500);
  };

  // تنظیم observer برای تشخیص رسیدن به انتهای صفحه
  const lastItemRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreItems();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore]
  );

  // افزودن محصول جدید
  const handleAddProduct = async (values) => {
    try {
      await ProductService.addProduct(values);
      showMessage("محصول با موفقیت اضافه شد");
      setIsAddModalVisible(false);
      fetchProducts();
    } catch (error) {
      console.error("خطا در افزودن محصول:", error);
      showMessage("خطا در افزودن محصول", "danger");
    }
  };

  // ویرایش محصول
  const handleEditProduct = async (values) => {
    try {
      await ProductService.updateProduct(currentProduct.stock_id, values);
      showMessage("محصول با موفقیت ویرایش شد");
      setIsEditModalVisible(false);
      fetchProducts();
    } catch (error) {
      console.error("خطا در ویرایش محصول:", error);
      showMessage("خطا در ویرایش محصول", "danger");
    }
  };

  // حذف محصول
  const handleDeleteProduct = async (id) => {
    if (window.confirm("آیا از حذف این محصول اطمینان دارید؟")) {
      try {
        await ProductService.deleteProduct(id);
        showMessage("محصول با موفقیت حذف شد");
        fetchProducts();
      } catch (error) {
        console.error("خطا در حذف محصول:", error);
        if (error.response && error.response.status === 400) {
          showMessage(
            "این محصول در سفارشات استفاده شده و قابل حذف نیست",
            "danger"
          );
        } else {
          showMessage("خطا در حذف محصول", "danger");
        }
      }
    }
  };

  // باز کردن مودال ویرایش محصول
  const showEditModal = (product) => {
    setCurrentProduct(product);
    setIsEditModalVisible(true);
  };

  // محصولات صفحه‌بندی شده
  const paginatedProducts = filteredProducts.slice(0, page * itemsPerPage);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>مدیریت محصولات</h2>
        <div>
          <Button
            variant="outline-secondary"
            onClick={fetchProducts}
            className="me-2"
          >
            به‌روزرسانی لیست
          </Button>
          <Button variant="primary" onClick={() => setIsAddModalVisible(true)} className="mx-1">
            افزودن محصول جدید
          </Button>
        </div>
      </div>

      {message.show && (
        <Alert variant={message.type} className="mb-3">
          {message.text}
        </Alert>
      )}

      {/* بخش فیلترها */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title h5 mb-0">فیلتر محصولات</h3>
        </div>
        <div className="card-body">
          <Row>
            <Col md={3} className="mb-3">
              <Form.Group>
                <Form.Label>جستجو بر اساس نام محصول</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="نام محصول را وارد کنید..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <Button
                      variant="outline-secondary"
                      onClick={() => setSearchTerm("")}
                    >
                      ×
                    </Button>
                  )}
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={3} className="mb-3">
              <Form.Group>
                <Form.Label>فیلتر بر اساس دسته‌بندی</Form.Label>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">همه دسته‌بندی‌ها</option>
                  {categories.map((category) => (
                    <option
                      key={category.category_id}
                      value={category.category_id}
                    >
                      {category.category_name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2} className="mb-3">
              <Form.Group>
                <Form.Label>وضعیت محصول</Form.Label>
                <Form.Select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                >
                  <option value="all">همه محصولات</option>
                  <option value="active">فعال</option>
                  <option value="inactive">غیرفعال</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2} className="mb-3">
              <Form.Group>
                <Form.Label>مرتب‌سازی</Form.Label>
                <Form.Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="id">بر اساس شناسه</option>
                  <option value="price-asc">قیمت (کم به زیاد)</option>
                  <option value="price-desc">قیمت (زیاد به کم)</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2} className="mb-3 d-flex align-items-end">
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={clearFilters}
              >
                پاک کردن فیلترها
              </Button>
            </Col>
          </Row>
        </div>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">در حال بارگذاری...</span>
          </Spinner>
          <p className="mt-2">در حال بارگذاری اطلاعات...</p>
        </div>
      ) : (
        <>
          {filteredProducts.length === 0 ? (
            <Alert variant="info">
              هیچ محصولی با فیلترهای انتخاب شده یافت نشد.
            </Alert>
          ) : (
            <>
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>شناسه</th>
                      {/* <th>تصویر</th> */}
                      <th>نام محصول</th>
                      {/* <th>توضیحات</th> */}
                      <th>قیمت (ریال)</th>
                      <th>قیمت پرسنلی (ریال)</th>
                      <th>دسته‌بندی</th>
                      <th>وضعیت</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.map((product, index) => (
                      <tr
                        key={product.stock_id}
                        ref={
                          index === paginatedProducts.length - 1
                            ? lastItemRef
                            : null
                        }
                      >
                        <td>{product.stock_id}</td>
                        {/* <td>
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt="تصویر محصول" 
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                            />
                          ) : (
                            <div className="no-image">بدون تصویر</div>
                          )}
                        </td> */}
                        <td>{product.stock_name}</td>
                        {/* <td>{product.stock_description}</td> */}
                        <td>{product.price.toLocaleString("fa-IR")}</td>
                        <td>
                          {product.staff_price !== null && product.staff_price !== undefined
                            ? product.staff_price.toLocaleString("fa-IR")
                            : "-"}
                        </td>
                        <td>{product.category_name}</td>
                        <td>
                          <span
                            className={`badge ${
                              product.is_active ? "bg-success" : "bg-danger"
                            }`}
                          >
                            {product.is_active ? "فعال" : "غیرفعال"}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => showEditModal(product)}
                            >
                              ویرایش
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() =>
                                handleDeleteProduct(product.stock_id)
                              }
                            >
                              حذف
                            </Button>
                          </div>
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
                نمایش {Math.min(page * itemsPerPage, filteredProducts.length)}{" "}
                از {filteredProducts.length} محصول
              </div>
            </>
          )}
        </>
      )}

      {/* مودال افزودن محصول */}
      <Modal
        show={isAddModalVisible}
        onHide={() => setIsAddModalVisible(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>افزودن محصول جدید</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AddProductForm onFinish={handleAddProduct} categories={categories} />
        </Modal.Body>
      </Modal>

      {/* مودال ویرایش محصول */}
      <Modal
        show={isEditModalVisible}
        onHide={() => setIsEditModalVisible(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>ویرایش محصول</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentProduct && (
            <EditProductForm
              initialValues={currentProduct}
              onFinish={handleEditProduct}
              categories={categories}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProductsTable;
