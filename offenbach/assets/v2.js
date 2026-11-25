(function(){
  var px=[],pr=document.querySelector('.progress');
  document.querySelectorAll('.parallax').forEach(function(e){var bg=e.style.backgroundImage;if(!bg)return;var l=document.createElement('div');l.className='pxl';l.style.backgroundImage=bg;e.insertBefore(l,e.firstChild);e.style.backgroundImage='';px.push(l)});
  document.querySelectorAll('.zoom').forEach(function(e){var bg=e.style.backgroundImage;if(!bg)return;var l=document.createElement('div');l.className='zi';l.style.backgroundImage=bg;l.style.backgroundPosition=e.style.backgroundPosition||'';e.style.backgroundImage='';e.style.backgroundPosition='';e.classList.add('zw');e.insertBefore(l,e.firstChild)});
  function onScroll(){var y=window.scrollY,vh=window.innerHeight;
    if(pr){var d=document.documentElement.scrollHeight-vh;pr.style.width=(d>0?y/d*100:0)+'%'}
    px.forEach(function(e){var r=e.parentNode.getBoundingClientRect();if(r.bottom<-200||r.top>vh+200)return;var off=(r.top+r.height/2-vh/2)*-0.16;e.style.transform='translate3d(0,'+off.toFixed(1)+'px,0)'})}
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  var jl=[].slice.call(document.querySelectorAll('.jump a'));
  if(jl.length&&'IntersectionObserver' in window){var io2=new IntersectionObserver(function(a){a.forEach(function(x){if(x.isIntersecting){jl.forEach(function(l){l.classList.toggle('on',l.getAttribute('href')==='#'+x.target.id)})}})},{rootMargin:'-30% 0px -60% 0px'});document.querySelectorAll('.mgroup').forEach(function(g){io2.observe(g)})}
  var lb=document.querySelector('.lb');
  if(lb){var im=lb.querySelector('img');document.querySelectorAll('[data-lb]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();im.src=a.getAttribute('href');lb.classList.add('on')})});lb.addEventListener('click',function(){lb.classList.remove('on')});document.addEventListener('keydown',function(e){if(e.key==='Escape')lb.classList.remove('on')})}
})();
