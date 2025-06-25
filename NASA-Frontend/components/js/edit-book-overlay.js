let currentEditId = null;

export function showEditOverlay(book) {
  currentEditId = book._id;
  document.getElementById("edit-title").value = book.title;
  document.getElementById("edit-author").value = book.author;
  document.getElementById("edit-category").value = book.category;
  document.getElementById("edit-publisher").value = book.publisher;
  document.getElementById("edit-quantity").value = book.quantity;
  document.getElementById("edit-price").value = book.price;
  document.getElementById("edit-image").value = book.image;
  document.getElementById("edit-description").value = book.description;
  document.querySelector(".edit-overlay").classList.add("active");
}

export function setupEditOverlayEvents() {
  document.getElementById("cancelEditBtn").addEventListener("click", () => {
    document.querySelector(".edit-overlay").classList.remove("active");
  });

  document.getElementById("saveEditBtn").addEventListener("click", async (e) => {
    e.preventDefault();
    const updatedBook = {
      title: document.getElementById("edit-title").value,
      author: document.getElementById("edit-author").value,
      category: document.getElementById("edit-category").value,
      publisher: document.getElementById("edit-publisher").value,
      quantity: Number(document.getElementById("edit-quantity").value),
      price: parseFloat(document.getElementById("edit-price").value),
      image: document.getElementById("edit-image").value,
      description: document.getElementById("edit-description").value,
    };

    try {
      const res = await fetch(`http://localhost:3000/api/books/${currentEditId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedBook),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cập nhật thất bại");

      document.querySelector(".edit-overlay").classList.remove("active");
      const successButtons = Array.isArray(window.successModalButtons)
        ? window.successModalButtons
        : [
            { text: "Đóng", link: window.location.href },
            ];
        localStorage.setItem("bookDetail", JSON.stringify({ ...updatedBook, _id: currentEditId }));
        showSuccessModal("Thành công", "Sách đã được cập nhật", successButtons);

    } catch (err) {
        let msg = err?.message || "Đã xảy ra lỗi";
        const parts = msg.split(":");
        if (parts.length > 1) {
            msg = parts[parts.length - 1].trim();
        }

        showModalError("Lỗi", msg);
    }
  });
}
