/* 따라오기: 강의자 화면(?teacher)의 쪽을 선생님 화면이 따라갑니다. */
(function(){
var API='https://script.google.com/macros/s/AKfycbw6Nq6KYybKtnABFFqyVhE4ER6A-SAmQJBx2FBmz8jNeeeHyaWRAXvAoFOsbld6k9RwyQ/exec';
var deck=location.pathname.replace(/\//g,'')||'';
if(!/^lecture[0-9]?$/.test(deck))return;
var teacher=/[?&]teacher\b/.test(location.search);
var cnt=document.getElementById('cnt');
if(!cnt)return;
function cur(){var m=/^(\d+)/.exec(cnt.textContent||'');return m?parseInt(m[1],10):1}
function api(params){
  return fetch(API+'?'+Object.keys(params).map(function(k){return k+'='+encodeURIComponent(params[k])}).join('&'),{cache:'no-store'}).then(function(r){return r.json()});
}
var pill=document.createElement('div');
pill.style.cssText='position:fixed;top:54px;right:12px;z-index:99;display:flex;gap:8px;align-items:center;font:700 13px "IBM Plex Sans KR",sans-serif;background:#fffdf8;border:1px solid #e0d8c6;border-radius:99px;padding:6px 8px 6px 14px;box-shadow:0 4px 14px rgba(0,0,0,.12)';
var label=document.createElement('span'),btn=document.createElement('button');
btn.style.cssText='font:inherit;border:0;border-radius:99px;padding:6px 14px;color:#fff;background:#1f7a78;cursor:pointer';
pill.appendChild(label);pill.appendChild(btn);document.body.appendChild(pill);

if(teacher){
  var KEY='lecture_pk',live=true,t=null;
  function askKey(msg){var k=window.prompt(msg||'강의자 비밀번호를 입력하세요');if(k){try{localStorage.setItem(KEY,k.trim())}catch(e){}}return k&&k.trim()}
  function key(){var k=null;try{k=localStorage.getItem(KEY)}catch(e){}return k||askKey()}
  function paint(){label.textContent=live?'강의자 · 선생님 화면 연동 중':'강의자 · 연동 멈춤';btn.textContent=live?'연동 끝내기':'연동 다시 시작';btn.style.background=live?'#a8432c':'#1f7a78'}
  function push(){
    var k=key();if(!k)return;
    api({action:'set',deck:deck,page:cur(),live:live?1:0,key:k}).then(function(d){
      if(d.ok)return;
      if(d.error==='badkey'){try{localStorage.removeItem(KEY)}catch(e){}label.textContent='비밀번호가 맞지 않습니다';}
      else if(d.error==='nokey'){label.textContent='시트 메뉴에서 강의자 비밀번호를 먼저 설정하세요';}
    }).catch(function(){label.textContent='연결 실패 · 다시 시도 중'});
  }
  new MutationObserver(function(){clearTimeout(t);t=setTimeout(push,250)}).observe(cnt,{childList:true,characterData:true,subtree:true});
  btn.onclick=function(){live=!live;paint();push()};
  paint();push();
  setInterval(push,60000);   // 늦게 들어온 사람도 이어서 따라올 수 있게 가끔 다시 알림
}else{
  var following=true,remote={page:0,live:false},prog=0;
  function paintL(){
    if(!remote.live){pill.style.display='none';return}
    pill.style.display='flex';
    if(following){label.textContent='강의자 화면을 따라가는 중';btn.textContent='따라오기 끄기';btn.style.background='#6b6559'}
    else{label.textContent='혼자 보는 중';btn.textContent='강의자 화면 따라가기';btn.style.background='#1f7a78'}
  }
  function follow(){
    if(!following||!remote.live||!remote.page)return;
    if(remote.page!==cur()){prog=Date.now();location.hash='#s'+remote.page}
  }
  new MutationObserver(function(){
    if(Date.now()-prog<1500)return;        // 따라가며 생긴 변화는 무시
    if(following&&remote.live){following=false;paintL()}   // 직접 넘기면 따라오기 끔
  }).observe(cnt,{childList:true,characterData:true,subtree:true});
  btn.onclick=function(){following=!following;paintL();follow()};
  function poll(){
    api({action:'state',deck:deck}).then(function(d){
      if(d&&d.ok){remote=d;paintL();follow()}
    }).catch(function(){});
  }
  pill.style.display='none';poll();setInterval(poll,3000);
}
})();
