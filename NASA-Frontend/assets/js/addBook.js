import React, { useState } from "react";
import axios from "axios";
import "../css/addBook.css";

function AddBook() {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    quantity: "",
    price: "",
    description: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("title", formData.title);
    data.append("author", formData.author);
    data.append("category", formData.category);
    data.append("quantity", formData.quantity);
    data.append("price", formData.price);
    data.append("description", formData.description);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      await axios.post("/api/books", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Thêm sách thành công!");
      setFormData({
        title: "",
        author: "",
        category: "",
        quantity: "",
        price: "",
        description: "",
        image: null,
      });
    } catch (error) {
      console.error(error);
      alert("Có lỗi khi thêm sách.");
    }
  };

  return (
    <div className="add-book-container">
      <h2>Thêm sách</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Tên sách:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Tác giả:</label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Thể loại:</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Số lượng:</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            min={0}
          />
        </div>
        <div>
          <label>Giá bán:</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min={0}
          />
        </div>
        <div>
          <label>Mô tả:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            required
          />
        </div>
        <div>
          <label>Tải hình ảnh lên:</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
          />
          {formData.image && <p>Đã chọn: {formData.image.name}</p>}
        </div>
        <button type="submit">Add</button>
      </form>
    </div>
  );
}

export default AddBook;
