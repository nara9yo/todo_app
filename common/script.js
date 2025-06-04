// =======================
// DOM 요소 및 상태 변수 선언
// =======================

// 체크된 항목 삭제 버튼
const removeCheckedBtn = document.getElementById("remove-checked-btn");
// 할 일 목록을 표시할 리스트 영역
const list = document.getElementById("list");
// 새로운 Todo 추가 버튼
const createBtn = document.getElementById("create-btn");
// 검색 입력창
const searchInput = document.getElementById("search-input");

// 할 일 목록 데이터 배열
let todos = [];

// =======================
// 이벤트 핸들러 등록
// =======================

// '새로운 Todo 추가하기' 버튼 클릭 시
if (createBtn) {
  createBtn.addEventListener("click", createNewTodo);
}

// 검색 입력창 입력 시
if (searchInput) {
  searchInput.addEventListener("input", function () {
    displayTodos(this.value);
  });
}

// 체크된 항목 일괄 삭제 버튼 클릭 시
if (removeCheckedBtn) {
  removeCheckedBtn.addEventListener("click", () => {
    const checkedCount = todos.filter((item) => item.complete).length;
    if (checkedCount === 0) return;
    const confirmMsg = `정말로 체크된 ${checkedCount}개의 항목을 삭제하시겠습니까?`;
    if (window.confirm(confirmMsg)) {
      todos = todos.filter((item) => !item.complete);
      saveToLocalStorage();
      displayTodos(searchInput?.value || "");
      updateRemoveCheckedBtn();
    }
  });
}

// =======================
// 주요 함수 정의
// =======================

/**
 * 새로운 Todo 생성 및 리스트에 추가
 */
function createNewTodo() {
  const item = {
    id: new Date().getTime(), // 고유 id (현재 시간)
    text: "", // 내용
    complete: false, // 완료 여부
  };

  // 배열 맨 앞에 추가
  todos.unshift(item);

  // Todo 요소 생성 및 리스트에 추가
  const { itemEl, inputEl } = createTodoElement(item);
  list.prepend(itemEl);

  // 입력창 활성화 및 포커스
  inputEl.removeAttribute("disabled");
  inputEl.focus();

  // 저장
  saveToLocalStorage();
}

/**
 * Todo 아이템 DOM 요소 생성 및 이벤트 바인딩
 */
