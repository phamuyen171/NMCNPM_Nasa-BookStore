document.getElementById('submitBtn').addEventListener('click', () => {
  const errorTitle = "LỖI NHẬP SÁCH"

  const title = document.getElementById('book-name').value.trim();
  if (!title || title.length === 0) {
    showModalError(errorTitle, "Vui lòng nhập tên sách");
    return;
  }
  const author = document.getElementById('book-author').value.trim();
  if (!author || author.length === 0) {
    showModalError(errorTitle, "Vui lòng nhập tên tác giả");
    return;
  }
  const category = document.getElementById('book-category').value.trim();
  if (!category || category.length === 0) {
    showModalError(errorTitle, "Vui lòng nhập thể loại sách");
    return;
  }
  const quantity = document.getElementById('book-quantity').value.trim();
  if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
    showModalError(errorTitle, "Vui lòng nhập số lượng sách hợp lệ");
    return;
  }
  const price = document.getElementById('book-price').value.trim();
  if (!price || isNaN(price) || parseFloat(price) <= 0) {
    showModalError(errorTitle, "Vui lòng nhập giá sách hợp lệ");
    return;
  }

  const publisher = document.getElementById('book-publisher').value.trim() || ' ';
  const imageUrl = document.getElementById('image-url').value.trim();
  if (!imageUrl || imageUrl.length === 0) {
    showModalError(errorTitle, "Vui lòng nhập URL hình ảnh sách");
    return;
  }
  const description = document.getElementById('book-description').value.trim() || 'No description provided';
  // Lấy dữ liệu từ form
  const newBook = {
    title: title,
    author: author,
    category: category,
    quantity: parseInt(quantity),
    price: parseFloat(price),
    image: imageUrl,
    description: description,
    publisher: publisher,
    priceImport: parseFloat(price) * 0.8
  };

  showModalConfirm("THÊM SÁCH", "thêm sách", "../../", () => {
    fetch('http://localhost:3000/api/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify(newBook),
    })
      .then(async (response) => {
        const text = await response.text();

        if (!response.ok) {
          throw new Error(response.statusText);
        }

        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      })
      .then(data => {
        showSuccessModal(
          'THÊM SÁCH',
          'Thêm sách thành công!',
          [
            {
              text: 'Xem danh sách',
              link: 'detailBooks.html'
            },
            {
              text: 'Thêm sách',
              link: 'addBook.html'

            }
          ]
        );
      })
      .catch(err => {
        showModalError(errorTitle, 'Lỗi khi thêm sách: ' + err.message);
      });
  });
});
