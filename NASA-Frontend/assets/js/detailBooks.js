// books.js
import { renderPagination } from "../../components/js/pagination.js";
import { showEditOverlay, setupEditOverlayEvents } from "../../components/js/edit-book-overlay.js";


export async function getBooksByPage(apiUrl) {
  const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data?.message || 'Tải sách thất bại. Vui lòng thử lại sau!';
      const errorTiltle = 'Lỗi tải sách';
      showModalError(errorTiltle, message, './');
      return;
    }
    return data.data; 
}

export function renderBooks(bookList, importMode=false) {
  let container = document.getElementById("books-container");
  if (importMode) {
    container = document.getElementById("import-list");
  }
  container.innerHTML = "";
  if (bookList.length === 0) {
    container.innerHTML = `<p class="fst-italic text-center mt-3">Không tìm thấy kết quả</p>`;
    return;
  }

  bookList.forEach(book => {
    const bookCard = document.createElement("div");
    if (!importMode) {
        bookCard.className = "col-md-6";
        bookCard.innerHTML = `
          <div class="card shadow-sm d-flex flex-row p-2">
            <div id="show-detail-info" class="d-flex align-items-start gap-3">
              <img src="${book.image}" alt="cover" class="img-fluid rounded" style="width: 100px; height: 130px; object-fit: cover;" />
              <div class="flex-grow-1">
                <h5 class="mb-1">${book.title}</h5>
                <p class="mb-1 book-author"><strong>Tác giả:</strong> ${book.author}</p>
                <p class="mb-1 book-cate"><strong>Thể loại:</strong> ${book.category}</p>
                <p class="mb-1 book-publisher"><strong>Nhà xuất bản:</strong> ${book.publisher}</p>
                <p class="mb-1 book-price"><strong>Giá:</strong> ${book.price} đ</p>
                <p class="mb-1 book-quan"><strong>Số lượng:</strong> ${book.quantity}</p>
                <p class="mb-1 book-des"><strong>Mô tả:</strong> ${book.description}</p>
              </div>
            </div>
            <div class="dropdown ms-2">
              <button class="btn bg-white btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown"></button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item update-btn" href="#" data-id="${book._id}">Cập nhật</a></li>
                <li><a class="dropdown-item delete-btn" data-id="${book._id}" data-title="${book.title}">Xoá</a></li>
              </ul>
            </div>
          </div>
        `;
        bookCard.querySelector("#show-detail-info").addEventListener("click", (e) => {
          if (e.target.classList.contains("update-btn") || e.target.classList.contains("delete-btn")) {
            e.stopPropagation(); // Ngăn chặn sự kiện click lan truyền
          } else {
            // Chuyển hướng đến trang chi tiết sách
            console.log(book);
            localStorage.setItem("bookDetail", JSON.stringify(book));
            window.location.href = `./bookInfo.html`;
          } 
        });
    } else {
      bookCard.className = 'mb-3 d-flex align-items-center justify-content-between';

      bookCard.innerHTML = `
        <div class="container">
          <div class="row align-items-center mb-3">
            <!-- Hình ảnh -->
            <div class="col-md-1 text-center">
              <img src="${book.image}" style="width: 50px; height: 50px;">
            </div>

            <!-- Tên sách -->
            <div class="col-md-5">
              <strong>${book.title}</strong>
            </div>

            <!-- Số lượng hiện tại -->
            <div class="col-md-2">
              Hiện tại: <strong>${book.quantity}</strong>
            </div>

            <!-- Nhập thêm -->
            <div class="col-md-2 text-end">
              Nhập thêm:
            </div>

            <!-- Ô input -->
            <div class="col-md-2">
              <input type="number" class="form-control" style="width: 100px;" min="1" id="import-${book._id}" data-title="${book.title}" placeholder="Số lượng"/>
            </div>
          </div>
        </div>
      `;
    }
    container.appendChild(bookCard);
    document.querySelectorAll(".update-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const card = btn.closest(".card");
        const book = {
          _id: btn.dataset.id,
          title: card.querySelector("h5").textContent,
          author: card.querySelector(".book-author").textContent.replace("Tác giả: ", ""),
          category: card.querySelector(".book-cate").textContent.replace("Thể loại: ", ""),
          publisher: card.querySelector(".book-publisher").textContent.replace("Nhà xuất bản: ", ""),
          price: card.querySelector(".book-price").textContent.replace("Giá: ", "").replace(" đ", ""),
          quantity: card.querySelector(".book-quan").textContent.replace("Số lượng: ", ""),
          description: card.querySelector(".book-des").textContent.replace("Mô tả: ", ""),
          image: card.querySelector("img").src,
        };
        showEditOverlay(book);
      });
    });
  });
}

//tìm kiếm
export function setupSearchEvent(bookList, id_search = "search-input", importMode = false) {
  // console.log(bookList);
  const searchInput = document.getElementById(id_search);
  if (!searchInput) return;

  searchInput.addEventListener("input", function () {
    const keyword = this.value.toLowerCase().trim();

    const filtered = bookList.filter(book =>
      book.title.toLowerCase().includes(keyword) ||
      book.author.toLowerCase().includes(keyword) ||
      book.category.toLowerCase().includes(keyword) ||
      book.description.toLowerCase().includes(keyword) ||
      book.publisher.toLowerCase().includes(keyword)
    );

    if (!importMode) 
      renderBooks(filtered);
    else
      renderBooks(filtered, true);
  });
}

export async function getAllBooks() {
  const bookList = [];
  const url = `http://localhost:3000/api/books`;
  const data = await getBooksByPage(url);
  const total = data.total;
  const limit = data.limit;
  const totalPages = Math.ceil(total / limit);
  for (let i = 1; i <= totalPages; i++) {
    const pageUrl = `http://localhost:3000/api/books?page=${i}`;
    const pageData = await getBooksByPage(pageUrl);
    bookList.push(...pageData.books);
  }
  // console.log(bookList);
  return {
    'books': bookList,
    'limit': limit
  };
}
getAllBooks().then(book => {
  setupSearchEvent(book.books);
});


async function initBooks(page = 1) {
  const url = `http://localhost:3000/api/books?page=${page}`;
  const data = await getBooksByPage(url);
  renderBooks(data.books);
  renderPagination(data.total, data.limit, data.page, (newPage) => {
    initBooks(newPage);
  });
  
}

if (window.location.pathname.includes("detailBooks.html")) {
  initBooks();
}
// Load HTML overlay component trước khi setup
window.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("edit-overlay-container");
  const url = container.dataset.url;
  fetch(url)
    .then(res => res.text())
    .then(html => {
      container.innerHTML = html;
      setupEditOverlayEvents(); // sau khi HTML đã gắn vào DOM
    });
});



