const ADMIN_DEFAULT_USER = "fmgambino";
const ADMIN_DEFAULT_PASS = "Jamboree0342$$";
const PERMISSIONS = ["dashboard", "pedidos", "usuarios", "roles", "perfil", "exportar", "eliminar", "editar_estado"];
const STATUS_OPTIONS = ["Pendiente", "En preparación", "Despachado", "Entregado", "Cancelado"];
let db = null;
let state = { user:null, orders:[], users:[], roles:[], page:1, pageSize:10, theme:localStorage.getItem('admin_theme')||'dark' };

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const money = n => new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(Number(n||0));
const nowAR = () => new Date().toLocaleString('es-AR');
const icon = name => ({view:'<svg viewBox="0 0 24 24"><path d="M12 5c5 0 9 7 9 7s-4 7-9 7-9-7-9-7 4-7 9-7Zm0 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/></svg>',edit:'<svg viewBox="0 0 24 24"><path d="M4 17.2V20h2.8L17.6 9.2l-2.8-2.8L4 17.2ZM19.7 7.1c.4-.4.4-1 0-1.4l-1.4-1.4a1 1 0 0 0-1.4 0l-1.1 1.1 2.8 2.8 1.1-1.1Z"/></svg>',del:'<svg viewBox="0 0 24 24"><path d="M6 7h12l-1 14H7L6 7Zm3-4h6l1 2h4v2H4V5h4l1-2Z"/></svg>'}[name]||'');

document.addEventListener('DOMContentLoaded', init);

async function init(){
  applyTheme(); initClients(); bindBaseEvents(); await ensureLocalSeed();
  const session = JSON.parse(localStorage.getItem('admin_session')||'null');
  if(session?.username){ state.user=session; await enterApp(); }
}

function initClients(){
  if(window.emailjs && STORE_CONFIG.EMAILJS_PUBLIC_KEY && !String(STORE_CONFIG.EMAILJS_PUBLIC_KEY).includes('PEGAR_')) emailjs.init({publicKey:STORE_CONFIG.EMAILJS_PUBLIC_KEY});
  if(STORE_CONFIG.SUPABASE_ENABLED && window.supabase && STORE_CONFIG.SUPABASE_URL && !String(STORE_CONFIG.SUPABASE_URL).includes('PEGAR_')) db = window.supabase.createClient(STORE_CONFIG.SUPABASE_URL, STORE_CONFIG.SUPABASE_ANON_KEY);
}

function bindBaseEvents(){
  $('#loginForm')?.addEventListener('submit', login);
  $('#logoutBtn')?.addEventListener('click', () => { localStorage.removeItem('admin_session'); location.reload(); });
  $('#collapseBtn')?.addEventListener('click', () => $('#sidebar').classList.toggle(innerWidth < 900 ? 'open':'collapsed'));
  $('#themeBtn')?.addEventListener('click', () => { state.theme = state.theme === 'dark' ? 'light':'dark'; localStorage.setItem('admin_theme',state.theme); applyTheme(); });
  $('#fullscreenBtn')?.addEventListener('click', () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());
  $('#avatarBtn')?.addEventListener('click', () => $('#avatarFile').click());
  $('#avatarFile')?.addEventListener('change', handleAvatarFile);
  $$('.nav-btn').forEach(b=>b.addEventListener('click',()=>openModule(b.dataset.module)));
  $('#pageSizeSelect')?.addEventListener('change', e=>{state.pageSize=Number(e.target.value);state.page=1;renderOrders();});
  $('#prevPageBtn')?.addEventListener('click',()=>{state.page=Math.max(1,state.page-1);renderOrders();});
  $('#nextPageBtn')?.addEventListener('click',()=>{state.page++;renderOrders();});
  $('#selectAllOrders')?.addEventListener('change', e=>$$('.order-check').forEach(c=>c.checked=e.target.checked));
  $('#exportCsvBtn')?.addEventListener('click', exportCSV);
  $('#exportPdfBtn')?.addEventListener('click', exportPDF);
  $('#bulkDeleteBtn')?.addEventListener('click', bulkDeleteOrders);
  $('#bulkStatusBtn')?.addEventListener('click', bulkChangeStatus);
  $('#newUserBtn')?.addEventListener('click', () => userModal());
  $('#newRoleBtn')?.addEventListener('click', () => roleModal());
  $('#profileForm')?.addEventListener('submit', saveProfile);
}

