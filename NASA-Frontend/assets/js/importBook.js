// books.js
import { renderPagination } from "../../components/js/pagination.js";
import { getBooksByPage, renderBooks, setupSearchEvent, getAllBooks } from "./detailBooks.js";

const rules = await getRule();
// console.log(rules);

const min_quantity = rules.book.maxImportableBook;
const max_import = rules.book.maxImportBook;
const min_import = rules.book.minImportBook;


// =======================Xử lý việc in ra danh sách các sách cần nhập========================

// Lọc sách cần nhập thêm (còn thiếu số lượng)
const needImportBook = (bookList) => {
    return bookList.filter(book => book.quantity < min_quantity);
};

// Render danh sách sách cần nhập, mỗi cuốn có input để nhập số lượng cần nhập thêm
const renderImportList = (bookList) => {
    const booksToImport = needImportBook(bookList);
    const container = document.getElementById('import-list');
    container.innerHTML = ''; // Xóa nội dung cũ

    if (booksToImport.length === 0) {
        container.innerHTML = '<p>Không có sách nào cần nhập thêm.</p>';
        return;
    }

    booksToImport.forEach(book => {
        const bookRow = document.createElement('div');
        bookRow.className = 'mb-3 d-flex align-items-center justify-content-between';

        bookRow.innerHTML = `
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
        container.appendChild(bookRow);
    });
};
// ==================================================================

// In ra danh sách
async function initBooks(page=1) {
//   const url = `http://localhost:3000/api/books?page=${page}`;
//   const data = await getBooksByPage(url);
    const data = await getAllBooks();

    //in sách ra trang html
    const lowStockBooks = needImportBook(data.books);

    const start = (page - 1) * data.limit;
    const end = start + data.limit;
    const paginatedBooks = lowStockBooks.slice(start, end);
    renderBooks(paginatedBooks);

    renderPagination(lowStockBooks.length, data.limit, page, (newPage) => {
        initBooks(newPage);
    });

    // Khi nhấn nút thì render danh sách sách cần nhập trong modal
    document.getElementById('floating-import-button').addEventListener('click', () => {
        renderImportList(lowStockBooks);
        setupSearchEvent(lowStockBooks, "import-search-input", true); // Thiết lập sự kiện tìm kiếm
    });
}

if (window.location.pathname.includes("importBook.html")) {
  initBooks();
}

// ===================================================
async function handleImportAndConfirm(items) {
    // Gọi API tạo đơn nhập
    const response = await fetch('http://localhost:3000/api/books/import-order', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ items: items })
    });

    const text = await response.text();

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    let data;
    try {
        data = JSON.parse(text);
    } catch {
        throw new Error("Không thể phân tích phản hồi từ server");
    }

    if (!data || !data.data || !data.data._id) {
        throw new Error('Không nhận được ID đơn nhập sách từ server');
    }

    const orderId = data.data._id;

    // Gọi API để cập nhật trạng thái đơn nhập sang "confirmed"
    const confirmResponse = await fetch(`http://localhost:3000/api/books/import-order/confirm/${orderId}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    });

    if (!confirmResponse.ok) {
        throw new Error("Lỗi khi xác nhận đơn nhập sách");
    }

    const updateReponse = await fetch(`http://localhost:3000/api/books/import-order/receive/${orderId}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    });
    if (!confirmResponse.ok) {
        throw new Error("Lỗi khi cập nhập số lượng sách trong kho.");
    }
}
// ===================================================

//xử lý khi nhấn nút áp dụng chung
document.getElementById('apply-common-quantity').addEventListener('click', () => {
    const value = parseInt(document.getElementById('common-import-quantity').value);
    const title = 'LỖI NHẬP SÁCH'

    if (isNaN(value) || value <= 0) {
        // alert('Vui lòng nhập số lượng hợp lệ lớn hơn 0.');
        showModalError(title, `Vui lòng nhập số lượng hợp lệ lớn hơn (tối thiểu <b>${min_import}</b> và tối đa <b>${max_import}</b>).`);
        return;
    }

    if (value > max_import) {
        // alert(`Số lượng vượt quá giới hạn cho phép (${max_import}).`);
        showModalError(title, `Số lượng nhập thêm không được vượt quá giới hạn tối đa cho phép <b>${max_import}</b>.`);
        return;
    }

    if (value < min_import) {
        // alert(`Số lượng nhỏ hơn giới hạn cho phép (${min_import}).`);
        showModalError(title, `Số lượng nhập thêm phải lớn hơn giới hạn tối thiểu cho phép <b>${min_import}</b>.`);
        return;
    }

    const inputs = document.querySelectorAll('#import-list input[type="number"]');
    inputs.forEach(input => {
        input.value = value;
        console.log(input.value)
    });
});

