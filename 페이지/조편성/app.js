// 페이지/조편성/app.js (FIXED)
(function(){
  const $ = (s)=>document.querySelector(s);
  
  // 요소 가져오기
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

  // (옵션) 중복 제거 토글
  let dedupe = false;
  const dedupeToggle = $('#dedupe');

  // 1. 텍스트 정리 함수
  function normalizeText(t){
    return (t||'')
      .replace(/[\u200B-\u200D\uFEFF]/g,'')     // 숨겨진 특수문자 제거
      .replace(/\t/g,' ')                       // 탭 -> 공백
      .replace(/\u00A0/g,' ')                   // nbsp -> 공백
      .trim();
  }

  // 2. 이름 파싱 함수 (핵심 수정 부분)
  function parseNames(){
    // [수정] txt가 null이거나, textarea가 아닌 div일 경우를 대비해 값 읽기 방식 강화
    if (!txt) return [];
    
    // textarea/input은 .value, 그 외(div 등)는 .innerText 사용
    let rawValue = (txt.value !== undefined) ? txt.value : (txt.innerText || '');
    
    const raw = normalizeText(rawValue);
    if (!raw) return [];

    // 줄바꿈 문자 통일 및 분리
    let parts = raw.split(/\r\n|[\n\r\u2028\u2029]/);

    // 줄바꿈 없이 쉼표나 공백으로만 구분된 경우 처리
    if (parts.length === 1 && raw.length > 0) {
      parts = raw.split(/[,\s]+/);
    }

    const names = [];
    for (const line of parts){
      const s = String(line).trim();
      if (!s) continue;
      // 콤마가 있으면 앞부분만 이름으로 사용 (예: 홍길동,남 -> 홍길동)
      const first = s.split(',')[0].trim();
      if (first) names.push(first);
    }

    // 중복 제거 옵션 처리
    if (dedupe && names.length){
      return Array.from(new Set(names));
    }
    return names;
  }

  // 3. 인원 수 실시간 표시 (디버깅용으로도 유용)
  const counter = document.createElement('div');
  counter.id = 'names-count';
  counter.style.cssText = 'margin:6px 0 0; color:#007bff; font-weight:bold; font-size:.9rem;';
  
  // txt 요소가 있을 때만 카운터 붙이기
  if(txt?.parentElement) {
    txt.parentElement.appendChild(counter);
  }

  function updateCount(){
    const n = parseNames().length;
    // 여기서 n이 0이면 코드가 이름을 못 읽고 있다는 뜻입니다.
    counter.textContent = `현재 인식된 인원: ${n}명`;
  }

  // 이벤트 리스너 연결
  if(txt) txt.addEventListener('input', updateCount);
  if(dedupeToggle) dedupeToggle.addEventListener('change', ()=>{ dedupe = !!dedupeToggle.checked; updateCount(); });
  
  // 초기 카운트 실행
  updateCount();

  // --- 이하 로직은 기존과 동일 ---

  function shuffle(a){
    const arr = a.slice();
    for(let i=arr.length-1; i>0; i--){
      const j = Math.floor(Math.random()*(i+1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function splitPairs(rawInput){ // 변수명 충돌 방지 위해 rawInput으로 변경
    const el = rawInput; // 요소 자체를 받음
    const s = (el?.value || '').trim();
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
      
      // 더 적은 쪽으로 이동
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
      d.innerHTML = `<h3>${idx+1}팀 <small>(${g.length}명)</small></h3>`;
      const ol=document.createElement('ol');
      g.forEach(n=>{ const li=document.createElement('li'); li.textContent=n; ol.appendChild(li); });
      d.appendChild(ol);
      result.appendChild(d);
    });
  }

  function doAssign(){
    const names = parseNames();
    
    // 디버깅: 실제로 몇 명이 인식되었는지 콘솔에 출력
    console.log('Assigning names:', names); 

    if(names.length < 2){
      alert(`입력된 이름이 부족합니다. (현재 인식된 인원: ${names.length}명)\n이름 목록을 확인해주세요.`);
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

  // 버튼 이벤트 연결 (요소가 존재할 때만)
  if(btnAssign) btnAssign.addEventListener('click', doAssign);
  if(btnShuffle) btnShuffle.addEventListener('click', doAssign);
  if(btnPrint) btnPrint.addEventListener('click', ()=>window.print());
  if(btnClear) btnClear.addEventListener('click', ()=>{ 
      result.innerHTML='<p class="placeholder">결과가 여기 표시됩니다.</p>'; 
      btnPrint.disabled=true; 
  });

})();
