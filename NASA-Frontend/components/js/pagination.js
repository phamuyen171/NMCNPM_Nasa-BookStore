export function renderPagination(total, limit, currentPage, onPageChange) {
  const totalPages = Math.ceil(total / limit);
  const container = document.getElementById("pagination-container");

  if (!container) return;

  container.innerHTML = `
    <nav aria-label="Page navigation example">
      <ul class="pagination justify-content-center mb-0">
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
          <a class="page-link" href="#" aria-label="Previous" data-page="${currentPage - 1}">
            <span aria-hidden="true">&laquo;</span>
            <span class="sr-only">Previous</span>
          </a>
        </li>
        ${Array.from({ length: totalPages }, (_, i) => {
          const page = i + 1;
          return `
            <li class="page-item ${page === currentPage ? 'active' : ''}">
              <a class="page-link" href="#" data-page="${page}">${page}</a>
            </li>
          `;
        }).join('')}
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
          <a class="page-link" href="#" aria-label="Next" data-page="${currentPage + 1}">
            <span aria-hidden="true">&raquo;</span>
            <span class="sr-only">Next</span>
          </a>
        </li>
      </ul>
    </nav>
  `;

  // Gắn sự kiện click cho từng nút
  container.querySelectorAll(".page-link").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const page = parseInt(link.getAttribute("data-page"));
      if (!isNaN(page) && page >= 1 && page <= totalPages && page !== currentPage) {
        onPageChange(page);
      }
    });
  });
}