// xử lý sự kiện khi nhấn nút "Nhập sách" trong modal
document.getElementById('confirmImport').addEventListener('click', () => {
    const container = document.getElementById('import-list');
    const inputs = container.querySelectorAll('input[type="number"]');

    const importData = [];
    const overMaxBooks = [];
    const underMinBooks = [];
    let hasInvalidInput = false;

    inputs.forEach(input => {
        const value = parseInt(input.value);
        const bookId = input.id?.replace('import-', '');
        const bookTitle = input.dataset.title;

        if (!bookId) {
            console.warn('Không thể xác định bookId từ input:', input);
            return;
        }

        if (!isNaN(value) && value > 0) {
            if (value > max_import) {
                // alert(`Số lượng nhập cho sách ID ${bookId} với số lượng ${value} vượt quá giới hạn ${max_import}.`);
                overMaxBooks.push(`<b>"${bookTitle}"</b>`);
                hasInvalidInput = true;
                return;
            }

            if (value < min_import) {
                // alert(`Số lượng nhập cho sách ID ${bookId} với số lượng ${value} nhỏ hơn số lượng tối thiểu ${min_import}.`);
                underMinBooks.push(`<b>"${bookTitle}"</b>`);
                hasInvalidInput = true;
                return;
            }

            importData.push({ bookId, quantity: value });
        }
    });

    if (hasInvalidInput) {
        if (overMaxBooks.length > 0 && underMinBooks.length > 0) {
            showModalError('LỖI NHẬP SÁCH', 
                `Số lượng nhập cho các sách: ${overMaxBooks.join(', ')} vượt quá giới hạn <b>${max_import}</b>.
                <br> Số lượng nhập cho các sách: ${underMinBooks.join(', ')} nhỏ hơn số lượng tối thiểu <b>${min_import}</b>.`);
        }
        else if (overMaxBooks.length > 0) {
            // alert(`Số lượng nhập cho sách ${overMaxBooks.join(', ')} vượt quá giới hạn ${max_import}.`);
            showModalError('LỖI NHẬP SÁCH', `Số lượng nhập cho các sách: ${overMaxBooks.join(', ')} vượt quá giới hạn <b>${max_import}</b>.`);
        }
        else {
            // alert(`Số lượng nhập cho sách ${underMinBooks.join(', ')} nhỏ hơn số lượng tối thiểu ${min_import}.`);
            showModalError('LỖI NHẬP SÁCH', `Số lượng nhập cho các sách: ${underMinBooks.join(', ')} nhỏ hơn số lượng tối thiểu <b>${min_import}</b>.`);
        }
        return; // Dừng nếu có lỗi vượt max
    }

    if (importData.length === 0) {
        // alert('Vui lòng nhập ít nhất một sách với số lượng hợp lệ (> 0).');
        showModalError('LỖI NHẬP SÁCH', `Vui lòng nhập ít nhất một sách với số lượng hợp lệ (tối thiểu <b>${min_import}</b> và tối đa <b>${max_import}</b>).`);
        return;
    }

    const errorTitle = 'LỖI NHẬP SÁCH';    
    showModalConfirm("NHẬP SÁCH", `nhập sách`, "../../",
        async() =>{
            try {
                await handleImportAndConfirm(importData);

                showSuccessModal(
                    'NHẬP SÁCH',
                    'Nhập sách thành công!',
                    [
                        {
                            text: 'Xem danh sách',
                            link: 'detailBooks.html'
                        },
                        {
                            text: 'Nhập thêm sách',
                            link: 'importBook.html'
                        }
                    ]
                );
            } catch (err) {
                showModalError(errorTitle, 'Lỗi khi nhập sách: ' + err.message);
            }
        }
    );
    
});