function applyTheme(){ document.documentElement.classList.toggle('light', state.theme==='light'); }
async function sha256(text){ const b=await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)); return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join(''); }
async function ensureLocalSeed(){
  if(!localStorage.getItem('admin_users')){
    localStorage.setItem('admin_users', JSON.stringify([{id:crypto.randomUUID(),username:ADMIN_DEFAULT_USER,name:'Ing. Fernando M. Gambino',email:STORE_CONFIG.SELLER_EMAIL,role:'SuperAdmin',status:'Activo',photo:'https://i.ibb.co/7K8d4Tj/user-avatar.png',password_hash:await sha256(ADMIN_DEFAULT_PASS)}]));
  }
  if(!localStorage.getItem('admin_roles')) localStorage.setItem('admin_roles', JSON.stringify([{id:crypto.randomUUID(),name:'SuperAdmin',permissions:PERMISSIONS},{id:crypto.randomUUID(),name:'Operador',permissions:['dashboard','pedidos','perfil']}]));
}

async function login(e){
  e.preventDefault(); const username=$('#loginUser').value.trim(); const pass=$('#loginPass').value;
  const passHash=await sha256(pass);
  let user=null;
  if(db){ const {data,error}=await db.from('admin_users').select('*').eq('username',username).eq('password_hash',passHash).maybeSingle(); if(!error) user=data; }
  if(!user){ user=(JSON.parse(localStorage.getItem('admin_users')||'[]')).find(u=>u.username===username && u.password_hash===passHash); }
  if(!user) return Swal.fire('Acceso denegado','Usuario o contraseña incorrectos.','error');
  state.user={id:user.id,username:user.username,name:user.name,email:user.email,role:user.role,photo:user.photo||'https://i.ibb.co/7K8d4Tj/user-avatar.png'};
  localStorage.setItem('admin_session', JSON.stringify(state.user)); await enterApp();
}

async function enterApp(){ $('#loginView').classList.add('hidden'); $('#appView').classList.remove('hidden'); $('#profileAvatar').src=state.user.photo||$('#profileAvatar').src; await loadAll(); openModule('dashboard'); }
async function loadAll(){ await Promise.all([loadOrders(),loadUsers(),loadRoles()]); renderDashboard(); renderOrders(); renderUsers(); renderRoles(); fillProfile(); }
async function loadOrders(){
  if(db){ const {data,error}=await db.from('orders').select('*').order('created_at',{ascending:false}); if(!error){state.orders=data||[];return;} console.warn(error); }
  state.orders = JSON.parse(localStorage.getItem('admin_orders')||'[]');
}
async function loadUsers(){
  if(db){ const {data,error}=await db.from('admin_users').select('*').order('created_at',{ascending:false}); if(!error){state.users=data||[];return;} }
  state.users=JSON.parse(localStorage.getItem('admin_users')||'[]');
}
async function loadRoles(){
  if(db){ const {data,error}=await db.from('admin_roles').select('*').order('created_at',{ascending:false}); if(!error){state.roles=data||[];return;} }
  state.roles=JSON.parse(localStorage.getItem('admin_roles')||'[]');
}
function saveLocal(){ localStorage.setItem('admin_orders',JSON.stringify(state.orders)); localStorage.setItem('admin_users',JSON.stringify(state.users)); localStorage.setItem('admin_roles',JSON.stringify(state.roles)); }

