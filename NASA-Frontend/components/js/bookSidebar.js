// const sidebarList = document.getElementById("sidebarList");

// sidebarList.addEventListener("click", function(event) {
//   const target = event.target;
//   if (target.tagName === "LI") {
//     // Bỏ active của tất cả
//     const items = sidebarList.querySelectorAll("li");
//     items.forEach(item => item.classList.remove("active"));

//     // Thêm active cho mục được click
//     target.classList.add("active");

//     // Lấy data-item
//     const selectedItem = target.getAttribute("data-item");
//     console.log("Bạn chọn mục:", selectedItem);

//     // Xử lý chuyển trang
//     switch(selectedItem) {
//       case "viewList":
//         // Ở trang detailBooks.html, sidebar luôn hiển thị, nên giữ lại
//         // Nếu bạn có trang danh sách riêng thì đổi URL tương ứng
//         window.location.href = "detailBooks.html"; 
//         break;
//       case "addBook":
//         window.location.href = "addBook.html"; 
//         break;
//       case "importBook":
//         // Nếu có trang nhập sách riêng
//         window.location.href = "importBook.html"; 
//         break;
//       default:
//         break;
//     }
//   }
// });


function loadSidebar() {
  fetch('../../components/html/bookSidebar.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('sidebarContainer').innerHTML = html;
      // Sau khi load xong, load script xử lý tương tác sidebar
      loadSidebarScript();
    })
    .catch(err => {
      console.error('Error loading sidebar:', err);
    });
}

function loadSidebarScript() {
  // Ví dụ script tương tác sidebar.js (nếu bạn để code riêng)
  // Hoặc bạn viết code tương tác trực tiếp ở đây

  const sidebarList = document.getElementById("sidebarList");
  if (!sidebarList) return;

  sidebarList.addEventListener("click", function(event) {
    const target = event.target;
    if (target.tagName === "LI") {
      // Xóa active của các item khác
      sidebarList.querySelectorAll("li").forEach(li => li.classList.remove("active"));
      target.classList.add("active");

      const selectedItem = target.getAttribute("data-item");
      switch(selectedItem) {
        case "viewList":
          window.location.href = "detailBooks.html";
          break;
        case "addBook":
          window.location.href = "addBook.html";
          break;
        case "importBook":
          window.location.href = "importBook.html";
          break;
      }
    }
  });

  // Tự động highlight item tương ứng trang hiện tại
  const currentPage = window.location.pathname.split('/').pop();
  sidebarList.querySelectorAll("li").forEach(li => {
    if (currentPage.includes('addBook') && li.getAttribute("data-item") === "addBook") {
      li.classList.add("active");
    } else if (currentPage.includes('detailBooks') && li.getAttribute("data-item") === "viewList") {
      li.classList.add("active");
    }
    // Thêm điều kiện cho các trang khác nếu cần
  });
}

window.onload = loadSidebar;


