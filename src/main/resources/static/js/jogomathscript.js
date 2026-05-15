// ====== ESTADO ======
let pontuacao=0, streak=0, nivel=1, questoesRespondidas=0;
const QUESTOES_POR_NIVEL=5;
let respostaCerta, bloqueado=false;

const qEl=document.getElementById('question');
const objEl=document.getElementById('objects-container');
const feedEl=document.getElementById('feedback');
const ptsEl=document.getElementById('m-pts');
const streakEl=document.getElementById('m-streak');
const nivelEl=document.getElementById('m-level');
const streakDisp=document.getElementById('streak-display');
const progressBar=document.getElementById('progress-bar');

const objetos=['🍎','⭐','⚽','🍓','🐶','🦋','🍭','🎈','🌸','💎','🐸','🍕'];

// WEB AUDIO
function tocarSomCorreto(){
  try{
    const ctx=new(window.AudioContext||window.webkitAudioContext)();
    [523,659,784].forEach((f,i)=>{
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.connect(g);g.connect(ctx.destination);
      o.frequency.value=f;o.type='sine';
      g.gain.setValueAtTime(.3,ctx.currentTime+i*.08);
      g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+i*.08+.2);
      o.start(ctx.currentTime+i*.08);o.stop(ctx.currentTime+i*.08+.2);
    });
  }catch(e){}
}
function tocarSomErro(){
  try{
    const ctx=new(window.AudioContext||window.webkitAudioContext)();
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.connect(g);g.connect(ctx.destination);
    o.frequency.value=150;o.type='sawtooth';
    g.gain.setValueAtTime(.3,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.4);
    o.start();o.stop(ctx.currentTime+.4);
  }catch(e){}
}

function rnd(min,max){return Math.floor(Math.random()*(max-min+1))+min;}

function gerarPergunta(){
  bloqueado=false;
  feedEl.textContent='';
  const maxNum=Math.min(5+nivel*3,20);
  let n1=rnd(1,maxNum),n2=rnd(1,maxNum);
  const opIdx=nivel<=2?rnd(0,1):rnd(0,2);
  const ops=['+','-','×'];
  const op=ops[opIdx];
  let obj=objetos[rnd(0,objetos.length-1)];

  if(op==='-'&&n1<n2){[n1,n2]=[n2,n1];}
  if(op==='×'){n1=rnd(1,Math.min(nivel+1,10));n2=rnd(1,Math.min(nivel+1,5));}

  respostaCerta=op==='+'?n1+n2:op==='-'?n1-n2:n1*n2;

  // Animar questão
  qEl.style.animation='none';void qEl.offsetWidth;qEl.style.animation='questionPop .4s cubic-bezier(.34,1.56,.64,1)';
  qEl.textContent=`${n1} ${op} ${n2} = ?`;

  // Objetos visuais
  objEl.innerHTML='';
  if(op!=='×'||n1*n2<=25){
    const grupoA=criarGrupo(obj,n1);
    const sepEl=document.createElement('span');
    sepEl.className='operator';sepEl.textContent=op;
    const grupoB=criarGrupo(obj,n2);
    objEl.appendChild(grupoA);objEl.appendChild(sepEl);objEl.appendChild(grupoB);
  } else {
    const info=document.createElement('span');
    info.style.cssText='font-size:3rem;opacity:.5;';
    info.textContent=`${n1} × ${n2}`;
    objEl.appendChild(info);
  }

  // Gerar 4 opções
  const opcaoContainer=document.getElementById('opcoes-container');
  opcaoContainer.innerHTML='';
  const opcoes=gerarOpcoes(respostaCerta);
  opcoes.forEach(val=>{
    const btn=document.createElement('button');
    btn.className='opcao-btn';btn.textContent=val;
    btn.addEventListener('click',()=>verificar(btn,val));
    opcaoContainer.appendChild(btn);
  });

  // Progresso
  progressBar.style.width=(questoesRespondidas%QUESTOES_POR_NIVEL/QUESTOES_POR_NIVEL*100)+'%';
}

function criarGrupo(emoji,qtd){
  const wrap=document.createElement('span');
  wrap.style.cssText='display:inline-flex;flex-wrap:wrap;gap:2px;align-items:center;max-width:140px;justify-content:center;';
  for(let i=0;i<Math.min(qtd,20);i++){
    const sp=document.createElement('span');
    sp.className='object';sp.textContent=emoji;
    sp.style.setProperty('--i',i);
    sp.style.animationDelay=(i*.04)+'s';
    wrap.appendChild(sp);
  }
  if(qtd>20){
    const more=document.createElement('span');
    more.style.cssText='font-size:.9rem;color:rgba(255,255,255,.6);';
    more.textContent='+';
    wrap.appendChild(more);
  }
  return wrap;
}

function gerarOpcoes(certa){
  const set=new Set([certa]);
  while(set.size<4){
    const delta=rnd(-5,5);if(delta===0)continue;
    const alt=certa+delta;if(alt>=0)set.add(alt);
  }
  return shuffle([...set]);
}