function openModule(name){
  const titles={dashboard:['Dashboard','Resumen general de ventas y pedidos.'],orders:['Pedidos','Gestión operativa de órdenes, estados y seguimiento.'],users:['Usuarios','Registro de usuarios del panel.'],roles:['Roles y Permisos','Perfiles y permisos del backoffice.'],profile:['Mi Perfil','Datos personales, foto y contraseña.']};
  $$('.module').forEach(m=>m.classList.remove('active')); $(`#${name}Module`)?.classList.add('active');
  $$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.module===name));
  $('#moduleTitle').textContent=titles[name][0]; $('#moduleSubtitle').textContent=titles[name][1];
  if(innerWidth<900) $('#sidebar').classList.remove('open');
}

function renderDashboard(){
  $('#statTotal').textContent=state.orders.length;
  $('#statMp').textContent=state.orders.filter(o=>o.payment_method==='mercadopago').length;
  $('#statTransfer').textContent=state.orders.filter(o=>o.payment_method==='transferencia').length;
  $('#statPending').textContent=state.orders.filter(o=>(o.order_status||'Pendiente')==='Pendiente').length;
  $('#recentOrdersBody').innerHTML=state.orders.slice(0,6).map(o=>`<tr><td>${o.order_id}</td><td>${o.customer_name||''}</td><td>${o.payment_label||o.payment_method||''}</td><td>${badge(o.order_status)}</td><td>${money(o.total)}</td></tr>`).join('')||'<tr><td colspan="5">Sin pedidos.</td></tr>';
}
function badge(v){ const c=(v||'Pendiente').toLowerCase().includes('pend')?'pending':((v||'').toLowerCase().includes('entreg')?'done':''); return `<span class="badge ${c}">${v||'Pendiente'}</span>`; }
function renderOrders(){
  const totalPages=Math.max(1, Math.ceil(state.orders.length/state.pageSize)); state.page=Math.min(state.page,totalPages);
  const start=(state.page-1)*state.pageSize; const rows=state.orders.slice(start,start+state.pageSize);
  $('#ordersBody').innerHTML=rows.map(o=>`<tr><td><input class="order-check" type="checkbox" value="${o.id||o.order_id}"></td><td><strong>${o.order_id}</strong></td><td>${o.customer_name||''}</td><td>${o.customer_email||''}</td><td>${o.payment_label||o.payment_method||''}</td><td>${badge(o.order_status)}</td><td>${o.tracking_number||'-'}</td><td>${money(o.total)}</td><td>${formatDate(o.created_at)||o.order_date||''}</td><td><div class="row-actions"><button class="mini-btn" onclick="viewOrder('${o.id||o.order_id}')">${icon('view')}</button><button class="mini-btn" onclick="editOrder('${o.id||o.order_id}')">${icon('edit')}</button><button class="mini-btn" onclick="deleteOrder('${o.id||o.order_id}')">${icon('del')}</button></div></td></tr>`).join('')||'<tr><td colspan="10">Sin pedidos.</td></tr>';
  $('#pageInfo').textContent=`Página ${state.page} de ${totalPages}`;
}
function formatDate(v){ if(!v) return ''; try{return new Date(v).toLocaleString('es-AR')}catch{return v} }
function findOrder(id){ return state.orders.find(o=>(o.id||o.order_id)==id); }
function selectedOrderIds(){ return $$('.order-check:checked').map(x=>x.value); }

