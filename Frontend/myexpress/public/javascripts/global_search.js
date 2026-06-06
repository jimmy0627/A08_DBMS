(function() {
  const searchInput = document.querySelector('.header-search input');
  if (!searchInput) return;

  // 1. 建立搜尋結果下拉容器
  const dropdown = document.createElement('div');
  dropdown.className = 'search-results-dropdown';
  searchInput.parentElement.appendChild(dropdown);

  let debounceTimer;

  // 2. 監聽輸入事件 (防抖處理)
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    clearTimeout(debounceTimer);
    
    if (query.length < 1) {
      dropdown.classList.remove('active');
      return;
    }

    debounceTimer = setTimeout(() => performSearch(query), 300);
  });

  // 3. 監聽 Enter 鍵直接進入搜尋結果頁 (選做，若有專屬搜尋頁的話)
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        window.location.href = `/search_results.html?q=${encodeURIComponent(query)}`;
      }
    }
  });

  // 4. 點擊外部關閉下拉選單
  document.addEventListener('click', (e) => {
    if (!searchInput.parentElement.contains(e.target)) {
      dropdown.classList.remove('active');
    }
  });

  // 5. 執行搜尋 API 請求
  async function performSearch(query) {
    try {
      const response = await fetch(`/api/search/?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        renderResults(data.results);
      }
    } catch (err) {
      console.error('Global Search Error:', err);
    }
  }

  // 6. 渲染結果清單
  function renderResults(results) {
    if (results.length === 0) {
      dropdown.innerHTML = '<div class="search-no-results">查無相關機密檔案 // NO_RECORD_FOUND</div>';
    } else {
      dropdown.innerHTML = results.map(item => `
        <a href="${item.url}" class="search-result-item" data-type="${item.type}">
          <div class="item-icon">${getTypeLabel(item.type)}</div>
          <div class="item-info">
            <span class="item-title">${item.title}</span>
            <span class="item-subtitle">${item.subtitle}</span>
          </div>
          <div class="item-type-tag">${item.type}</div>
        </a>
      `).join('');
    }
    dropdown.classList.add('active');
  }

  // 7. 輔助函數：取得類型標籤
  function getTypeLabel(type) {
    switch(type) {
      case 'operator': return 'OPR';
      case 'guide': return 'LOG';
      case 'stage': return 'STG';
      default: return 'SRC';
    }
  }
})();