function createTodoElement(item) {
  const itemEl = document.createElement("div");
  itemEl.classList.add("item");

  // 드래그 가능하게 설정
  itemEl.setAttribute("draggable", "true");
  itemEl.dataset.id = item.id;

  // 체크박스 생성
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = item.complete;

  // 완료된 항목 스타일 적용
  if (item.complete) {
    itemEl.classList.add("complete");
  }

  // 텍스트 입력창 생성
  const inputEl = document.createElement("input");
  inputEl.type = "text";
  inputEl.value = item.text;
  inputEl.setAttribute("disabled", "");

  // 액션 버튼 영역 생성
  const actionsEl = document.createElement("div");
  actionsEl.classList.add("actions");

  // 수정 버튼 (Font Awesome)
  const editBtnEl = document.createElement("button");
  editBtnEl.classList.add("fa-solid", "fa-pen-to-square", "edit-btn");
  editBtnEl.setAttribute("title", "Edit");

  // 삭제 버튼 (Font Awesome)
  const removeBtnEl = document.createElement("button");
  removeBtnEl.classList.add("fa-solid", "fa-circle-xmark", "remove-btn");
  removeBtnEl.setAttribute("title", "Remove");

  // 액션 버튼 추가
  actionsEl.append(editBtnEl, removeBtnEl);

  // Todo 요소에 체크박스, 입력창, 액션 버튼 추가
  itemEl.append(checkbox, inputEl, actionsEl);

  // 드래그 힌트(Tip) 추가
  /*
  const dragTip = document.createElement("div");
  dragTip.className = "drag-tip";
  dragTip.textContent = "드래그해서 순서를 변경할 수 있어요";
  itemEl.appendChild(dragTip);

  // 1초간만 드래그 팁 표시
  itemEl.addEventListener("mouseenter", () => {
    dragTip.classList.add("show");
    clearTimeout(dragTip._hideTimer);
    dragTip._hideTimer = setTimeout(() => {
      dragTip.classList.remove("show");
    }, 1000);
  });
  itemEl.addEventListener("mouseleave", () => {
    dragTip.classList.remove("show");
    clearTimeout(dragTip._hideTimer);
  });
  */

  // =======================
  // 이벤트 바인딩
  // =======================

  // 입력창 더블클릭 시 입력창 활성화 및 포커스
  inputEl.addEventListener("dblclick", () => {
    inputEl.removeAttribute("disabled");
    inputEl.focus();
  });

  // 체크박스 변경 시 완료 상태 토글
  checkbox.addEventListener("change", () => {
    item.complete = checkbox.checked;
    if (item.complete) {
      itemEl.classList.add("complete");
    } else {
      itemEl.classList.remove("complete");
    }
    saveToLocalStorage();
    updateRemoveCheckedBtn();
  });

  // 입력창 포커스 시 드래그 비활성화
  inputEl.addEventListener("focus", () => {
    if (inputEl.value.trim() === "") {
      inputEl.placeholder = "Todo content goes here";
    }
    itemEl.setAttribute("draggable", "false");
  });

  // 입력창 포커스 해제 시 드래그 다시 활성화
  inputEl.addEventListener("blur", () => {
    inputEl.setAttribute("disabled", "");
    inputEl.placeholder = "";
    itemEl.setAttribute("draggable", "true");
    saveToLocalStorage();
  });

  // 입력창 내용 변경 시 텍스트 반영
  inputEl.addEventListener("input", () => {
    item.text = inputEl.value;
  });

  // 엔터키 입력 시 입력 완료(blur 처리)
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      inputEl.blur();
    }
  });

  // 수정 버튼 클릭 시 입력창 활성화 및 포커스
  editBtnEl.addEventListener("click", () => {
    inputEl.removeAttribute("disabled");
    inputEl.focus();
  });

  // 삭제 버튼 클릭 시 Todo 삭제
  removeBtnEl.addEventListener("click", () => {
    todos = todos.filter((t) => t.id != item.id);
    itemEl.remove();
    saveToLocalStorage();
    updateRemoveCheckedBtn();
  });

  // ===== 드래그&드롭 이벤트 =====
  itemEl.addEventListener("dragstart", (e) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", item.id);
    itemEl.classList.add("dragging");
  });

  itemEl.addEventListener("dragend", () => {
    itemEl.classList.remove("dragging");
  });

  itemEl.addEventListener("dragover", (e) => {
    e.preventDefault();
    itemEl.classList.add("drag-over");
  });

  itemEl.addEventListener("dragleave", () => {
    itemEl.classList.remove("drag-over");
  });

  itemEl.addEventListener("drop", (e) => {
    e.preventDefault();
    itemEl.classList.remove("drag-over");
    const draggedId = e.dataTransfer.getData("text/plain");
    if (draggedId === String(item.id)) return;

    // 순서 변경
    const fromIdx = todos.findIndex((t) => String(t.id) === draggedId);
    const toIdx = todos.findIndex((t) => t.id === item.id);
    if (fromIdx === -1 || toIdx === -1) return;

    // 배열에서 순서 이동
    const [dragged] = todos.splice(fromIdx, 1);
    todos.splice(toIdx, 0, dragged);

    saveToLocalStorage();
    displayTodos(searchInput?.value || "");
  });

  // 생성한 요소와 버튼 반환
  return { itemEl, inputEl, editBtnEl, removeBtnEl };
}

/**
 * Todo 목록을 화면에 표시 (검색어 지원)
 */
function displayTodos(search = "") {
  // loadFromLocalStorage();  // 이 줄을 삭제 또는 주석처리

  // 리스트 초기화
  list.innerHTML = "";

  // 검색어가 있으면 필터링
  const filtered = search
    ? todos.filter((item) =>
        item.text.toLowerCase().includes(search.toLowerCase())
      )
    : todos;

  // 필터링된 목록을 화면에 추가
  for (let i = 0; i < filtered.length; i++) {
    const item = filtered[i];
    const { itemEl } = createTodoElement(item);
    list.append(itemEl);
  }
  updateRemoveCheckedBtn();
}

/**
 * Todo 목록을 로컬스토리지에 저장
 */
function saveToLocalStorage() {
  const data = JSON.stringify(todos);
  localStorage.setItem("my_todos", data);
}

/**
 * 로컬스토리지에서 Todo 목록 불러오기
 */
function loadFromLocalStorage() {
  const data = localStorage.getItem("my_todos");
  if (data) {
    todos = JSON.parse(data);
  }
}

/**
 * 체크된 항목이 있으면 버튼 표시, 없으면 숨김
 */
function updateRemoveCheckedBtn() {
  if (!removeCheckedBtn) return;
  const hasChecked = todos.some((item) => item.complete);
  if (hasChecked) {
    removeCheckedBtn.classList.remove("hide");
  } else {
    removeCheckedBtn.classList.add("hide");
  }
}

// =======================
// 초기화
// =======================

// 최초 진입 시에만 로컬스토리지에서 불러오기
loadFromLocalStorage();
displayTodos();
updateRemoveCheckedBtn();
