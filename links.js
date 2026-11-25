/* 강의안 안의 글자 주소를 클릭하면 새 탭으로 열리게 합니다. */
(function(){
  function wrap(el){
    var t=(el.textContent||'').trim();
    if(!/^https?:\/\/\S+$/.test(t)||el.querySelector('a')||el.closest('a'))return;
    if(el.tagName==='P'&&el.children.length)return;
    var a=document.createElement('a');
    a.href=t;a.target='_blank';a.rel='noopener';a.textContent=t;
    a.style.cssText='color:inherit;text-decoration:underline;text-decoration-color:rgba(31,122,120,.5);text-underline-offset:3px;cursor:pointer';
    el.textContent='';el.appendChild(a);
  }
  function run(){
    document.querySelectorAll('code.url,p').forEach(wrap);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