window.viewOrder=(id)=>{ const o=findOrder(id); if(!o)return; Swal.fire({title:`Pedido ${o.order_id}`,html:`<div style="text-align:left"><p><b>Comprador:</b> ${o.customer_name}</p><p><b>Email:</b> ${o.customer_email}</p><p><b>WhatsApp:</b> ${o.customer_whatsapp||''}</p><p><b>Dirección:</b> ${o.customer_address||''}, ${o.customer_city||''}, ${o.customer_province||''}</p><p><b>Pago:</b> ${o.payment_label||o.payment_method}</p><p><b>Estado:</b> ${o.order_status||'Pendiente'}</p><p><b>Seguimiento:</b> ${o.tracking_number||'-'}</p><p><b>Total:</b> ${money(o.total)}</p></div>`,width:650}); };
window.editOrder=async(id)=>{ const o=findOrder(id); if(!o)return; const options=STATUS_OPTIONS.map(s=>`<option ${s===(o.order_status||'Pendiente')?'selected':''}>${s}</option>`).join(''); const {value, isConfirmed}=await Swal.fire({title:`Editar ${o.order_id}`,html:`<div class="form-grid" style="text-align:left"><label>Estado<select id="swalStatus">${options}</select></label><label>Número Correo Argentino<input id="swalTrack" value="${o.tracking_number||''}"></label><label>URL seguimiento<input id="swalTrackUrl" value="${o.tracking_url||''}" placeholder="https://www.correoargentino.com.ar/..." ></label><label>Mensaje al cliente<textarea id="swalMsg" rows="4">Tu pedido ${o.order_id} fue actualizado.</textarea></label><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="swalEmail" checked> Enviar email al comprador</label></div>`,focusConfirm:false,showCancelButton:true,confirmButtonText:'Guardar',preConfirm:()=>({status:$('#swalStatus').value,tracking_number:$('#swalTrack').value,tracking_url:$('#swalTrackUrl').value,msg:$('#swalMsg').value,send:$('#swalEmail').checked})}); if(!isConfirmed)return; await updateOrder(o,value); };
async function updateOrder(o, patch){
  const updated={...o, order_status:patch.status, tracking_number:patch.tracking_number, tracking_url:patch.tracking_url, updated_at:new Date().toISOString()};
  if(db && o.id){ const {error}=await db.from('orders').update({order_status:updated.order_status,tracking_number:updated.tracking_number,tracking_url:updated.tracking_url,updated_at:updated.updated_at}).eq('id',o.id); if(error) return Swal.fire('Error',error.message,'error'); }
  state.orders=state.orders.map(x=>(x.id||x.order_id)===(o.id||o.order_id)?updated:x); saveLocal(); renderDashboard(); renderOrders();
  if(patch.send) await sendStatusEmail(updated, patch.msg);
  Swal.fire('Listo','Pedido actualizado correctamente.','success');
}
window.deleteOrder=async(id)=>{ if(!(await confirmDanger('Eliminar pedido','Esta acción no se puede deshacer.')))return; const o=findOrder(id); if(db && o?.id) await db.from('orders').delete().eq('id',o.id); state.orders=state.orders.filter(x=>(x.id||x.order_id)!=id); saveLocal(); renderDashboard(); renderOrders(); };
async function bulkDeleteOrders(){ const ids=selectedOrderIds(); if(!ids.length)return Swal.fire('Seleccioná pedidos','','info'); if(!(await confirmDanger('Eliminar seleccionados',`Se eliminarán ${ids.length} pedidos.`)))return; if(db){ for(const id of ids){const o=findOrder(id); if(o?.id) await db.from('orders').delete().eq('id',o.id);} } state.orders=state.orders.filter(o=>!ids.includes(o.id||o.order_id)); saveLocal(); renderDashboard(); renderOrders(); }
async function bulkChangeStatus(){ const ids=selectedOrderIds(); if(!ids.length)return Swal.fire('Seleccioná pedidos','','info'); const {value}=await Swal.fire({title:'Cambio masivo de estado',input:'select',inputOptions:Object.fromEntries(STATUS_OPTIONS.map(s=>[s,s])),showCancelButton:true}); if(!value)return; for(const id of ids){ const o=findOrder(id); if(o) await updateOrder(o,{status:value,tracking_number:o.tracking_number||'',tracking_url:o.tracking_url||'',msg:`Tu pedido ${o.order_id} cambió a estado: ${value}.`,send:false}); } Swal.fire('Listo','Estados actualizados.','success'); }
async function confirmDanger(t,txt){ const r=await Swal.fire({title:t,text:txt,icon:'warning',showCancelButton:true,confirmButtonText:'Sí, confirmar',cancelButtonText:'Cancelar'}); return r.isConfirmed; }
async function sendStatusEmail(o,msg){
  if(!window.emailjs || !STORE_CONFIG.EMAILJS_TEMPLATE_CAMBIO_ESTADO_ID || String(STORE_CONFIG.EMAILJS_TEMPLATE_CAMBIO_ESTADO_ID).includes('PEGAR_')){ console.warn('Template cambio estado no configurado.'); return; }
  await emailjs.send(STORE_CONFIG.EMAILJS_SERVICE_ID, STORE_CONFIG.EMAILJS_TEMPLATE_CAMBIO_ESTADO_ID,{email:o.customer_email,customer_name:o.customer_name,order_id:o.order_id,order_status:o.order_status,tracking_number:o.tracking_number||'',tracking_url:o.tracking_url||'',status_message:msg||''});
}

