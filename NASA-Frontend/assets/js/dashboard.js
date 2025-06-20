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
const thongKeData = {
  sanPham: 4821,
  hoaDon: 789,
  khachHang: 123
};

// Đảm bảo chạy sau khi DOM đã load
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('so-san-pham').innerHTML = `<strong>${thongKeData.sanPham}</strong>`;
  document.getElementById('so-hoa-don').innerHTML = `<strong>${thongKeData.hoaDon}</strong>`;
  document.getElementById('so-khach-hang').innerHTML = `<strong>${thongKeData.khachHang}</strong>`;
});

// ========================================Dòng 3===========================================
const sachMoiData = [
  { ten: "Sách 1", anh: "https://cdn1.fahasa.com/media/catalog/product/n/x/nxbtrestoryfull_25502016_015023.jpg" },
  { ten: "Sách 2", anh: "https://cdn1.fahasa.com/media/catalog/product/n/x/nxbtrestoryfull_25502016_015023.jpg" },
  { ten: "Sách 3", anh: "https://cdn1.fahasa.com/media/catalog/product/n/x/nxbtrestoryfull_25502016_015023.jpg" },
  { ten: "Sách 4", anh: "https://cdn1.fahasa.com/media/catalog/product/n/x/nxbtrestoryfull_25502016_015023.jpg" },
  { ten: "Sách 5", anh: "https://cdn1.fahasa.com/media/catalog/product/n/x/nxbtrestoryfull_25502016_015023.jpg" },
  { ten: "Sách 6", anh: "https://cdn1.fahasa.com/media/catalog/product/n/x/nxbtrestoryfull_25502016_015023.jpg" },
  { ten: "Sách 7", anh: "https://cdn1.fahasa.com/media/catalog/product/n/x/nxbtrestoryfull_25502016_015023.jpg" }
];

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
      <img src="${sach.anh}" class="img-fluid mb-2" style="height: 140px; object-fit: cover; border: 1px solid #ccc; border-radius: 5px;">
      <p style="font-size: 14px; color: #1a3a9c;">${sach.ten}</p>
    `;
    container.appendChild(bookDiv);
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
const sachHotData = [
  { ten: "Sách 1", anh: "https://cdn1.fahasa.com/media/catalog/product/8/9/8934974179375.jpg" },
  { ten: "Sách 2", anh: "https://cdn1.fahasa.com/media/catalog/product/8/9/8934974179375.jpg" },
  { ten: "Sách 3", anh: "https://cdn1.fahasa.com/media/catalog/product/8/9/8934974179375.jpg" },
  { ten: "Sách 4", anh: "https://cdn1.fahasa.com/media/catalog/product/8/9/8934974179375.jpg" },
  { ten: "Sách 5", anh: "https://cdn1.fahasa.com/media/catalog/product/8/9/8934974179375.jpg" },
  { ten: "Sách 6", anh: "https://cdn1.fahasa.com/media/catalog/product/8/9/8934974179375.jpg" },
  { ten: "Sách 7", anh: "https://cdn1.fahasa.com/media/catalog/product/8/9/8934974179375.jpg" }
];

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
  renderBooks(containerNew, sachMoiData, currentPageNew, btnPrevNew, btnNextNew);
  renderBooks(containerHot, sachHotData, currentPageHot, btnPrevHot, btnNextHot);
});