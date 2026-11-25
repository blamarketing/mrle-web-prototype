(function(){
  var h=document.querySelector('.site-header'),t=document.querySelector('.totop');
  function onScroll(){var y=window.scrollY;if(h)h.classList.toggle('solid',y>140);if(t)t.classList.toggle('on',y>500)}
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  var b=document.querySelector('.burger'),n=document.querySelector('.nav');
  if(b&&n){b.addEventListener('click',function(){n.classList.toggle('open');b.setAttribute('aria-expanded',n.classList.contains('open'))});
    n.addEventListener('click',function(e){if(e.target.tagName==='A'&&!e.target.parentNode.classList.contains('has-sub'))n.classList.remove('open')})}
  if(t)t.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'})});
  var els=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){var io=new IntersectionObserver(function(a){a.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{threshold:.12});els.forEach(function(e){io.observe(e)})}
  else els.forEach(function(e){e.classList.add('in')});
  var sl=document.querySelectorAll('.hero-slider .slide');
  if(sl.length>1){var i=0;setInterval(function(){var cur=sl[i];i=(i+1)%sl.length;var nx=sl[i];cur.classList.remove('on');cur.classList.add('out');nx.classList.remove('out');void nx.offsetWidth;nx.classList.add('on');setTimeout(function(){cur.classList.remove('out')},1800)},6500)}
})();