function reportRows(){ return state.orders.map(o=>[o.order_id,o.customer_name,o.customer_email,o.payment_label||o.payment_method,o.order_status||'Pendiente',o.tracking_number||'',money(o.total),formatDate(o.created_at)]); }
function reportHeader(){ return `Mateando entre Almas - Reporte de pedidos\nFecha y hora: ${nowAR()}\nUsuario solicitante: ${state.user?.name||state.user?.username}`; }
function exportCSV(){ const rows=[['Reporte de pedidos'],[`Fecha y hora: ${nowAR()}`],[`Usuario: ${state.user?.name||state.user?.username}`],[],['Pedido','Comprador','Email','Pago','Estado','Seguimiento','Total','Fecha'],...reportRows()]; const csv=rows.map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n'); downloadBlob(csv,'reporte-pedidos.csv','text/csv;charset=utf-8'); }
function exportPDF(){ const {jsPDF}=window.jspdf; const doc=new jsPDF('l','pt','a4'); doc.setFontSize(14); doc.text('Mateando entre Almas - Reporte de pedidos',40,42); doc.setFontSize(10); doc.text(`Fecha y hora: ${nowAR()}`,40,60); doc.text(`Usuario solicitante: ${state.user?.name||state.user?.username}`,40,76); doc.text('Logo: TAPIR-BOOK',650,42); doc.autoTable({startY:95,head:[['Pedido','Comprador','Email','Pago','Estado','Seguimiento','Total','Fecha']],body:reportRows(),styles:{fontSize:8},headStyles:{fillColor:[157,108,47]}}); doc.save('reporte-pedidos.pdf'); }
function downloadBlob(content,name,type){ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([content],{type})); a.download=name; a.click(); URL.revokeObjectURL(a.href); }

