// ====== CONFIGURAÇÃO DAS FASES ======
const fases = [
  { pares:2, tempo:30, nome:'Iniciante 🌱' },
  { pares:4, tempo:45, nome:'Fácil 😊' },
  { pares:6, tempo:60, nome:'Médio 🎯' },
  { pares:8, tempo:80, nome:'Difícil 🔥' },
  { pares:10, tempo:100, nome:'Expert 🏆' }
];

let faseAtual=0, primeiraCarta=null, bloqueio=false, acertos=0;
let tempoRestante, intervaloTempo;

// Elementos
const telaInicial   = document.getElementById('tela-inicial');
const telaJogo      = document.getElementById('tela-jogo');
const telaVitoria   = document.getElementById('tela-vitoria');
const tabuleiro     = document.getElementById('tabuleiro');
const hudFase       = document.getElementById('hud-fase');
const hudTempo      = document.getElementById('hud-tempo');
const hudPares      = document.getElementById('hud-pares');
const timerBar      = document.getElementById('timer-bar');

// Sons via Web Audio
function criarSom(freq, tipo='sine', dur=0.2, vol=0.3) {
  try {
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain= ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = tipo;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+dur);
    osc.start(); osc.stop(ctx.currentTime+dur);
  } catch(e){}
}

function somClick()   { criarSom(440,'sine',0.1,0.2); }
function somAcerto()  { [523,659,784].forEach((f,i)=>setTimeout(()=>criarSom(f,'sine',0.2,0.3),i*80)); }
function somErro()    { criarSom(150,'sawtooth',0.4,0.3); }
function somVitoria() { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>criarSom(f,'sine',0.3,0.4),i*100)); }

// ====== ESTRELAS DE FUNDO ======
const estBg = document.getElementById('estrelas-bg');
for(let i=0;i<60;i++){
  const s=document.createElement('div');s.className='estrela-bg';
  const sz=Math.random()*3+1;
  s.style.cssText=`width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*100}%;--d:${2+Math.random()*4}s;--o:${0.2+Math.random()*0.6};animation-delay:${Math.random()*5}s;position:fixed;`;
  estBg.appendChild(s);
}

// ====== PIPS DE FASE ======
const fasesPreview = document.getElementById('fases-preview');
fases.forEach((f,i)=>{
  const pip=document.createElement('div');
  pip.className='fase-pip'+(i===0?' ativa':'');
  pip.id='pip-'+i;
  pip.textContent=i+1;
  fasesPreview.appendChild(pip);
});

function atualizarPips(){
  fases.forEach((_,i)=>{
    const pip=document.getElementById('pip-'+i);
    pip.className='fase-pip'+(i<=faseAtual?' ativa':'');
  });
}

// ====== EVENTOS ======
document.getElementById('btnIniciar').addEventListener('click', iniciarJogo);
document.getElementById('btnContinuar').addEventListener('click', proximaFase);
document.getElementById('btnReiniciar').addEventListener('click', reiniciarJogo);

// ====== JOGO ======
function iniciarJogo(){
  telaInicial.classList.add('oculto');
  telaJogo.classList.remove('oculto');
  carregarFase();
}

function carregarFase(){
  acertos=0;
  const fase=fases[faseAtual];
  hudFase.textContent = `${faseAtual+1}/5`;
  hudPares.textContent = `0/${fase.pares}`;
  gerarCartas(fase.pares);
  tempoRestante=fase.tempo;
  atualizarTimerBar();
  hudTempo.textContent=tempoRestante+'s';
  iniciarContagem();
  atualizarPips();
}

function iniciarContagem(){
  clearInterval(intervaloTempo);
  const totalTempo=fases[faseAtual].tempo;
  intervaloTempo=setInterval(()=>{
    tempoRestante--;
    hudTempo.textContent=tempoRestante+'s';
    hudTempo.style.color = tempoRestante<=10 ? '#FF6B6B' : '#FF9F1C';
    timerBar.style.width=(tempoRestante/totalTempo*100)+'%';
    if(tempoRestante<=0){
      clearInterval(intervaloTempo);
      somErro();
      setTimeout(()=>{
        tabuleiro.querySelectorAll('.carta:not(.acertada)').forEach(c=>{
          c.style.animation='errouShake .5s ease';
        });
        setTimeout(()=>reiniciarFase(),700);
      },200);
    }
  },1000);
}

function atualizarTimerBar(){
  timerBar.style.transition='none';
  timerBar.style.width='100%';
  setTimeout(()=>timerBar.style.transition='width 1s linear',50);
}

function gerarCartas(qtdPares){
  tabuleiro.innerHTML='';
  const nomes=[
    "aguaviva","aguia","araraazul","cachorro","caranguejo","cavalo","cobra","coelho","elefante","esquilo",
    "flamingo","gato","girafa","guepardo","jacare","joaninha","leao","lobo","macaco","orca",
    "panda","pato","pavao","pinguin","raposa","rato","tartaruga","tucano","vaca","zebra"
  ];
  const imgs=shuffle(nomes).slice(0,qtdPares);
  const pares=shuffle([...imgs,...imgs]);
  ajustarGrade(pares.length);
  pares.forEach(nome=>{
    const carta=document.createElement('div');
    carta.className='carta';
    carta.innerHTML=`
      <div class="carta-inner">
        <div class="carta-verso"></div>
        <div class="carta-frente"><img src="/img/${nome}.jpg" alt="${nome}" loading="lazy"></div>
      </div>`;
    carta.addEventListener('click',()=>virarCarta(carta,nome));
    tabuleiro.appendChild(carta);
    // Animação de entrada
    carta.style.opacity='0';carta.style.transform='scale(0.5)';
    setTimeout(()=>{
      carta.style.transition='all .4s cubic-bezier(.34,1.56,.64,1)';
      carta.style.opacity='1';carta.style.transform='scale(1)';
    },Math.random()*400+50);
  });
}

