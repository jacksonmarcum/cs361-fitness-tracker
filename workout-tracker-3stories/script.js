const views = ["login","dashboard","log","history"];
const state = {
  get user(){ return JSON.parse(localStorage.getItem("user")||"null");},
  set user(v){ if(v) localStorage.setItem("user",JSON.stringify(v)); else localStorage.removeItem("user"); },
  get workouts(){ return JSON.parse(localStorage.getItem("workouts")||"[]");},
  set workouts(v){ localStorage.setItem("workouts",JSON.stringify(v)); }
};

const $ = s=>document.querySelector(s);

function show(view){
  views.forEach(v=>document.getElementById(v).classList.add("hidden"));
  document.getElementById(view).classList.remove("hidden");
  if(state.user){ document.getElementById("topnav").classList.remove("hidden"); } else { document.getElementById("topnav").classList.add("hidden"); }
  if(view==="dashboard") document.getElementById("welcomeName").textContent=state.user?.name||"";
  if(view==="history") renderHistory();
}

function init(){
  document.querySelectorAll("#topnav button[data-target]").forEach(b=>b.addEventListener("click",()=>show(b.dataset.target)));
  document.getElementById("logoutBtn").addEventListener("click",()=>{state.user=null;show("login");});
  document.getElementById("cancelLog").addEventListener("click",()=>show("dashboard"));
  document.getElementById("closeView").addEventListener("click",()=>document.getElementById("viewDialog").close());

  document.getElementById("loginForm").addEventListener("submit",e=>{
    e.preventDefault();
    const name=document.getElementById("username").value.trim(); const pass=document.getElementById("password").value;
    if(!name||!pass)return;
    state.user={name};
    if(state.workouts.length===0){
      const today=new Date().toISOString().slice(0,10);
      state.workouts=[
        {id:Date.now()+1,user:name,ex:"Bench Press",sets:3,reps:10,metric:"120 lb",date:today,notes:""},
        {id:Date.now()+2,user:name,ex:"Running",sets:1,reps:1,metric:"30 min",date:today,notes:"Evening jog"},
        {id:Date.now()+3,user:name,ex:"Squat",sets:5,reps:5,metric:"—",date:today,notes:""}
      ];
    }
    show("dashboard");
  });

  document.getElementById("logForm").addEventListener("submit",e=>{
    e.preventDefault();
    const ex=document.getElementById("ex").value.trim(),
          sets=parseInt(document.getElementById("sets").value),
          reps=parseInt(document.getElementById("reps").value);
    if(!ex||sets<=0||reps<=0){
      const err=document.getElementById("formError");
      err.textContent="Fill all fields with valid numbers";
      err.classList.remove("hidden");
      return;
    }
    const w={id:Date.now(),user:state.user.name,ex,sets,reps,metric:document.getElementById("metric").value,date:document.getElementById("date").value||new Date().toISOString().slice(0,10),notes:document.getElementById("notes").value};
    const list=state.workouts;list.unshift(w);state.workouts=list;
    e.target.reset();toast("Saved");show("dashboard");
  });

  document.getElementById("search").addEventListener("input",renderHistory);

  if(state.user)show("dashboard"); else show("login");
}

function renderHistory(){
  const q=(document.getElementById("search").value||"").toLowerCase();
  const tb=document.querySelector("#historyTable tbody"); tb.innerHTML="";
  state.workouts.filter(w=>!q||w.ex.toLowerCase().includes(q)||(w.notes||'').toLowerCase().includes(q)).forEach(w=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${w.date}</td><td>${w.ex} ${w.sets}x${w.reps}${w.metric?` (${w.metric})`:""}</td>
      <td><button class='viewBtn'>View</button> <button class='delBtn'>Delete</button></td>`;
    tr.querySelector(".viewBtn").onclick=()=>{ document.getElementById("detailText").textContent=JSON.stringify(w,null,2); document.getElementById("viewDialog").showModal(); };
    tr.querySelector(".delBtn").onclick=()=>{ if(confirm("Delete this workout? This will permanently remove it.")){ state.workouts=state.workouts.filter(x=>x.id!==w.id); renderHistory(); toast("Deleted"); } };
    tb.appendChild(tr);
  });
}

function toast(msg){
  const t=document.getElementById("toast");
  t.textContent=msg;
  t.classList.remove("hidden");
  setTimeout(()=>t.classList.add("hidden"),2000);
}

document.addEventListener("DOMContentLoaded",init);
