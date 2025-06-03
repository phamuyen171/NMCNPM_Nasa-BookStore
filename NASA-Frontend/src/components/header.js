export function renderHeader() {
    return `
    <header class="banner text-center">
      <img src="../../assets/images/banner.svg" alt="NASA Banner" class="img-fluid banner-image w-100"/>
    </header>

    <div class="nav-bar header-row d-flex align-items-center justify-content-between px-4 py-2 shadow-sm">
      <div class="d-flex align-items-center gap-3">
        <!-- Logo -->
        <img src="../../assets/images/logo.svg" alt="Logo" style="height: 40px;" />

        <!-- Search -->
        <div class="search-box position-relative">
          <i class="fa-light fa-magnifying-glass" style="color: #4365b4;"></i>
          <input type="text" placeholder="Tìm kiếm..." style="padding-left: 30px; border: none; border-bottom: 1px solid #ccc; outline: none;" />
        </div>

        <!-- Menu Items -->
        <div class="d-flex align-items-center gap-4 ps-4">
          <div class="d-flex align-items-center gap-1 text-dark">
            <i class="fa-solid fa-book" style="color: #4365b4;"></i> <span>Sách</span>
          </div>
          <div class="d-flex align-items-center gap-1 text-dark">
            <i class="fa-solid fa-money-bills" style="color: #4365b4;"></i> <span>Hoá đơn</span>
          </div>
          <div class="d-flex align-items-center gap-1 text-dark">
            <i class="fa-solid fa-person" style="color: #4365b4;"></i> <span>Khách hàng</span>
          </div>
          <div class="d-flex align-items-center gap-1 text-dark">
            <i class="fa-solid fa-clipboard-user" style="color: #4365b4;"></i> <span>Nhân viên</span>
          </div>
        </div>
      </div>

      <!-- Right icons -->
      <div class="d-flex align-items-center gap-3">
        <i class="fa-solid fa-bell" style="color: #4365b4;"></i>
        <i class="fa-solid fa-user" style="color: #4365b4;"></i>
      </div>
    </div>
    `
}