function renderUsers(){ $('#usersBody').innerHTML=state.users.map(u=>`<tr><td>${u.username}</td><td>${u.name||''}</td><td>${u.email||''}</td><td>${u.role||''}</td><td>${u.status||'Activo'}</td><td><div class="row-actions"><button class="mini-btn" onclick="userModal('${u.id}')">${icon('edit')}</button><button class="mini-btn" onclick="deleteUser('${u.id}')">${icon('del')}</button></div></td></tr>`).join(''); }
window.userModal=async(id)=>{ const u=state.users.find(x=>x.id===id)||{}; const roleOpts=state.roles.map(r=>`<option ${r.name===u.role?'selected':''}>${r.name}</option>`).join(''); const {value}=await Swal.fire({title:id?'Editar usuario':'Crear usuario',html:`<div class="form-grid" style="text-align:left"><label>Usuario<input id="uUser" value="${u.username||''}"></label><label>Nombre<input id="uName" value="${u.name||''}"></label><label>Email<input id="uEmail" value="${u.email||''}"></label><label>Rol<select id="uRole">${roleOpts}</select></label><label>Estado<select id="uStatus"><option>Activo</option><option>Inactivo</option></select></label><label>Contraseña<input id="uPass" type="password" placeholder="Solo si querés cambiarla"></label></div>`,showCancelButton:true,preConfirm:async()=>({username:$('#uUser').value,name:$('#uName').value,email:$('#uEmail').value,role:$('#uRole').value,status:$('#uStatus').value,pass:$('#uPass').value})}); if(!value)return; const rec={id:id||crypto.randomUUID(),username:value.username,name:value.name,email:value.email,role:value.role,status:value.status,photo:u.photo||'',password_hash:value.pass?await sha256(value.pass):(u.password_hash||await sha256('123456'))}; if(db){ const {error}=await db.from('admin_users').upsert(rec); if(error)return Swal.fire('Error',error.message,'error'); } state.users=id?state.users.map(x=>x.id===id?rec:x):[rec,...state.users]; saveLocal(); renderUsers(); };
window.deleteUser=async(id)=>{ if(!(await confirmDanger('Eliminar usuario','')))return; if(db) await db.from('admin_users').delete().eq('id',id); state.users=state.users.filter(u=>u.id!==id); saveLocal(); renderUsers(); };
function renderRoles(){ $('#rolesGrid').innerHTML=state.roles.map(r=>`<div class="role-card"><h3>${r.name}</h3><div class="checks">${PERMISSIONS.map(p=>`<label><input type="checkbox" ${r.permissions?.includes(p)?'checked':''} onchange="toggleRolePerm('${r.id}','${p}',this.checked)"> ${p}</label>`).join('')}</div><br><button class="btn danger" onclick="deleteRole('${r.id}')">Eliminar perfil</button></div>`).join(''); }
window.roleModal=async()=>{ const {value}=await Swal.fire({title:'Crear perfil',input:'text',inputLabel:'Nombre del perfil',showCancelButton:true}); if(!value)return; const rec={id:crypto.randomUUID(),name:value,permissions:['dashboard','perfil']}; if(db){ const {error}=await db.from('admin_roles').insert(rec); if(error)return Swal.fire('Error',error.message,'error'); } state.roles.unshift(rec); saveLocal(); renderRoles(); };
window.toggleRolePerm=async(id,p,checked)=>{ const r=state.roles.find(x=>x.id===id); r.permissions=checked?[...new Set([...(r.permissions||[]),p])]:(r.permissions||[]).filter(x=>x!==p); if(db) await db.from('admin_roles').update({permissions:r.permissions}).eq('id',id); saveLocal(); };
window.deleteRole=async(id)=>{ if(!(await confirmDanger('Eliminar perfil','')))return; if(db) await db.from('admin_roles').delete().eq('id',id); state.roles=state.roles.filter(r=>r.id!==id); saveLocal(); renderRoles(); };
function fillProfile(){ $('#profileName').value=state.user.name||''; $('#profileEmail').value=state.user.email||''; $('#profilePhoto').value=state.user.photo||''; }
async function saveProfile(e){ e.preventDefault(); const patch={name:$('#profileName').value,email:$('#profileEmail').value,photo:$('#profilePhoto').value}; const pass=$('#profilePassword').value; if(pass) patch.password_hash=await sha256(pass); if(db&&state.user.id) await db.from('admin_users').update(patch).eq('id',state.user.id); state.user={...state.user,...patch}; localStorage.setItem('admin_session',JSON.stringify(state.user)); state.users=state.users.map(u=>u.id===state.user.id?{...u,...patch}:u); saveLocal(); $('#profileAvatar').src=state.user.photo||$('#profileAvatar').src; Swal.fire('Listo','Perfil actualizado.','success'); }
function handleAvatarFile(e){ const file=e.target.files?.[0]; if(!file)return; const reader=new FileReader(); reader.onload=()=>{$('#profileAvatar').src=reader.result; $('#profilePhoto').value=reader.result;}; reader.readAsDataURL(file); }
