// 페이지/학습지/app.js
(function(){
  const $ = (s)=>document.querySelector(s);
  const $$ = (s)=>Array.from(document.querySelectorAll(s));
  const rnd = (min,max)=>Math.floor(Math.random()*(max-min+1))+min;

  const sheet = $('#sheet');
  const btnGen = $('#btn-generate');
  const btnAns = $('#btn-answers');
  const btnPrint = $('#btn-print');
  const btnClear = $('#btn-clear');

  let last = null;
  let showAns = false;

  function levelCfg(level){
    return level==='easy' ? {max:20,mulMax:5} : level==='hard' ? {max:999,mulMax:9} : {max:99,mulMax:9};
  }
  function add(max){ const a=rnd(0,max), b=rnd(0,max); return {q:`${a} + ${b} =`, a:a+b}; }
  function sub(max){ let a=rnd(0,max), b=rnd(0,max); if(a<b)[a,b]=[b,a]; return {q:`${a} - ${b} =`, a:a-b}; }
  function mul(m){ const a=rnd(2,m), b=rnd(2,m); return {q:`${a} × ${b} =`, a:a*b}; }
  function div(m){ const a=rnd(2,m), b=rnd(2,m), prod=a*b; return {q:`${prod} ÷ ${a} =`, a:b}; }

  function build({types,count,level}){
    const cfg=levelCfg(level);
    const gens=[];
    if(types.includes('add')) gens.push(()=>add(cfg.max));
    if(types.includes('sub')) gens.push(()=>sub(cfg.max));
    if(types.includes('mul')) gens.push(()=>mul(cfg.mulMax));
    if(types.includes('div')) gens.push(()=>div(cfg.mulMax));
    if(!gens.length) throw new Error('문제 유형을 선택하세요.');
    const out=[];
    for(let i=0;i<count;i++){ out.push(gens[rnd(0,gens.length-1)]()); }
    return out;
  }

  function render(probs, answers=false){
    sheet.innerHTML='';
    probs.forEach((p,i)=>{
      const d=document.createElement('div');
      d.className='problem';
      d.innerHTML = answers ? `<span>${p.q} <strong>${p.a}</strong></span>` : `<span>${p.q}</span>`;
      sheet.appendChild(d);
    });
  }

  btnGen.addEventListener('click', ()=>{
    try{
      const count=Math.max(4,Math.min(120, parseInt($('#count').value||'20',10)));
      const level=$('#level').value;
      const types=$$('input[type="checkbox"]:checked').map(el=>el.value);
      last=build({types,count,level});
      showAns=false;
      render(last,false);
      btnAns.disabled=false; btnPrint.disabled=false;
    }catch(e){ alert(e.message); }
  });

  btnAns.addEventListener('click', ()=>{
    if(!last) return;
    showAns=!showAns;
    render(last, showAns);
    btnAns.textContent = showAns ? '문제 보기' : '정답지 보기';
  });

  btnPrint.addEventListener('click', ()=>window.print());
  btnClear.addEventListener('click', ()=>{
    sheet.innerHTML='<p class="placeholder">왼쪽에서 설정을 고르고 <b>문제 생성</b>을 눌러주세요.</p>';
    btnAns.disabled=true; btnPrint.disabled=true; btnAns.textContent='정답지 보기'; last=null;
  });
})();