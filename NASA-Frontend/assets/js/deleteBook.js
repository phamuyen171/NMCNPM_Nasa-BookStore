document.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    e.preventDefault();

    const bookId = e.target.dataset.id;
    const bookTitle = e.target.dataset.title;

    showModalDelete(
        "XÓA SÁCH", 
        bookTitle, 
        async () => {
            fetch(`http://localhost:3000/api/books/${bookId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            })
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    
                    throw new Error(data.message);
                }
                return data;
            })
            .then(data => {
                if (data.success) {
                    const currentURL = window.location.href;
                    showSuccessModal(
                        'XÓA SÁCH',
                        `Xóa sách <b>${bookTitle}</b> thành công`,
                        [
                            {
                                text: 'Xem danh sách',
                                link: currentURL
                            }                        
                        ]
                    )
                }
                else {
                    showModalError('XÓA SÁCH', data.message)
                }
            })
            .catch(error => {
                showModalError('XÓA SÁCH', error.message)
            });
        },
        () => showModalError("XÓA SÁCH", `Nhập đúng <b>${bookTitle}</b> để xác thực.`)
    );
  }
});
