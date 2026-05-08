(function(){
'use strict';

// ===== STATE =====
const STORAGE_KEY = 'taskflow_data';
const CAT_COLORS = ['#6366f1','#a855f7','#ec4899','#f43f5e','#f59e0b','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#10b981'];
const CAT_ICONS = ['📁','💼','🏠','🛒','📚','💪','🎯','🎨','🔧','❤️','🌟','🚀'];
let state = loadState();
let currentFilter = 'all';
let editingTaskId = null;
let editingCatId = null;
let pendingDeleteId = null;
let selectedTags = [];

function defaultState(){return {tasks:[],categories:[{id:genId(),name:'Work',color:'#3b82f6',icon:'💼'},{id:genId(),name:'Personal',color:'#22c55e',icon:'🏠'},{id:genId(),name:'Shopping',color:'#f59e0b',icon:'🛒'}],theme:'dark'};}
function loadState(){try{const d=localStorage.getItem(STORAGE_KEY);return d?JSON.parse(d):defaultState();}catch(e){return defaultState();}}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
function genId(){return Date.now().toString(36)+Math.random().toString(36).substr(2,6);}

// ===== DOM REFS =====
const $=id=>document.getElementById(id);
const sidebar=$('sidebar'), main=$('main'), taskList=$('taskList'), emptyState=$('emptyState');
const fabBtn=$('fabBtn'), searchInput=$('searchInput'), sortSelect=$('sortSelect');
const taskModalOverlay=$('taskModalOverlay'), modalTitle=$('modalTitle');
const taskTitle=$('taskTitle'), taskDesc=$('taskDesc'), taskPriority=$('taskPriority');
const taskCategory=$('taskCategory'), taskDue=$('taskDue'), taskDueTime=$('taskDueTime');
const tagInput=$('tagInput'), tagChips=$('tagChips'), charCount=$('charCount');
const catModalOverlay=$('catModalOverlay'), catName=$('catName');
const colorPicker=$('colorPicker'), iconPicker=$('iconPicker');
const detailModalOverlay=$('detailModalOverlay');
const confirmOverlay=$('confirmOverlay'), confirmMessage=$('confirmMessage');
const toastContainer=$('toastContainer');
const progressFill=$('progressFill'), progressText=$('progressText'), progressPercent=$('progressPercent');

// ===== INIT =====
function init(){
  document.documentElement.setAttribute('data-theme', state.theme||'dark');
  $('themeLabel').textContent = state.theme==='dark'?'Light Mode':'Dark Mode';
  buildColorPicker();
  buildIconPicker();
  bindEvents();
  renderCategories();
  renderTasks();
  updateStats();
}

// ===== EVENTS =====
function bindEvents(){
  fabBtn.onclick=()=>openTaskModal();
  $('modalClose').onclick=$('cancelModal').onclick=()=>closeModal(taskModalOverlay);
  $('saveTask').onclick=handleSaveTask;
  $('addCategoryBtn').onclick=()=>openCatModal();
  $('catModalClose').onclick=$('cancelCatModal').onclick=()=>closeModal(catModalOverlay);
  $('saveCategory').onclick=handleSaveCategory;
  $('detailModalClose').onclick=()=>closeModal(detailModalOverlay);
  $('detailEdit').onclick=handleDetailEdit;
  $('detailDelete').onclick=handleDetailDelete;
  $('detailToggle').onclick=handleDetailToggle;
  $('confirmCancel').onclick=()=>closeModal(confirmOverlay);
  $('confirmOk').onclick=handleConfirmDelete;
  $('themeToggle').onclick=toggleTheme;
  $('mobileMenuBtn').onclick=()=>sidebar.classList.toggle('open');
  $('sidebarToggle').onclick=()=>sidebar.classList.toggle('open');
  searchInput.oninput=()=>renderTasks();
  sortSelect.onchange=()=>renderTasks();
  taskTitle.oninput=()=>{charCount.textContent=taskTitle.value.length+' / 200';};
  tagInput.onkeydown=handleTagKeydown;

  // Keyboard shortcut
  document.addEventListener('keydown',e=>{
    if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();searchInput.focus();}
    if(e.key==='Escape'){closeAllModals();}
  });

  // Sidebar filter buttons
  document.querySelectorAll('.nav-item[data-filter]').forEach(btn=>{
    btn.onclick=()=>{
      document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter=btn.dataset.filter;
      updateViewTitle();
      renderTasks();
      sidebar.classList.remove('open');
    };
  });

  // Click overlay to close modals
  [taskModalOverlay,catModalOverlay,detailModalOverlay,confirmOverlay].forEach(o=>{
    o.onclick=e=>{if(e.target===o)closeModal(o);};
  });
}

// ===== THEME =====
function toggleTheme(){
  state.theme = state.theme==='dark'?'light':'dark';
  document.documentElement.setAttribute('data-theme',state.theme);
  $('themeLabel').textContent = state.theme==='dark'?'Light Mode':'Dark Mode';
  saveState();
}

// ===== MODALS =====
function openModal(el){el.classList.add('visible');el.setAttribute('aria-hidden','false');}
function closeModal(el){el.classList.remove('visible');el.setAttribute('aria-hidden','true');}
function closeAllModals(){[taskModalOverlay,catModalOverlay,detailModalOverlay,confirmOverlay].forEach(closeModal);}

// ===== TASK MODAL =====
function openTaskModal(task){
  editingTaskId = task?task.id:null;
  modalTitle.textContent = task?'Edit Task':'New Task';
  taskTitle.value = task?task.title:'';
  taskDesc.value = task?task.description:'';
  taskPriority.value = task?task.priority:'medium';
  taskDue.value = task?task.dueDate||'':'';
  taskDueTime.value = task?task.dueTime||'':'';
  selectedTags = task?[...task.tags||[]]:[];
  charCount.textContent = (task?task.title.length:0)+' / 200';
  renderCategorySelect();
  taskCategory.value = task?task.categoryId||'':'';
  renderTagChips();
  openModal(taskModalOverlay);
  setTimeout(()=>taskTitle.focus(),100);
}

function handleSaveTask(){
  const title=taskTitle.value.trim();
  if(!title){toast('Please enter a task title','error');taskTitle.focus();return;}
  if(editingTaskId){
    const t=state.tasks.find(x=>x.id===editingTaskId);
    if(t){Object.assign(t,{title,description:taskDesc.value.trim(),priority:taskPriority.value,categoryId:taskCategory.value,dueDate:taskDue.value,dueTime:taskDueTime.value,tags:selectedTags,updatedAt:Date.now()});}
    toast('Task updated!','success');
  } else {
    state.tasks.unshift({id:genId(),title,description:taskDesc.value.trim(),priority:taskPriority.value,categoryId:taskCategory.value,dueDate:taskDue.value,dueTime:taskDueTime.value,tags:selectedTags,completed:false,createdAt:Date.now(),updatedAt:Date.now()});
    toast('Task created!','success');
  }
  saveState();renderTasks();updateStats();closeModal(taskModalOverlay);
}

// ===== TAGS =====
function handleTagKeydown(e){
  if(e.key==='Enter'){
    e.preventDefault();
    const v=tagInput.value.trim().toLowerCase();
    if(v&&!selectedTags.includes(v)&&selectedTags.length<8){selectedTags.push(v);tagInput.value='';renderTagChips();}
  }
}
function renderTagChips(){
  tagChips.innerHTML=selectedTags.map(t=>`<span class="tag-chip">${t}<button onclick="window._removeTag('${t}')">&times;</button></span>`).join('');
}
window._removeTag=function(t){selectedTags=selectedTags.filter(x=>x!==t);renderTagChips();};

// ===== CATEGORIES =====
function buildColorPicker(){
  colorPicker.innerHTML=CAT_COLORS.map((c,i)=>`<button class="color-swatch${i===0?' active':''}" data-color="${c}" style="background:${c}" onclick="window._pickColor(this)"></button>`).join('');
}
function buildIconPicker(){
  iconPicker.innerHTML=CAT_ICONS.map((ic,i)=>`<button class="icon-option${i===0?' active':''}" data-icon="${ic}" onclick="window._pickIcon(this)">${ic}</button>`).join('');
}
window._pickColor=function(el){colorPicker.querySelectorAll('.color-swatch').forEach(s=>s.classList.remove('active'));el.classList.add('active');};
window._pickIcon=function(el){iconPicker.querySelectorAll('.icon-option').forEach(s=>s.classList.remove('active'));el.classList.add('active');};

function openCatModal(){
  editingCatId=null;catName.value='';
  colorPicker.querySelector('.color-swatch').click();
  iconPicker.querySelector('.icon-option').click();
  openModal(catModalOverlay);catName.focus();
}
function handleSaveCategory(){
  const name=catName.value.trim();
  if(!name){toast('Category name required','error');return;}
  const color=colorPicker.querySelector('.active')?.dataset.color||CAT_COLORS[0];
  const icon=iconPicker.querySelector('.active')?.dataset.icon||CAT_ICONS[0];
  state.categories.push({id:genId(),name,color,icon});
  saveState();renderCategories();renderTasks();updateStats();closeModal(catModalOverlay);
  toast('Category created!','success');
}

function renderCategories(){
  const list=$('categoryList');
  list.innerHTML=state.categories.map(c=>{
    const count=state.tasks.filter(t=>t.categoryId===c.id&&!t.completed).length;
    return `<button class="nav-item" data-filter="cat-${c.id}" onclick="window._filterCat('${c.id}',this)">
      <span class="category-color" style="background:${c.color}"></span>
      ${c.icon} ${c.name}
      <span class="nav-badge">${count}</span>
    </button>`;
  }).join('');
  renderCategorySelect();
}
function renderCategorySelect(){
  taskCategory.innerHTML='<option value="">No Category</option>'+state.categories.map(c=>`<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
}
window._filterCat=function(catId,btn){
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  currentFilter='cat-'+catId;
  updateViewTitle();renderTasks();sidebar.classList.remove('open');
};

// ===== FILTERING & SORTING =====
function getFilteredTasks(){
  let tasks=[...state.tasks];
  const q=searchInput.value.trim().toLowerCase();
  if(q)tasks=tasks.filter(t=>t.title.toLowerCase().includes(q)||t.description?.toLowerCase().includes(q)||t.tags?.some(tg=>tg.includes(q)));
  const today=new Date().toISOString().split('T')[0];
  switch(currentFilter){
    case'today':tasks=tasks.filter(t=>t.dueDate===today);break;
    case'overdue':tasks=tasks.filter(t=>t.dueDate&&t.dueDate<today&&!t.completed);break;
    case'completed':tasks=tasks.filter(t=>t.completed);break;
    case'priority-urgent':tasks=tasks.filter(t=>t.priority==='urgent'&&!t.completed);break;
    case'priority-high':tasks=tasks.filter(t=>t.priority==='high'&&!t.completed);break;
    case'priority-medium':tasks=tasks.filter(t=>t.priority==='medium'&&!t.completed);break;
    case'priority-low':tasks=tasks.filter(t=>t.priority==='low'&&!t.completed);break;
    default:if(currentFilter.startsWith('cat-')){const cid=currentFilter.slice(4);tasks=tasks.filter(t=>t.categoryId===cid);}
  }
  const pMap={urgent:4,high:3,medium:2,low:1};
  const sort=sortSelect.value;
  tasks.sort((a,b)=>{
    switch(sort){
      case'created-desc':return b.createdAt-a.createdAt;
      case'created-asc':return a.createdAt-b.createdAt;
      case'due-asc':return (a.dueDate||'z').localeCompare(b.dueDate||'z');
      case'due-desc':return (b.dueDate||'').localeCompare(a.dueDate||'');
      case'priority-desc':return pMap[b.priority]-pMap[a.priority];
      case'alpha-asc':return a.title.localeCompare(b.title);
      default:return 0;
    }
  });
  return tasks;
}

// ===== RENDER TASKS =====
function renderTasks(){
  const tasks=getFilteredTasks();
  if(!tasks.length){taskList.innerHTML='';emptyState.classList.add('visible');return;}
  emptyState.classList.remove('visible');
  const today=new Date().toISOString().split('T')[0];
  taskList.innerHTML=tasks.map(t=>{
    const cat=state.categories.find(c=>c.id===t.categoryId);
    const isOverdue=t.dueDate&&t.dueDate<today&&!t.completed;
    const dueFmt=t.dueDate?formatDate(t.dueDate):'';
    return `<div class="task-card priority-${t.priority}${t.completed?' completed':''}${isOverdue?' overdue':''}" data-id="${t.id}" role="listitem" draggable="true">
      <div class="task-check${t.completed?' checked':''}" onclick="event.stopPropagation();window._toggleTask('${t.id}')" role="checkbox" aria-checked="${t.completed}" tabindex="0"></div>
      <div class="task-body" onclick="window._showDetail('${t.id}')">
        <div class="task-title">${esc(t.title)}</div>
        <div class="task-meta">
          ${dueFmt?`<span class="task-meta-item${isOverdue?' overdue-label':''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>${dueFmt}${isOverdue?' — Overdue':''}</span>`:''}
          ${cat?`<span class="task-cat-badge" style="background:${cat.color}22;color:${cat.color}">${cat.icon} ${cat.name}</span>`:''}
          ${(t.tags||[]).map(tg=>`<span class="task-tag">#${tg}</span>`).join('')}
        </div>
      </div>
      <div class="task-actions">
        <button class="task-action-btn" onclick="event.stopPropagation();window._editTask('${t.id}')" aria-label="Edit" title="Edit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="task-action-btn delete" onclick="event.stopPropagation();window._deleteTask('${t.id}')" aria-label="Delete" title="Delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>
      </div>
    </div>`;
  }).join('');
  setupDragDrop();
}

// ===== TASK ACTIONS =====
window._toggleTask=function(id){
  const t=state.tasks.find(x=>x.id===id);
  if(t){t.completed=!t.completed;t.updatedAt=Date.now();saveState();renderTasks();updateStats();toast(t.completed?'Task completed! 🎉':'Task reopened','success');}
};
window._editTask=function(id){
  const t=state.tasks.find(x=>x.id===id);
  if(t)openTaskModal(t);
};
window._deleteTask=function(id){
  pendingDeleteId=id;
  confirmMessage.textContent='Are you sure you want to delete this task? This action cannot be undone.';
  openModal(confirmOverlay);
};
function handleConfirmDelete(){
  if(pendingDeleteId){
    state.tasks=state.tasks.filter(t=>t.id!==pendingDeleteId);
    pendingDeleteId=null;saveState();renderTasks();updateStats();closeModal(confirmOverlay);closeModal(detailModalOverlay);
    toast('Task deleted','success');
  }
}

// ===== DETAIL MODAL =====
window._showDetail=function(id){
  const t=state.tasks.find(x=>x.id===id);
  if(!t)return;
  const cat=state.categories.find(c=>c.id===t.categoryId);
  const pColors={urgent:'var(--danger)',high:'var(--warning)',medium:'var(--accent)',low:'var(--success)'};
  const badge=$('detailPriorityBadge');
  badge.textContent=t.priority.toUpperCase();
  badge.style.background=pColors[t.priority]+'22';
  badge.style.color=pColors[t.priority];
  $('detailModalTitle').textContent=t.title;
  const body=$('detailModalBody');
  body.innerHTML=`
    ${t.description?`<div class="detail-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg><div><div class="detail-label">Description</div><div class="detail-value">${esc(t.description)}</div></div></div>`:''}
    ${t.dueDate?`<div class="detail-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg><div><div class="detail-label">Due Date</div><div class="detail-value">${formatDate(t.dueDate)}${t.dueTime?' at '+t.dueTime:''}</div></div></div>`:''}
    ${cat?`<div class="detail-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg><div><div class="detail-label">Category</div><div class="detail-value"><span class="task-cat-badge" style="background:${cat.color}22;color:${cat.color}">${cat.icon} ${cat.name}</span></div></div></div>`:''}
    ${t.tags?.length?`<div class="detail-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg><div><div class="detail-label">Tags</div><div class="detail-value">${t.tags.map(tg=>`<span class="task-tag">#${tg}</span>`).join(' ')}</div></div></div>`:''}
    <div class="detail-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg><div><div class="detail-label">Created</div><div class="detail-value">${new Date(t.createdAt).toLocaleString()}</div></div></div>
  `;
  const toggleBtn=$('detailToggle');
  toggleBtn.textContent=t.completed?'Mark Incomplete':'Mark Complete';
  toggleBtn.className=t.completed?'btn btn-ghost':'btn btn-primary';
  detailModalOverlay._taskId=id;
  openModal(detailModalOverlay);
};
function handleDetailEdit(){const id=detailModalOverlay._taskId;closeModal(detailModalOverlay);window._editTask(id);}
function handleDetailDelete(){const id=detailModalOverlay._taskId;window._deleteTask(id);}
function handleDetailToggle(){const id=detailModalOverlay._taskId;window._toggleTask(id);closeModal(detailModalOverlay);}

// ===== STATS =====
function updateStats(){
  const all=state.tasks.length, done=state.tasks.filter(t=>t.completed).length, pending=all-done;
  const today=new Date().toISOString().split('T')[0];
  const overdue=state.tasks.filter(t=>t.dueDate&&t.dueDate<today&&!t.completed).length;
  const todayCount=state.tasks.filter(t=>t.dueDate===today).length;
  $('countAll').textContent=all;$('countPending').textContent=pending;$('countDone').textContent=done;
  $('badgeAll').textContent=all;$('badgeToday').textContent=todayCount;$('badgeOverdue').textContent=overdue;$('badgeCompleted').textContent=done;
  const pCount=p=>state.tasks.filter(t=>t.priority===p&&!t.completed).length;
  $('badgeUrgent').textContent=pCount('urgent');$('badgeHigh').textContent=pCount('high');
  $('badgeMedium').textContent=pCount('medium');$('badgeLow').textContent=pCount('low');
  const pct=all?Math.round(done/all*100):0;
  progressFill.style.width=pct+'%';progressText.textContent=`${done} of ${all} tasks completed`;progressPercent.textContent=pct+'%';
  $('progressTrack').setAttribute('aria-valuenow',pct);
  renderCategories();
}

// ===== VIEW TITLE =====
function updateViewTitle(){
  const titles={all:'All Tasks',today:'Today',overdue:'Overdue',completed:'Completed','priority-urgent':'Urgent','priority-high':'High Priority','priority-medium':'Medium Priority','priority-low':'Low Priority'};
  if(titles[currentFilter]){$('viewTitle').textContent=titles[currentFilter];$('viewSubtitle').textContent='Manage and track your tasks';}
  else if(currentFilter.startsWith('cat-')){
    const cat=state.categories.find(c=>c.id===currentFilter.slice(4));
    if(cat){$('viewTitle').textContent=cat.icon+' '+cat.name;$('viewSubtitle').textContent='Category tasks';}
  }
}

// ===== DRAG & DROP =====
function setupDragDrop(){
  const cards=taskList.querySelectorAll('.task-card');
  cards.forEach(card=>{
    card.addEventListener('dragstart',e=>{card.classList.add('dragging');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',card.dataset.id);});
    card.addEventListener('dragend',()=>card.classList.remove('dragging'));
    card.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='move';const dragging=taskList.querySelector('.dragging');if(dragging&&dragging!==card){const rect=card.getBoundingClientRect();const mid=rect.top+rect.height/2;if(e.clientY<mid)taskList.insertBefore(dragging,card);else taskList.insertBefore(dragging,card.nextSibling);}});
    card.addEventListener('drop',e=>{
      e.preventDefault();
      const ids=[...taskList.querySelectorAll('.task-card')].map(c=>c.dataset.id);
      const reordered=ids.map(id=>state.tasks.find(t=>t.id===id)).filter(Boolean);
      const remaining=state.tasks.filter(t=>!ids.includes(t.id));
      state.tasks=[...reordered,...remaining];
      saveState();
    });
  });
}

// ===== UTILS =====
function esc(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML;}
function formatDate(ds){const d=new Date(ds+'T00:00:00');return d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});}
function toast(msg,type=''){
  const t=document.createElement('div');t.className='toast'+(type?' '+type:'');t.textContent=msg;
  toastContainer.appendChild(t);setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),300);},2500);
}

// ===== START =====
document.addEventListener('DOMContentLoaded',init);
})();
