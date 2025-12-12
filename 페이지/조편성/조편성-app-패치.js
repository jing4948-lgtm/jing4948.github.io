// 페이지/조편성/app.js (PATCHED 2025-12-12)
// 변경 사항
// 1) 이름 파싱 강화: \r, \n, 유니코드 줄바꿈, 제로폭 문자 제거, 탭/중복 공백 정리
// 2) 줄 단위가 아닌 "공백/쉼표로 구분된" 입력도 지원 (엑셀/메신저 붙여넣기 보호)
// 3) 중복 제거를 하지 않음(동명이인 허용). 필요 시 toggle 가능하도록 옵션만 남김.
// 4) 인식된 인원 수를 즉시 표시(#names-count).

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

  // (옵션) 중복 제거 스위치가 있으면 반영
  let dedupe = false;
  const dedupeToggle = $('#dedupe'); // 없으면 무시

  function normalizeText(t){
    return (t||'')
      .replace(/[\u200B-\u200D\uFEFF]/g,'')     // zero-width 제거
      .replace(/\t/g,' ')                       // 탭 → 공백
      .replace(/\u00A0/g,' ')                   // nbsp → 공백
      .replace(/\s+\r?\n/g, '\n')               // 줄 끝 공백 제거
      .trim();
  }

  function parseNames(){
    const raw = normalizeText(txt.value);
    if (!raw) return [];
    // 1차: 다양한 줄바꿈으로 split
    let parts = raw.split(/\r\n|[\n\r\u2028\u2029]/);
    // 어떤 사용자는 줄바꿈 없이 공백/쉼표로만 구분해서 붙여넣기도 함 → 보조 처리
    if (parts.length === 1) {
      parts = raw.split(/[,\s]+/);
    }
    const names = [];
    for (const line of parts){
      const s = String(line).trim();
      if (!s) continue;
      // CSV의 첫 셀만 사용 (홍길동,남 → 홍길동)
      const first = s.split(',')[0].trim();
      if (first) names.push(first);
    }
    if (dedupe && names.length){
      // 중복 제거 옵션이 켜진 경우에만 적용
      return Array.from(new Set(names));
    }
    return names;
  }

  // 실시간 인원 표시
  const counter = document.createElement('div');
  counter.id = 'names-count';
  counter.style.cssText = 'margin:6px 0 0; color:#555; font-size:.9rem;';
  txt?.parentElement?.appendChild(counter);
  function updateCount(){
    const n = parseNames().length;
    counter.textContent = `인식된 인원: ${n}명`;
  }
  txt?.addEventListener('input', updateCount);
  dedupeToggle?.addEventListener('change', ()=>{ dedupe = !!dedupeToggle.checked; updateCount(); });
  updateCount();

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
    return s.split(/[\s,]+/).map(x=>x.trim()).filter(Boolean);
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
    if(names.length < 2){
      alert('이름을 두 명 이상 입력하세요.');
      return;
    }
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