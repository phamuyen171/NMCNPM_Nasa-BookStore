// books.js

// in ra danh sách
const books = [
  {
    title: "Đắc Nhân Tâm",
    author: "Dale Carnegie",
    price: "81.000",
    category: "Kỹ năng sống",
    quantity: "420",
    image: "https://nhasachphuongnam.com/images/detailed/217/dac-nhan-tam-bc.jpg",
    description:"Quyển sách gồm 6 phần, mỗi phần có nhiều chương. Quyển sách đưa ra các lời khuyên về cách thức cư xử, ứng xử và giao tiếp với mọi người để đạt được thành công trong cuộc sống "
  },
  {
    title: "Vũ Trụ Song Song",
    author: "Brian Greene",
    price: "72.000",
    category: "Khoa học",
    quantity: "110",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTitHyKvG0aUUUp3xwW3jQY27axUC0KlkYEXQ&s",
    description:"Đã từng có lúc chúng ta cho là “vũ trụ” đồng nghĩa với vạn vật. Tuy nhiên, trong vài năm gần đây những khám phá trong lĩnh vực vật lý và vũ trụ học khiến một số nhà vật lý học đi đến kết luận rằng vũ trụ của chúng ta có thể chỉ là một trong nhiều vũ trụ. Với những suy luận sâu sắc và thuyết phục, Brian Greene giúp chúng ta có được một bức tranh tổng quát về cơ cấu đa-vũ- trụ trong vật lý thiên thể."
  }
];

const container = document.getElementById("books-container");

books.forEach(book => {
  const bookCard = document.createElement("div");
  bookCard.className = "col-md-6";
  bookCard.innerHTML = `
    <div class="card shadow-sm d-flex flex-row p-2">
      <img src="${book.image}" alt="cover" class="img-fluid rounded me-3" style="width: 100px; height: 130px; object-fit: cover;" />
      <div class="flex-grow-1">
        <h5 class="mb-1">${book.title}</h5>
        <p class="mb-1 book-author"><strong>Tác giả:</strong> ${book.author}</p>
        <p class="mb-1 book-cate"><strong>Thể loại:</strong> ${book.category}</p>
        <p class="mb-1 book-price"><strong>Giá:</strong> ${book.price} đ</p>
        <p class="mb-1 book-quan"><strong>Số lượng:</strong> ${book.quantity}</p>
        <p class="mb-1 book-des"><strong>Mô tả:</strong> ${book.description}</p>
      </div>
      <div class="dropdown ms-2">
        <button class="btn bg-white btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown"></button>
        <ul class="dropdown-menu">
          <li><a class="dropdown-item update-btn" href="#">Cập nhật</a></li>
          <li><a class="dropdown-item delete-btn" href="#">Xoá</a></li>
        </ul>
      </div>
    </div>
  `;
  container.appendChild(bookCard);
});

// tìm kiếm
function setupSearchEvent() {
  const searchInput = document.getElementById("search-input");
  if (!searchInput) return;

  searchInput.addEventListener("input", function () {
    const keyword = this.value.toLowerCase().trim();

    const filtered = books.filter(book =>
      book.title.toLowerCase().includes(keyword) ||
      book.author.toLowerCase().includes(keyword) ||
      book.category.toLowerCase().includes(keyword) ||
      book.description.toLowerCase().includes(keyword)
    );

    renderBooks(filtered);
  });
}




// const API_URL = 'http://localhost:3000/api/books';

// document.addEventListener('DOMContentLoaded', async () => {
//   try {
//     const response = await fetch(`${API_URL}?page=1&limit=10`);
//     const result = await response.json();

//     if (result.success) {
//       const books = result.data.books;
//       renderBooks(books);
//     } else {
//       console.error('Lỗi khi lấy dữ liệu sách:', result);
//     }
//   } catch (error) {
//     console.error('Lỗi fetch:', error);
//   }
// });

// function renderBooks(books) {
//   const container = document.getElementById('books-container');
//   container.innerHTML = ''; // clear cũ

//   books.forEach((book) => {
//     const card = document.createElement('div');
//     card.className = 'col-md-6';

//     card.innerHTML = `
//       <div class="card shadow-sm d-flex flex-row p-2 align-items-center">
//         <img src="${book.coverImage || 'https://via.placeholder.com/100x130'}" alt="cover" class="img-fluid rounded me-3" style="width: 100px; height: 130px; object-fit: cover;" />
//         <div class="flex-grow-1">
//           <h5 class="mb-1">${book.title}</h5>
//           <p class="mb-1"><strong>Tác giả:</strong> ${book.author}</p>
//           <p class="mb-1"><strong>Giá:</strong> ${book.price.toLocaleString()} đ</p>
//           <p class="mb-1"><strong>Thể loại:</strong> ${book.category}</p>
//         </div>
//         <div class="dropdown ms-2">
//           <button class="btn btn-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
//             Thao tác
//           </button>
//           <ul class="dropdown-menu">
//             <li><a class="dropdown-item update-btn" href="#" data-id="${book._id}">Cập nhật</a></li>
//             <li><a class="dropdown-item delete-btn" href="#" data-id="${book._id}">Xoá</a></li>
//           </ul>
//         </div>
//       </div>
//     `;

//     container.appendChild(card);
//   });

//   // Gắn sự kiện cho nút xoá
//   document.querySelectorAll('.delete-btn').forEach((btn) => {
//     btn.addEventListener('click', (e) => {
//       e.preventDefault();
//       const bookId = btn.dataset.id;
//       deleteBook(bookId);
//     });
//   });

//   // Gắn sự kiện cho nút cập nhật
//   document.querySelectorAll('.update-btn').forEach((btn) => {
//     btn.addEventListener('click', (e) => {
//       e.preventDefault();
//       const bookId = btn.dataset.id;
//       // TODO: mở form cập nhật thông tin sách
//       alert(`Cập nhật sách: ${bookId}`);
//     });
//   });
// }

// function deleteBook(bookId) {
//   if (confirm('Bạn có chắc chắn muốn xoá sách này?')) {
//     fetch(`${API_URL}/${bookId}`, {
//       method: 'DELETE',
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.success) {
//           alert('Đã xoá sách!');
//           location.reload();
//         } else {
//           alert('Xoá thất bại!');
//         }
//       })
//       .catch((err) => {
//         console.error('Lỗi khi xoá:', err);
//         alert('Có lỗi xảy ra khi xoá!');
//       });
//   }
// }
