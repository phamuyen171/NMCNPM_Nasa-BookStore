// books.js
import { renderPagination } from "../../components/js/pagination.js";
import { getBooksByPage, renderBooks, setupSearchEvent, getAllBooks } from "./detailBooks.js";

const min_quantity = 100;
const max_import = 300;
const min_import = 100;


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

        // bookRow.innerHTML = `
        //     <label class="form-label mb-0 me-2" style="flex: 1;">${book.title}</label>
        //     <input type="number" class="form-control" style="width: 100px;" min="1" id="import-${book._id}" data-title="${book.title}" placeholder="Số lượng"/>
        // `;
        // bookRow.innerHTML = `
        //     <label class="form-label mb-0 me-2" style="flex: 1;">
        //         ${book.title}
        //         <span class="text-muted ms-3"> Hiện tại: ${book.quantity}</span>
        //     </label>
        //     <input type="number" class="form-control" style="width: 100px;" min="1" id="import-${book._id}" data-title="${book.title}" placeholder="Số lượng"/>
        // `;

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

//xử lý khi nhấn nút áp dụng chung
document.getElementById('apply-common-quantity').addEventListener('click', () => {
    const value = parseInt(document.getElementById('common-import-quantity').value);
    const title = 'LỖI NHẬP SÁCH'

    if (isNaN(value) || value <= 0) {
        // alert('Vui lòng nhập số lượng hợp lệ lớn hơn 0.');
        showModalError(title, 'Vui lòng nhập số lượng hợp lệ lớn hơn 0.');
        return;
    }

    if (value > max_import) {
        // alert(`Số lượng vượt quá giới hạn cho phép (${max_import}).`);
        showModalError(title, `Số lượng vượt quá giới hạn cho phép (${max_import}).`);
        return;
    }

    if (value < min_import) {
        // alert(`Số lượng nhỏ hơn giới hạn cho phép (${min_import}).`);
        showModalError(title, `Số lượng nhỏ hơn giới hạn cho phép (${min_import}).`);
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

            importData.push({ bookId, quantityToImport: value });
        }
    });

    if (hasInvalidInput) {
        if (overMaxBooks.length > 0 && underMinBooks.length > 0) {
            showModalError('LỖI NHẬP SÁCH', 
                `Số lượng nhập cho các sách: ${overMaxBooks.join(', ')} vượt quá giới hạn <b>${max_import}</b>.
                <br> Số lượng nhập cho các sách: ${underMinBooks.join(', ')} nhỏ hơn số lượng tối thiểu <b>${min_import}</b>.`,
                "", true);
        }
        else if (overMaxBooks.length > 0) {
            // alert(`Số lượng nhập cho sách ${overMaxBooks.join(', ')} vượt quá giới hạn ${max_import}.`);
            showModalError('LỖI NHẬP SÁCH', `Số lượng nhập cho các sách: ${overMaxBooks.join(', ')} vượt quá giới hạn <b>${max_import}</b>.`, "", true);
        }
        else {
            // alert(`Số lượng nhập cho sách ${underMinBooks.join(', ')} nhỏ hơn số lượng tối thiểu ${min_import}.`);
            showModalError('LỖI NHẬP SÁCH', `Số lượng nhập cho các sách: ${underMinBooks.join(', ')} nhỏ hơn số lượng tối thiểu <b>${min_import}</b>.`, "", true);
        }
        return; // Dừng nếu có lỗi vượt max
    }

    if (importData.length === 0) {
        // alert('Vui lòng nhập ít nhất một sách với số lượng hợp lệ (> 0).');
        showModalError('LỖI NHẬP SÁCH', 'Vui lòng nhập ít nhất một sách với số lượng hợp lệ (> 0).');
        return;
    }

    console.log(importData);

    // // ✅ Chỉ khi thành công mới đóng modal nhập sách
    // const importModal = bootstrap.Modal.getInstance(document.getElementById('importBookModal'));
    // if (importModal) {
    //     importModal.hide();
    // }

    // // ✅ Mở modal xác nhận
    // const confirmModal = new bootstrap.Modal(document.getElementById('confirmImportBookModal'));
    // confirmModal.show();
    const errorTitle = 'LỖI NHẬP SÁCH';    
    importData.forEach(item => {

        showModalConfirm("NHẬP SÁCH", "nhập sách", "../../", () => {
            fetch(`http://localhost:3000/api/books/import/${item.bookId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: item.quantityToImport }),
            })
            .then(async (response) => {

                const text = await response.text();
                console.log(text)

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
            })
            .catch(err => {
                showModalError(errorTitle, 'Lỗi khi nhập sách: ' + err.message, "", true);
            });
        });
    });


    
    //Gửi sang BE
    // fetch('http://localhost:3000/api/import-order', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(importData)
    // })
    // .then(response => response.json())
    // .then(result => {
    //     console.log('Server response:', result);

    //     // // ✅ Chỉ khi thành công mới đóng modal nhập sách
    //     // const importModal = bootstrap.Modal.getInstance(document.getElementById('importBookModal'));
    //     // if (importModal) {
    //     //     importModal.hide();
    //     // }

    //     // // ✅ Mở modal xác nhận
    //     // const confirmModal = new bootstrap.Modal(document.getElementById('confirmImportBookModal'));
    //     // confirmModal.show();
    // })
    // .catch(error => {
    //     console.error('Lỗi khi gửi dữ liệu:', error);
    //     alert('Gửi dữ liệu thất bại!');
    // });
});