function verificar(btn,valor){
  if(bloqueado)return;
  bloqueado=true;
  questoesRespondidas++;

  if(valor===respostaCerta){
    btn.classList.add('certa');
    tocarSomCorreto();
    streak++;
    const bonus=streak>2?streak*2:0;
    const pts=10+nivel*5+bonus;
    pontuacao+=pts;
    feedEl.textContent=streak>3?`🔥 COMBO x${streak}! +${pts}pts!`:`✅ Correto! +${pts} pontos!`;
    feedEl.style.color='#6BCB77';
    mostrarPtsFloat('+'+pts,'#6BCB77');
    if(streak>1){
      streakDisp.style.animation='none';void streakDisp.offsetWidth;streakDisp.style.animation='streakAnim .4s ease';
      streakDisp.textContent=streak>=5?`🏆 STREAK x${streak}!!`:streak>=3?`🔥 Streak x${streak}!`:`⚡ Combo x${streak}`;
    } else { streakDisp.textContent=''; }
    // Subir nível
    if(questoesRespondidas%QUESTOES_POR_NIVEL===0&&nivel<10){nivel++;nivelEl.textContent='Nível '+nivel;lancarConfete();}
  } else {
    btn.classList.add('errada');
    // Mostrar a certa
    document.querySelectorAll('.opcao-btn').forEach(b=>{if(parseInt(b.textContent)===respostaCerta)b.classList.add('certa');});
    tocarSomErro();
    streak=0;streakDisp.textContent='';
    feedEl.textContent=`❌ Era ${respostaCerta}! Continue tentando!`;
    feedEl.style.color='#FF6B6B';
    if(navigator.vibrate)navigator.vibrate([80,40,80]);
  }

  ptsEl.textContent=pontuacao;
  streakEl.textContent=streak;
  progressBar.style.width=(questoesRespondidas%QUESTOES_POR_NIVEL/QUESTOES_POR_NIVEL*100)+'%';

  setTimeout(gerarPergunta,1400);
}

function mostrarPtsFloat(texto,cor){
  const el=document.createElement('div');
  el.className='pts-float';el.textContent=texto;
  const rect=document.getElementById('game-container').getBoundingClientRect();
  el.style.cssText=`left:${rect.left+rect.width*.5}px;top:${rect.top+50}px;color:${cor};`;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),950);
}

function lancarConfete(){
  const cores=['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#C77DFF'];
  for(let i=0;i<30;i++){
    const c=document.createElement('div');c.className='conf-m';
    c.style.cssText=`left:${Math.random()*100}vw;top:-10px;width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;border-radius:${Math.random()>.5?'50%':'3px'};background:${cores[Math.floor(Math.random()*cores.length)]};animation-duration:${1.5+Math.random()*2}s;animation-delay:${Math.random()*.5}s;position:fixed;pointer-events:none;z-index:400;`;
    document.body.appendChild(c);
    setTimeout(()=>c.remove(),3000);
  }
}

function shuffle(arr){return arr.sort(()=>Math.random()-.5);}

// Criar fundo pontilhado
const bgDiv=document.createElement('div');bgDiv.className='math-bg-dots';document.body.prepend(bgDiv);

// Criar elementos do HUD e substituir o HTML legado
document.body.innerHTML=`
<div class="math-bg-dots"></div>
<div class="math-hud">
  <div class="math-stat"><div class="math-label">⭐ Pontos</div><div class="math-value" id="m-pts">0</div></div>
  <div class="math-stat"><div class="math-label">🎯 Nível</div><div class="math-value" id="m-level">Nível 1</div></div>
  <div class="math-stat"><div class="math-label">🔥 Combo</div><div class="math-value" id="m-streak">0</div></div>
</div>
<div id="game-container">
  <div id="question">Carregando...</div>
  <div id="objects-container"></div>
  <div id="opcoes-container" style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem;margin:.5rem 0;"></div>
  <div id="feedback" style="font-size:1.1rem;font-weight:800;min-height:2rem;margin:.3rem 0;animation:feedbackPop .3s ease;"></div>
  <div id="streak-display" style="font-size:1rem;min-height:1.5rem;margin:.2rem;"></div>
  <div id="progress-bar-c" style="background:rgba(255,255,255,.1);border-radius:10px;height:8px;margin:.5rem 0;"><div id="progress-bar" style="height:100%;border-radius:10px;background:linear-gradient(90deg,#6BCB77,#FFD93D);width:0%;transition:width .5s ease;"></div></div>
</div>`;

// Re-pegar referências
const qEl2=document.getElementById('question');
const objEl2=document.getElementById('objects-container');
const feedEl2=document.getElementById('feedback');
// Sobrescrever refs globais
Object.assign(window,{qEl:qEl2,objEl:objEl2,feedEl:feedEl2,ptsEl:document.getElementById('m-pts'),streakEl:document.getElementById('m-streak'),nivelEl:document.getElementById('m-level'),streakDisp:document.getElementById('streak-display'),progressBar:document.getElementById('progress-bar')});

gerarPergunta();

