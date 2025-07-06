import { showEditOverlay, setupEditOverlayEvents } from "../../components/js/edit-book-overlay.js";

document.addEventListener("DOMContentLoaded", async () => {
        
    const user = JSON.parse(localStorage.getItem("user"));
    if (user.role !== "manager"){
    document.getElementById("add-book-btn").style.display = "none";
    document.getElementById("import-book-btn").style.display = "none";
    }
    const rule = await getRule();
    const container = document.getElementById("edit-overlay-container");
    const url = container.dataset.url;
    fetch(url)
    .then(res => res.text())
    .then(html => {
    container.innerHTML = html;
    setupEditOverlayEvents(); // sau khi HTML đã gắn vào DOM
    });

    let bookInfo = JSON.parse(localStorage.getItem("bookDetail"));

    document.getElementById("bookImage").src = bookInfo.image.trim();
    document.getElementById("soldPrice").textContent = convertMoney(bookInfo.price);
    document.getElementById("importPrice").textContent = convertMoney(bookInfo.priceImport);
    if (bookInfo.quantity >= rule.book.maxImportableBook){
        document.getElementById("status").textContent = "Còn hàng";
        document.getElementById("stock").textContent = bookInfo.quantity;
    } else if (bookInfo.quantity < rule.book.maxImportableBook && bookInfo.quantity > 0) {
        const statusTag = document.getElementById("status");
        statusTag.textContent = "Sắp hết hàng";
        statusTag.classList.remove("text-primary");
        statusTag.style.color = "orange";
        document.getElementById("stock").textContent = bookInfo.quantity;

    } else{
        const statusTag = document.getElementById("status");
        statusTag.textContent = "Hết hàng";
        statusTag.classList.remove("text-primary");
        statusTag.style.color = "red";
        document.getElementById("stock").textContent = 0;
    }

    document.getElementById("book-title").textContent = bookInfo.title;
    document.getElementById("book-category").textContent = bookInfo.category;
    document.getElementById("book-publisher").textContent = bookInfo.publisher;
    document.getElementById("book-description").textContent = bookInfo.description;
    document.getElementById("book-author").textContent = bookInfo.author;

    document.getElementById("updateBookBtn").addEventListener("click", () => {
        showEditOverlay(bookInfo);
    });
});
