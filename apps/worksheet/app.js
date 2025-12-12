// apps/worksheet/app.js
(function(){
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const sheet = $('#sheet');
  const btnGen = $('#btn-generate');
  const btnAns = $('#btn-answers');
  const btnPrint = $('#btn-print');
  const btnClear = $('#btn-clear');

  let lastProblems = null;
  let showingAnswers = false;

  function rnd(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }

  function pickLevel(level){
    switch(level){
      case 'easy': return { max: 20, mulMax: 5 };
      case 'hard': return { max: 999, mulMax: 9 };
      case 'normal':
      default: return { max: 99, mulMax: 9 };
    }
  }

  function genAdd(max){
    const a = rnd(0, max); const b = rnd(0, max);
    return { q: `${a} + ${b} =`, a: a+b };
  }
  function genSub(max){
    let a = rnd(0, max), b = rnd(0, max);
    if (a < b) [a,b] = [b,a];
    return { q: `${a} - ${b} =`, a: a-b };
  }
  function genMul(mulMax){
    const a = rnd(2, mulMax), b = rnd(2, mulMax);
    return { q: `${a} × ${b} =`, a: a*b };
  }
  function genDiv(mulMax){
    const a = rnd(2, mulMax), b = rnd(2, mulMax);
    const prod = a*b;
    return { q: `${prod} ÷ ${a} =`, a: b };
  }

  function buildProblems(opts){
    const { types, count, level } = opts;
    const cfg = pickLevel(level);
    const gens = [];
    if (types.includes('add')) gens.push(()=>genAdd(cfg.max));
    if (types.includes('sub')) gens.push(()=>genSub(cfg.max));
    if (types.includes('mul')) gens.push(()=>genMul(cfg.mulMax));
    if (types.includes('div')) gens.push(()=>genDiv(cfg.mulMax));
    if (gens.length === 0) throw new Error('하나 이상의 문제 유형을 선택하세요.');

    const probs = [];
    for (let i=0; i<count; i++){
      const g = gens[rnd(0, gens.length-1)];
      probs.push(g());
    }
    return probs;
  }

  function renderProblems(probs, showAnswers=false){
    sheet.innerHTML = '';
    probs.forEach((p, idx)=>{
      const div = document.createElement('div');
      div.className = 'problem';
      div.setAttribute('data-index', idx);
      div.innerHTML = showAnswers ? `<span>${p.q} <strong>${p.a}</strong></span>` : `<span>${p.q} &nbsp;&nbsp;</span>`;
      sheet.appendChild(div);
    });
    $('.placeholder')?.remove();
  }

  btnGen.addEventListener('click', () => {
    try{
      const count = Math.max(4, Math.min(120, parseInt($('#count').value || '20', 10)));
      const level = $('#level').value;
      const types = $$('#\\:not-real'); // placeholder to force query split
      // collect checked
      const typesChecked = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(el=>el.value);
      lastProblems = buildProblems({ types: typesChecked, count, level });
      showingAnswers = false;
      renderProblems(lastProblems, false);
      btnAns.disabled = false;
      btnPrint.disabled = false;
    }catch(e){
      alert(e.message);
    }
  });

  btnAns.addEventListener('click', () => {
    if (!lastProblems) return;
    showingAnswers = !showingAnswers;
    renderProblems(lastProblems, showingAnswers);
    btnAns.textContent = showingAnswers ? '문제 보기' : '정답지 보기';
  });

  btnPrint.addEventListener('click', () => window.print());
  btnClear.addEventListener('click', () => {
    sheet.innerHTML = '<p class="placeholder">왼쪽에서 설정을 고르고 <b>문제 생성</b> 버튼을 눌러주세요.</p>';
    lastProblems = null;
    btnAns.disabled = true;
    btnPrint.disabled = true;
    btnAns.textContent = '정답지 보기';
  });
})();