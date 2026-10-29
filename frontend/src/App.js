import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/foods';

function App() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    foodId: '',
    name: '',
    category: '',
    cuisine: '',
    ingredients: '',
    price: 0,
    quantity: 0,
    description: '',
    imageUrl: ''
  });

  const fetchFoods = async (query = '') => {
    setLoading(true);
    setError('');
    try {
      const url = query ? `${API_BASE_URL}?search=${encodeURIComponent(query)}` : API_BASE_URL;
      const response = await axios.get(url);
      setFoods(response.data);
    } catch (err) {
      setError('Loi khi tải danh sách món ăn: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFoods(searchTerm);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const resetForm = () => {
    setFormData({
      foodId: '',
      name: '',
      category: '',
      cuisine: '',
      ingredients: '',
      price: 0,
      quantity: 0,
      description: '',
      imageUrl: ''
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    const payload = {
      ...formData,
      price: Number(formData.price),
      quantity: Number(formData.quantity),
      ingredients: typeof formData.ingredients === 'string' 
        ? formData.ingredients.split(',').map(item => item.trim()).filter(Boolean)
        : formData.ingredients
    };

    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/${formData.foodId}`, payload);
        setSuccessMsg('Cập nhật món ăn thành công!');
      } else {
        await axios.post(API_BASE_URL, payload);
        setSuccessMsg('Thêm món ăn mới thành công!');
      }
      resetForm();
      fetchFoods(searchTerm);
    } catch (err) {
      setError('Lỗi khi lưu món ăn: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (food) => {
    setIsEditing(true);
    setFormData({
      foodId: food.foodId,
      name: food.name,
      category: food.category,
      cuisine: food.cuisine,
      ingredients: Array.isArray(food.ingredients) ? food.ingredients.join(', ') : food.ingredients || '',
      price: food.price,
      quantity: food.quantity,
      description: food.description || '',
      imageUrl: food.imageUrl || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (foodId) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa món ăn ${foodId}?`)) return;
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await axios.delete(`${API_BASE_URL}/${foodId}`);
      setSuccessMsg('Xóa món ăn thành công!');
      if (selectedFood?.foodId === foodId) setSelectedFood(null);
      fetchFoods(searchTerm);
    } catch (err) {
      setError('Lỗi khi xóa món ăn: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Quản Lý Món Ăn - Văn Công Hân (236896)</h1>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="main-content">
        <section className="form-section">
          <h2>{isEditing ? 'Cập Nhật Món Ăn' : 'Thêm Món Ăn Mới'}</h2>
          <form onSubmit={handleSubmit} className="food-form">
            <div className="form-group">
              <label>Mã món ăn (foodId):</label>
              <input
                type="text"
                name="foodId"
                value={formData.foodId}
                onChange={handleInputChange}
                required
                disabled={isEditing}
              />
            </div>
            <div className="form-group">
              <label>Tên món ăn:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Loại món ăn (category):</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Ẩm thực / Vùng miền (cuisine):</label>
              <input
                type="text"
                name="cuisine"
                value={formData.cuisine}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Giá bán (VND):</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Số lượng:</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                required
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Nguyên liệu (phân cách bằng dấu phẩy):</label>
              <input
                type="text"
                name="ingredients"
                value={formData.ingredients}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Link hình ảnh (imageUrl):</label>
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Mô tả:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
              />
            </div>
            <div className="button-group">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {isEditing ? 'Lưu Cập Nhật' : 'Thêm Mới'}
              </button>
              {isEditing && (
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Hủy
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="list-section">
          <h2>Danh Sách Món Ăn</h2>
          
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Tìm theo tên, loại, ẩm thực..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="btn btn-search">Tìm kiếm</button>
            <button type="button" className="btn btn-secondary" onClick={() => { setSearchTerm(''); fetchFoods(''); }}>
              Làm mới
            </button>
          </form>

          {loading ? (
            <p className="loading">Đang tải dữ liệu...</p>
          ) : (
            <div className="food-grid">
              {foods.map((food) => (
                <div key={food._id || food.foodId} className="food-card">
                  {food.imageUrl && <img src={food.imageUrl} alt={food.name} className="food-img" />}
                  <div className="food-info">
                    <h3>{food.name} ({food.foodId})</h3>
                    <p><strong>Loại:</strong> {food.category} | <strong>Ẩm thực:</strong> {food.cuisine}</p>
                    <p><strong>Giá:</strong> {food.price.toLocaleString('vi-VN')} VNĐ</p>
                    <p><strong>Số lượng:</strong> {food.quantity}</p>
                    <div className="card-actions">
                      <button className="btn btn-info" onClick={() => setSelectedFood(food)}>Xem chi tiết</button>
                      <button className="btn btn-warning" onClick={() => handleEdit(food)}>Sửa</button>
                      <button className="btn btn-danger" onClick={() => handleDelete(food.foodId)}>Xóa</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedFood && (
        <div className="modal-overlay" onClick={() => setSelectedFood(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Chi Tiết Món Ăn</h2>
            <p><strong>Mã món:</strong> {selectedFood.foodId}</p>
            <p><strong>Tên món:</strong> {selectedFood.name}</p>
            <p><strong>Loại:</strong> {selectedFood.category}</p>
            <p><strong>Ẩm thực:</strong> {selectedFood.cuisine}</p>
            <p><strong>Giá:</strong> {selectedFood.price.toLocaleString('vi-VN')} VNĐ</p>
            <p><strong>Số lượng còn:</strong> {selectedFood.quantity}</p>
            <p><strong>Nguyên liệu:</strong> {Array.isArray(selectedFood.ingredients) ? selectedFood.ingredients.join(', ') : selectedFood.ingredients}</p>
            <p><strong>Mô tả:</strong> {selectedFood.description}</p>
            {selectedFood.imageUrl && <img src={selectedFood.imageUrl} alt={selectedFood.name} style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', marginTop: '10px' }} />}
            <button className="btn btn-secondary" style={{ marginTop: '15px' }} onClick={() => setSelectedFood(null)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;