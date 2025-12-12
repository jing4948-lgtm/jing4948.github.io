// 페이지/조편성/app.js
(function(){
  const $ = (s)=>document.querySelector(s);
  const $$ = (s)=>Array.from(document.querySelectorAll(s));

  const txt = $('#names');
  const mode = $('#mode');
  const param = $('#param');
  const btnAssign = $('#btn-assign');
  const btnShuffle = $('#btn-shuffle');
  const btnPrint = $('#btn-print');
  const btnClear = $('#btn-clear');
  const result = $('#result');
  const mustTogether = $('#mustTogether');
  const avoidTogether = $('#avoidTogether');

  function parseNames(){
    const lines = (txt.value||'').split(/\\r?\\n/).map(s=>s.trim()).filter(Boolean);
    const names = [];
    for(const line of lines){
      const first = line.split(',')[0].trim();
      if(first) names.push(first);
    }
    return Array.from(new Set(names));
  }

  function shuffle(a){
    const arr = a.slice();
    for(let i=arr.length-1; i>0; i--){
      const j = Math.floor(Math.random()*(i+1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function splitPairs(raw){
    const s = (raw.value||'').trim();
    if(!s) return [];
    return s.split(/[\\s,]+/).map(x=>x.trim()).filter(Boolean);
  }

  function violates(groups, avoid){
    const set = new Set();
    for(let i=0;i<avoid.length;i+=2){
      const a=avoid[i], b=avoid[i+1];
      if(!a||!b) continue;
      set.add(`${a}||${b}`); set.add(`${b}||${a}`);
    }
    for(const g of groups){
      for(let i=0;i<g.length;i++){
        for(let j=i+1;j<g.length;j++){
          if(set.has(`${g[i]}||${g[j]}`)) return true;
        }
      }
    }
    return false;
  }

  function enforceMust(groups, must){
    const pairs = [];
    for(let i=0;i<must.length;i+=2){
      const a=must[i], b=must[i+1];
      if(!a||!b) continue;
      pairs.push([a,b]);
    }
    for(const [a,b] of pairs){
      let gi=-1, gj=-1, ia=-1, jb=-1;
      groups.forEach((g, idx)=>{
        g.forEach((name, k)=>{
          if(name===a){ gi=idx; ia=k; }
          if(name===b){ gj=idx; jb=k; }
        });
      });
      if(gi===-1 || gj===-1) continue;
      if(gi===gj) continue;
      if(groups[gi].length <= groups[gj].length){
        groups[gi].push(b);
        groups[gj].splice(jb,1);
      }else{
        groups[gj].push(a);
        groups[gi].splice(ia,1);
      }
    }
  }

  function assignByTeams(names, k){
    const shuffled = shuffle(names);
    const groups = Array.from({length:k}, ()=>[]);
    let i=0;
    for(const n of shuffled){ groups[i%k].push(n); i++; }
    return groups;
  }
  function assignBySize(names, size){
    const shuffled = shuffle(names);
    const groups = [];
    for(let i=0;i<shuffled.length;i+=size){ groups.push(shuffled.slice(i,i+size)); }
    return groups;
  }

  function render(groups){
    result.innerHTML='';
    groups.forEach((g, idx)=>{
      const d=document.createElement('div');
      d.className='team';
      d.innerHTML = `<h3>${idx+1}팀 (${g.length}명)</h3>`;
      const ol=document.createElement('ol');
      g.forEach(n=>{ const li=document.createElement('li'); li.textContent=n; ol.appendChild(li); });
      d.appendChild(ol);
      result.appendChild(d);
    });
  }

  function doAssign(){
    const names = parseNames();
    if(names.length<2){ alert('이름을 두 명 이상 입력하세요.'); return; }
    const m = mode.value;
    const p = Math.max(2, parseInt(param.value||'4',10));

    let groups;
    if(m==='byTeams') groups = assignByTeams(names, Math.min(p, names.length));
    else if(m==='bySize') groups = assignBySize(names, Math.max(2, p));
    else groups = assignBySize(names, 2);

    const must = splitPairs(mustTogether);
    const avoid = splitPairs(avoidTogether);

    let best = groups, tries = 150;
    while(tries--){
      if(!violates(best, avoid)) break;
      const alt = (m==='byTeams') ? assignByTeams(names, best.length)
                 : (m==='bySize') ? assignBySize(names, best[0]?.length || 2)
                 : assignBySize(names, 2);
      if(!violates(alt, avoid)){ best=alt; break; }
      if(Math.random()<0.5) best=alt;
    }

    enforceMust(best, must);
    render(best);
    btnPrint.disabled=false;
  }

  btnAssign.addEventListener('click', doAssign);
  btnShuffle.addEventListener('click', doAssign);
  btnPrint.addEventListener('click', ()=>window.print());
  btnClear.addEventListener('click', ()=>{ result.innerHTML='<p class="placeholder">이름을 입력하고 <b>배정하기</b>를 눌러주세요.</p>'; btnPrint.disabled=true; });
})();