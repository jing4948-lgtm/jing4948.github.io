// apps/team-maker/app.js
(function(){
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

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

  let lastGroups = null;
  let lastNames = [];

  function parseNames(){
    const lines = (txt.value || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    const names = [];
    for (const line of lines){
      const firstCell = line.split(',')[0].trim();
      if (firstCell) names.push(firstCell);
    }
    return Array.from(new Set(names)); // 중복 제거
  }

  function shuffle(arr){
    const a = arr.slice();
    for (let i=a.length-1; i>0; i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function splitPairs(raw){
    const s = (raw.value || '').trim();
    if (!s) return [];
    return s.split(/[,\s]+/).map(x=>x.trim()).filter(Boolean);
  }

  function violates(groups, avoid){
    // 같은 팀에 avoid 쌍이 같이 있는지 검사
    const setAvoid = new Set();
    for (let i=0; i<avoid.length; i+=2){
      const a = avoid[i], b = avoid[i+1];
      if (!a || !b) continue;
      setAvoid.add(`${a}||${b}`);
      setAvoid.add(`${b}||${a}`);
    }
    for (const g of groups){
      for (let i=0;i<g.length;i++){
        for (let j=i+1;j<g.length;j++){
          if (setAvoid.has(`${g[i]}||${g[j]}`)) return true;
        }
      }
    }
    return false;
  }

  function enforceMust(groups, must){
    // must 쌍이 같은 팀에 없으면, 가능한 한 팀간 스왑으로 묶기 (간단 휴리스틱)
    const pairs = [];
    for (let i=0; i<must.length; i+=2){
      const a = must[i], b = must[i+1];
      if (!a || !b) continue;
      pairs.push([a,b]);
    }
    for (const [a,b] of pairs){
      let gi=-1, gj=-1, ia=-1, jb=-1;
      groups.forEach((g, idx)=>{
        g.forEach((name, k)=>{
          if (name===a){ gi=idx; ia=k; }
          if (name===b){ gj=idx; jb=k; }
        });
      });
      if (gi===-1 || gj===-1) continue; // 한 명이 목록에 없으면 무시
      if (gi===gj) continue; // 이미 같은 팀
      // b를 a의 팀으로 이동 시도
      if (groups[gi].length <= groups[gj].length){
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
    for (const n of shuffled){
      groups[i%k].push(n);
      i++;
    }
    return groups;
  }

  function assignBySize(names, size){
    const shuffled = shuffle(names);
    const groups = [];
    for (let i=0; i<shuffled.length; i+=size){
      groups.push(shuffled.slice(i, i+size));
    }
    return groups;
  }

  function render(groups){
    result.innerHTML = '';
    groups.forEach((g, idx)=>{
      const div = document.createElement('div');
      div.className = 'team';
      div.innerHTML = `<h3>${idx+1}팀 (${g.length}명)</h3>`;
      const ol = document.createElement('ol');
      g.forEach(name=>{
        const li = document.createElement('li');
        li.textContent = name;
        ol.appendChild(li);
      });
      div.appendChild(ol);
      result.appendChild(div);
    });
  }

  function doAssign(){
    const names = parseNames();
    if (names.length < 2) { alert('이름을 두 명 이상 입력하세요.'); return; }
    let groups;
    const m = mode.value;
    const p = Math.max(2, parseInt(param.value || '4', 10));

    if (m === 'byTeams'){
      groups = assignByTeams(names, Math.min(p, names.length));
    }else if (m === 'bySize'){
      groups = assignBySize(names, Math.max(2, p));
    }else{ // pairs
      groups = assignBySize(names, 2);
    }

    const must = splitPairs(mustTogether);
    const avoid = splitPairs(avoidTogether);

    // 간단한 재시도 루프로 avoid 위반 줄이기
    let best = groups, tries = 150;
    while (tries--){
      if (!violates(best, avoid)) break;
      // 다시 섞기
      const alt = (mode.value==='byTeams') ? assignByTeams(names, groups.length) :
                   (mode.value==='bySize') ? assignBySize(names, groups[0]?.length || 2) :
                   assignBySize(names, 2);
      if (!violates(alt, avoid)) { best = alt; break; }
      if (Math.random() < 0.5) best = alt;
    }

    enforceMust(best, must);

    lastGroups = best;
    lastNames = names.slice();
    render(best);
    btnPrint.disabled = false;
  }

  btnAssign.addEventListener('click', doAssign);
  btnShuffle.addEventListener('click', doAssign);
  btnClear.addEventListener('click', () => {
    result.innerHTML = '<p class="placeholder">이름을 입력하고 <b>배정하기</b>를 눌러주세요.</p>';
    btnPrint.disabled = true;
  });
  btnPrint.addEventListener('click', () => window.print());
})();