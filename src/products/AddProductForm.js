import React, { useState } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import Comma  from "../utility/Comma"; // مسیر فایل Comma.js را متناسب با پروژه خود تنظیم کنید

const AddProductForm = ({ onFinish, categories }) => {
  const [formData, setFormData] = useState({
    stock_name: "",
    price: "",
    staff_price: "",
    category_id: "",
    is_active: true,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useSamePrice, setUseSamePrice] = useState(true);

  // تغییر مقادیر فرم
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "price" && useSamePrice) {
      setFormData({
        ...formData,
        [name]: value,
        staff_price: value,
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }

    // پاک کردن خطای فیلد در صورت تغییر مقدار
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  // تغییر مقادیر عددی با حذف کاما
  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    // حذف کاماها برای ذخیره عدد خالص
    const numericValue = value.replace(/,/g, "");

    if (name === "price" && useSamePrice) {
      setFormData({
        ...formData,
        [name]: numericValue,
        staff_price: numericValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: numericValue,
      });
    }

    // پاک کردن خطای فیلد در صورت تغییر مقدار
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  // تغییر وضعیت استفاده از قیمت یکسان
  const handleSamePriceChange = (e) => {
    const checked = e.target.checked;
    setUseSamePrice(checked);

    if (checked) {
      setFormData({
        ...formData,
        staff_price: formData.price,
      });
    }
  };

  // اعتبارسنجی فرم
  const validateForm = () => {
    const newErrors = {};

    if (!formData.stock_name.trim()) {
      newErrors.stock_name = "نام محصول الزامی است";
    }

    if (!formData.price) {
      newErrors.price = "قیمت محصول الزامی است";
    } else if (isNaN(formData.price) || Number(formData.price) < 0) {
      newErrors.price = "قیمت باید عدد مثبت باشد";
    }

    if (
      formData.staff_price &&
      (isNaN(formData.staff_price) || Number(formData.staff_price) < 0)
    ) {
      newErrors.staff_price = "قیمت پرسنلی باید عدد مثبت باشد";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ارسال فرم
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      // تبدیل مقادیر عددی
      const formattedData = {
        ...formData,
        price: Number(formData.price),
        staff_price: formData.staff_price ? Number(formData.staff_price) : null,
        category_id: formData.category_id ? Number(formData.category_id) : null,
        use_same_price: useSamePrice,
      };

      onFinish(formattedData).finally(() => {
        setIsSubmitting(false);
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col md={12} className="mb-3">
          <Form.Group>
            <Form.Label>
              نام محصول <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="stock_name"
              value={formData.stock_name}
              onChange={handleChange}
              isInvalid={!!errors.stock_name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.stock_name}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={6} className="mb-3">
          <Form.Group>
            <Form.Label>
              قیمت (ریال) <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="price"
              value={Comma(formData.price)}
              onChange={handlePriceChange}
              isInvalid={!!errors.price}
            />
            <Form.Control.Feedback type="invalid">
              {errors.price}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={12} className="mb-3">
          <Form.Group>
            <Form.Check
              type="checkbox"
              label="استفاده از قیمت اصلی برای قیمت پرسنلی"
              checked={useSamePrice}
              onChange={handleSamePriceChange}
            />
          </Form.Group>
        </Col>

        <Col md={6} className="mb-3">
          <Form.Group>
            <Form.Label>قیمت پرسنلی (ریال)</Form.Label>
            <Form.Control
              type="text"
              name="staff_price"
              value={
                useSamePrice
                  ? Comma(formData.price)
                  : Comma(formData.staff_price)
              }
              onChange={handlePriceChange}
              isInvalid={!!errors.staff_price}
              disabled={useSamePrice}
            />
            <Form.Control.Feedback type="invalid">
              {errors.staff_price}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={6} className="mb-3">
          <Form.Group>
            <Form.Label>دسته‌بندی</Form.Label>
            <Form.Select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
            >
              <option value="">انتخاب دسته‌بندی</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={12} className="mb-3">
          <Form.Group>
            <Form.Check
              type="checkbox"
              label="محصول فعال باشد"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex justify-content-end mt-3">
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "در حال ذخیره..." : "ذخیره محصول"}
        </Button>
      </div>
    </Form>
  );
};

export default AddProductForm;
