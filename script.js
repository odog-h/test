// ===== 현관앞키친 대시보드 =====
// 순수 바닐라 JS · 외부 라이브러리 없음 · 데모용 샘플 데이터

// ---------- 기간별 가짜 데이터 ----------
const DATA = {
  today: {
    stats: { orders: 142, revenue: 2_184_000, customers: 118, avg: 15_380 },
    deltas: { orders: 12.4, revenue: 8.1, customers: 5.2, avg: -2.3 },
    chart: [4, 9, 22, 31, 18, 12, 14, 28, 24, 10], // 시간대별 주문
    chartLabels: ["10","11","12","13","14","15","16","17","18","19"],
  },
  week: {
    stats: { orders: 968, revenue: 14_820_000, customers: 642, avg: 15_310 },
    deltas: { orders: 6.7, revenue: 9.4, customers: 3.1, avg: 1.8 },
    chart: [120, 98, 110, 142, 168, 195, 135],
    chartLabels: ["월","화","수","목","금","토","일"],
  },
  month: {
    stats: { orders: 4_125, revenue: 63_400_000, customers: 2_480, avg: 15_370 },
    deltas: { orders: 15.2, revenue: 18.9, customers: 11.0, avg: 3.2 },
    chart: [820, 910, 1180, 1215],
    chartLabels: ["1주","2주","3주","4주"],
  },
};

const TOP_MENUS = [
  { name: "트러플 크림 파스타", count: 312 },
  { name: "수제 비프 버거", count: 274 },
  { name: "마르게리타 피자", count: 251 },
  { name: "치킨 시저 샐러드", count: 188 },
  { name: "감바스 알 아히요", count: 143 },
];

const STATUS = {
  done:       { label: "완료",   cls: "done" },
  cooking:    { label: "조리중", cls: "cooking" },
  delivering: { label: "배달중", cls: "delivering" },
  canceled:   { label: "취소",   cls: "canceled" },
};

const ORDERS = [
  { id: "20240624-1042", name: "김민준", menu: "트러플 크림 파스타", amount: 18900, status: "delivering", time: "18:42" },
  { id: "20240624-1041", name: "이서연", menu: "수제 비프 버거 외 2", amount: 32400, status: "cooking",    time: "18:39" },
  { id: "20240624-1040", name: "박도윤", menu: "마르게리타 피자",     amount: 21000, status: "done",       time: "18:31" },
  { id: "20240624-1039", name: "최지우", menu: "치킨 시저 샐러드",     amount: 13500, status: "done",       time: "18:24" },
  { id: "20240624-1038", name: "정하은", menu: "감바스 알 아히요", amount: 16800, status: "canceled",   time: "18:20" },
  { id: "20240624-1037", name: "강서준", menu: "트러플 크림 파스타 외 1", amount: 27300, status: "done",   time: "18:11" },
  { id: "20240624-1036", name: "윤채원", menu: "수제 비프 버거",       amount: 14900, status: "delivering", time: "18:03" },
  { id: "20240624-1035", name: "임시우", menu: "마르게리타 피자 외 3", amount: 41200, status: "cooking",    time: "17:55" },
];

// ---------- 유틸 ----------
const won = (n) => "₩" + n.toLocaleString("ko-KR");
const $ = (sel) => document.querySelector(sel);

// ---------- 날짜 & 시계 ----------
function initDate() {
  const now = new Date();
  const opts = { year: "numeric", month: "long", day: "numeric", weekday: "long" };
  $("#todayDate").textContent = now.toLocaleDateString("ko-KR", opts);
}
function tickClock() {
  const now = new Date();
  $("#clock").textContent = now.toLocaleTimeString("ko-KR", { hour12: false });
}