function ajustarGrade(total){
  const cols=total<=4?2:total<=8?4:total<=12?4:5;
  const sz=Math.min(100,Math.floor((Math.min(window.innerWidth,500)-cols*12)/cols));
  tabuleiro.style.gridTemplateColumns=`repeat(${cols},${sz}px)`;
  tabuleiro.querySelectorAll('.carta').forEach(c=>{
    c.style.width=sz+'px';c.style.height=sz+'px';
  });
}

function virarCarta(carta,nome){
  if(bloqueio||carta.classList.contains('virada')||carta.classList.contains('acertada')) return;
  carta.classList.add('virada');
  somClick();
  if(!primeiraCarta){
    primeiraCarta={carta,nome};
  } else {
    bloqueio=true;
    if(nome===primeiraCarta.nome){
      // ACERTO
      somAcerto();
      acertos++;
      hudPares.textContent=`${acertos}/${fases[faseAtual].pares}`;
      primeiraCarta.carta.classList.add('acertada');
      carta.classList.add('acertada');
      emitirParticulasAcerto(carta);
      emitirParticulasAcerto(primeiraCarta.carta);
      primeiraCarta=null; bloqueio=false;
      if(acertos===fases[faseAtual].pares) setTimeout(venceuFase,500);
    } else {
      // ERRO
      somErro();
      carta.classList.add('errada');
      primeiraCarta.carta.classList.add('errada');
      setTimeout(()=>{
        carta.classList.remove('virada','errada');
        primeiraCarta.carta.classList.remove('virada','errada');
        primeiraCarta=null; bloqueio=false;
      },1000);
    }
  }
}

function emitirParticulasAcerto(cartaEl){
  const rect=cartaEl.getBoundingClientRect();
  const cx=rect.left+rect.width/2, cy=rect.top+rect.height/2;
  const cores=['#6BCB77','#FFD93D','#4D96FF','#FF6B6B','#C77DFF'];
  for(let i=0;i<10;i++){
    const p=document.createElement('div');
    const angle=(i/10)*Math.PI*2;
    const dist=40+Math.random()*40;
    p.style.cssText=`position:fixed;left:${cx}px;top:${cy}px;width:${6+Math.random()*6}px;height:${6+Math.random()*6}px;border-radius:50%;background:${cores[Math.floor(Math.random()*cores.length)]};z-index:400;pointer-events:none;animation:confQueda .8s ease-out forwards;transform-origin:center;`;
    const tx=Math.cos(angle)*dist, ty=Math.sin(angle)*dist;
    p.animate([
      {transform:`translate(0,0) scale(1)`,opacity:1},
      {transform:`translate(${tx}px,${ty}px) scale(0)`,opacity:0}
    ],{duration:600,easing:'ease-out',fill:'forwards'});
    document.body.appendChild(p);
    setTimeout(()=>p.remove(),700);
  }
}

function venceuFase(){
  clearInterval(intervaloTempo);
  somVitoria();
  dispararConfete();
  const vit=document.getElementById('vit-titulo');
  const sub=document.getElementById('vit-sub');
  const emo=document.getElementById('vit-emoji');
  if(faseAtual>=fases.length-1){
    emo.textContent='🏆';vit.textContent='Parabéns, Campeão!';
    sub.textContent='Você completou TODAS as fases! Você é incrível! 🎊';
    document.getElementById('btnContinuar').style.display='none';
  } else {
    emo.textContent='🎉';vit.textContent='Fase Concluída!';
    sub.textContent=`Próxima fase: ${fases[faseAtual+1].nome}`;
    document.getElementById('btnContinuar').style.display='inline-block';
  }
  telaJogo.classList.add('oculto');
  telaVitoria.classList.remove('oculto');
}

function dispararConfete(){
  const cores=['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#C77DFF','#FF9F1C'];
  for(let i=0;i<50;i++){
    const c=document.createElement('div');
    c.className='conf';
    c.style.cssText=`left:${Math.random()*100}vw;top:-20px;width:${8+Math.random()*10}px;height:${8+Math.random()*10}px;border-radius:${Math.random()>.5?'50%':'3px'};background:${cores[Math.floor(Math.random()*cores.length)]};animation-duration:${1.5+Math.random()*2}s;animation-delay:${Math.random()*.8}s;position:fixed;pointer-events:none;z-index:500;`;
    document.body.appendChild(c);
    setTimeout(()=>c.remove(),3500);
  }
}

function proximaFase(){
  if(faseAtual<fases.length-1){
    faseAtual++;
    telaVitoria.classList.add('oculto');
    telaJogo.classList.remove('oculto');
    carregarFase();
  }
}

function reiniciarJogo(){
  faseAtual=0;
  telaVitoria.classList.add('oculto');
  telaInicial.classList.remove('oculto');
  document.getElementById('btnContinuar').style.display='inline-block';
  atualizarPips();
}

function reiniciarFase(){
  telaJogo.classList.add('oculto');
  telaInicial.classList.remove('oculto');
}

function shuffle(arr){ return arr.sort(()=>Math.random()-.5); }

