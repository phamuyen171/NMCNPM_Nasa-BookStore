// ===========================Ảnh================================
const carouselEl = document.querySelector('#dashboardCarousel');
if (carouselEl) {
  new bootstrap.Carousel(carouselEl, {
    interval: 3000,
    ride: 'carousel',
    touch: true,
    pause: false,
    wrap: true
  });
}

// =======================================Dòng 2==============================================
let thongKeData = {
  sanPham: 4821,
  hoaDon: 789,
  khachHang: 123
};

// Đảm bảo chạy sau khi DOM đã load
document.addEventListener('DOMContentLoaded', () => {
  fetch("http://localhost:3000/api/books/count-books")
  .then(async response => {
    const data = await response.json();

    if (!data.success) {  
      throw new Error(data.message);
    }
    return data;
  })
  .then(data => {
    if (!data || !data.data) {
      throw new Error("Không có dữ liệu thống kê số lượng sách.");
    }
    thongKeData.sanPham = data.data.totalBooks;
    document.getElementById('so-san-pham').innerHTML = `<strong>${thongKeData.sanPham}</strong>`;
  })
  .catch(error => { 
    console.error("Lỗi khi lấy dữ liệu thống kê sách:", error);
  });

  fetch("http://localhost:3000/api/invoices/count-invoices")
  .then(async response => {
    const data = await response.json();

    if (!data.success) {  
      throw new Error(data.message);
    }
    return data;
  })
  .then(data => {
    if (!data || !data.data) {
      throw new Error("Không có dữ liệu thống kê số lượng hóa đơn.");
    }
    thongKeData.hoaDon = data.data.count;
    document.getElementById('so-hoa-don').innerHTML = `<strong>${thongKeData.hoaDon}</strong>`;
  })
  .catch(error => { 
    console.error("Lỗi khi lấy dữ liệu thống kê hóa đơn:", error);
  });

  fetch("http://localhost:3000/api/customers/count-customers")
  .then(async response => {
    const data = await response.json();

    if (!data.success) {  
      throw new Error(data.message);
    }
    return data;
  })
  .then(data => {
    if (!data || !data.data) {
      throw new Error("Không có dữ liệu thống kê số lượng khách hàng.");
    }
    thongKeData.khachHang = data.data.count;
    document.getElementById('so-khach-hang').innerHTML = `<strong>${thongKeData.khachHang}</strong>`;
  })
  .catch(error => { 
    console.error("Lỗi khi lấy dữ liệu thống kê khách hàng:", error);
  });
});

// ========================================Dòng 3===========================================
let sachMoiData = [];

function renderBooks(container, data, currentPage, btnPrev, btnNext) {
  container.innerHTML = "";

  const booksPerPage = 5;
  const start = currentPage.value * booksPerPage;
  const end = Math.min(start + booksPerPage, data.length);

  for (let i = start; i < end; i++) {
    const sach = data[i];
    const bookDiv = document.createElement("div");
    bookDiv.className = "text-center";
    bookDiv.style.width = "120px";
    bookDiv.style.margin = "0 10px";

    bookDiv.innerHTML = `
      <div class="book">
        <img src="${sach.image}" class="img-fluid mb-2" style="height: 140px; object-fit: cover; border: 1px solid #ccc; border-radius: 5px;">
        <p style="font-size: 14px; color: #1a3a9c;">${sach.title}</p>
      </div>
    `;
    container.appendChild(bookDiv);

    const bookElement = bookDiv.querySelector('.book');
    bookElement.dataset.info = JSON.stringify(sach); 

    // Gắn sự kiện click vào toàn bộ thẻ .book
    bookElement.addEventListener('click', (e) => {
      const info = e.currentTarget.dataset.info;
      try {
        localStorage.setItem("bookDetail", info);
        window.location.href = `../book/bookInfo.html`;
      } catch (err) {
        console.error("Lỗi khi parse data-info:", err);
      }
    });
  

  }

  btnPrev.style.display = currentPage.value === 0 ? "none" : "inline-block";
  btnNext.style.display = end >= data.length ? "none" : "inline-block";
}

// Dòng Hàng mới về
const currentPageNew = { value: 0 };
const containerNew = document.getElementById("new-book-container");
const btnPrevNew = document.getElementById("btn-prev-new");
const btnNextNew = document.getElementById("btn-next-new");

btnPrevNew.addEventListener("click", () => {
  if (currentPageNew.value > 0) {
    currentPageNew.value--;
    renderBooks(containerNew, sachMoiData, currentPageNew, btnPrevNew, btnNextNew);
  }
});

btnNextNew.addEventListener("click", () => {
  if ((currentPageNew.value + 1) * 5 < sachMoiData.length) {
    currentPageNew.value++;
    renderBooks(containerNew, sachMoiData, currentPageNew, btnPrevNew, btnNextNew);
  }
});


// ==============================================Dòng 4===========================================
let sachHotData = [];

const currentPageHot = { value: 0 };
const containerHot = document.getElementById("hot-book-container");
const btnPrevHot = document.getElementById("btn-prev-hot");
const btnNextHot = document.getElementById("btn-next-hot");

btnPrevHot.addEventListener("click", () => {
  if (currentPageHot.value > 0) {
    currentPageHot.value--;
    renderBooks(containerHot, sachHotData, currentPageHot, btnPrevHot, btnNextHot);
  }
});

btnNextHot.addEventListener("click", () => {
  if ((currentPageHot.value + 1) * 5 < sachHotData.length) {
    currentPageHot.value++;
    renderBooks(containerHot, sachHotData, currentPageHot, btnPrevHot, btnNextHot);
  }
});

// Gọi lần đầu
document.addEventListener("DOMContentLoaded", () => {
  fetch("http://localhost:3000/api/books/get-newest-books?limit=10")
  .then(async response => {
    const data = await response.json();

    if (!data.success) {  
      throw new Error("Lỗi khi lấy dữ liệu sách mới nhất.");
    }
    return data;
  })
  .then(data => {
    if (!data || !data.data) {
      throw new Error("Không có dữ liệu sách mới nhất.");
    }
    data.data.forEach(book => {
      sachMoiData.push(book);
    });
    renderBooks(containerNew, sachMoiData, currentPageNew, btnPrevNew, btnNextNew);
  })
  .catch(error => { 
    console.error("Lỗi khi lấy dữ liệu sách mới nhấ:", error);
  });

  fetch("http://localhost:3000/api/books/popular-books?limit=10")
  .then(async response => {
    const data = await response.json();

    if (!data.success) {  
      throw new Error("Lỗi khi lấy dữ liệu sách phổ biến: ");
    }
    return data;
  })
  .then(data => {
    if (!data || !data.data) {
      throw new Error("Không có dữ liệu sách phổ biến.");
    }
    data.data.forEach(book => {
      sachHotData.push(book);
    });
    renderBooks(containerHot, sachHotData, currentPageHot, btnPrevHot, btnNextHot);

  })
  .catch(error => { 
    console.error("Lỗi khi lấy dữ liệu sách phổ biến:", error);
  });
});