// ---------- 통계 카드 ----------
function renderCards(period) {
  const d = DATA[period];
  const cards = [
    { icon: "🧾", label: "총 주문",   value: d.stats.orders.toLocaleString(), delta: d.deltas.orders },
    { icon: "💰", label: "매출",      value: won(d.stats.revenue),            delta: d.deltas.revenue },
    { icon: "👥", label: "방문 고객", value: d.stats.customers.toLocaleString(), delta: d.deltas.customers },
    { icon: "📊", label: "객단가",    value: won(d.stats.avg),                delta: d.deltas.avg },
  ];
  $("#statCards").innerHTML = cards.map((c) => {
    const up = c.delta >= 0;
    const arrow = up ? "▲" : "▼";
    return `
      <div class="card">
        <div class="card-top">
          <div class="card-icon">${c.icon}</div>
          <span class="card-delta ${up ? "delta-up" : "delta-down"}">${arrow} ${Math.abs(c.delta)}%</span>
        </div>
        <p class="card-label">${c.label}</p>
        <p class="card-value">${c.value}</p>
        <p class="card-delta ${up ? "delta-up" : "delta-down"}">전 기간 대비</p>
      </div>`;
  }).join("");
}

// ---------- 차트 ----------
function renderChart(period) {
  const d = DATA[period];
  const max = Math.max(...d.chart);
  $("#chart").innerHTML = d.chart.map((v, i) => {
    const h = Math.round((v / max) * 100);
    return `
      <div class="bar-col">
        <div class="bar" style="height:0" data-h="${h}" data-val="${v}"></div>
        <span class="bar-label">${d.chartLabels[i]}</span>
      </div>`;
  }).join("");
  // 애니메이션: 다음 프레임에 높이 적용
  requestAnimationFrame(() => {
    document.querySelectorAll(".bar").forEach((b) => {
      b.style.height = b.dataset.h + "%";
    });
  });
  const total = d.chart.reduce((a, b) => a + b, 0);
  $("#chartTotal").textContent = "합계 " + total.toLocaleString() + "건";
}

// ---------- 인기 메뉴 ----------
function renderMenus() {
  const max = Math.max(...TOP_MENUS.map((m) => m.count));
  $("#menuList").innerHTML = TOP_MENUS.map((m, i) => `
    <li class="menu-row">
      <span class="menu-rank ${i === 0 ? "top" : ""}">${i + 1}</span>
      <div class="menu-info">
        <p class="menu-name">${m.name}</p>
        <div class="menu-bar-track"><div class="menu-bar-fill" style="width:${(m.count / max) * 100}%"></div></div>
      </div>
      <span class="menu-count">${m.count}건</span>
    </li>`).join("");
}

// ---------- 주문 테이블 ----------
function renderOrders(filter = "") {
  const q = filter.trim().toLowerCase();
  const rows = ORDERS.filter((o) =>
    !q || o.id.includes(q) || o.name.toLowerCase().includes(q) || o.menu.toLowerCase().includes(q)
  );
  const body = $("#orderBody");
  if (rows.length === 0) {
    body.innerHTML = `<tr class="empty-row"><td colspan="6">검색 결과가 없습니다 🍽️</td></tr>`;
    return;
  }
  body.innerHTML = rows.map((o) => {
    const s = STATUS[o.status];
    return `
      <tr>
        <td class="order-id">#${o.id}</td>
        <td>${o.name}</td>
        <td>${o.menu}</td>
        <td class="amount">${won(o.amount)}</td>
        <td><span class="badge ${s.cls}">${s.label}</span></td>
        <td>${o.time}</td>
      </tr>`;
  }).join("");
}

// ---------- 기간 전환 ----------
function setPeriod(period) {
  renderCards(period);
  renderChart(period);
}

// ---------- 초기화 ----------
function init() {
  initDate();
  tickClock();
  setInterval(tickClock, 1000);

  setPeriod("today");
  renderMenus();
  renderOrders();

  // 기간 토글
  $("#periodToggle").addEventListener("click", (e) => {
    const btn = e.target.closest(".period-btn");
    if (!btn) return;
    document.querySelectorAll(".period-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    setPeriod(btn.dataset.period);
  });

  // 검색
  $("#search").addEventListener("input", (e) => renderOrders(e.target.value));
}

document.addEventListener("DOMContentLoaded", init);
