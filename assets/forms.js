/* Formulare (Prototyp): Tischreservierung und Online-Bestellung zum Abholen.
   Es wird nichts versendet. Später an WordPress-Formular bzw. Reservierungssystem (Viet360) anbinden. */
(function(){
  // ---- Öffnungszeiten (aus der bisherigen Website) ----
  var HOURS={1:[['11:30','15:00'],['17:00','22:00']],2:[['11:30','15:00'],['17:00','22:00']],3:[['11:30','15:00'],['17:00','22:00']],4:[['11:30','15:00'],['17:00','22:00']],5:[['11:30','22:30']],6:[['11:30','22:30']],0:[['11:30','22:30']]};
  var RES_LAST_MIN=60;   // letzte Reservierung: Schließzeit minus 60 Min.  (OFFEN: vom Restaurant bestätigen lassen)
  var PICK_LAST_MIN=30;  // letzte Abholung: Schließzeit minus 30 Min.     (OFFEN)
  var PICK_LEAD_MIN=30;  // frühestens in 30 Min. abholbereit              (OFFEN)
  function m(t){var a=t.split(':');return +a[0]*60+ +a[1]}
  function hm(x){var h=Math.floor(x/60),n=x%60;return (h<10?'0':'')+h+':'+(n<10?'0':'')+n}
  function slots(d,step,lastMin,notBefore){var out=[],w=HOURS[d.getDay()];w.forEach(function(r){for(var t=m(r[0]);t<=m(r[1])-lastMin;t+=step){if(notBefore==null||t>=notBefore)out.push(hm(t))}});return out}
  function iso(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
  function de(d){return d.toLocaleDateString('de-DE',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
  function eur(n){return n.toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})+' €'}
  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return [].slice.call((r||document).querySelectorAll(s))}
  function flag(el,bad,msg){var w=el.closest('.fw')||el.parentNode;w.classList.toggle('has-err',bad);el.classList.toggle('f-err',bad);var m2=w.querySelector('.f-msg');if(m2&&msg)m2.textContent=msg}
  function okMail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)}
  function okTel(v){return v.replace(/[^\d]/g,'').length>=6}

  // ================= Tischreservierung =================
  var rf=document.getElementById('resform');
  if(rf){
    var date=$('#r-date',rf),time=$('#r-time',rf),mehr=$('#r-mehr'),ok=$('#r-ok');
    var today=new Date();today.setHours(0,0,0,0);var max=new Date(today);max.setDate(max.getDate()+120);
    date.min=iso(today);date.max=iso(max);
    function fillTimes(){
      var v=date.value;time.innerHTML='<option value="">Uhrzeit wählen</option>';
      if(!v){time.disabled=true;return}
      var d=new Date(v+'T12:00:00');var now=new Date();var nb=(iso(d)===iso(now))?(now.getHours()*60+now.getMinutes()+PICK_LEAD_MIN):null;
      var s=slots(d,30,RES_LAST_MIN,nb);
      if(!s.length){time.innerHTML='<option value="">Keine freien Zeiten – bitte anrufen</option>';time.disabled=true;return}
      s.forEach(function(t){var o=document.createElement('option');o.value=t;o.textContent=t+' Uhr';time.appendChild(o)});time.disabled=false;
    }
    date.addEventListener('change',fillTimes);fillTimes();
    $$('input[name=personen]',rf).forEach(function(i){i.addEventListener('change',function(){var on=(i.value==='mehr'&&i.checked);mehr.style.display=on?'block':'none';if(on){var an=$('#r-anzahl');setTimeout(function(){an.focus()},50)}$('.pw').classList.remove('has-err')})});
    rf.addEventListener('submit',function(e){
      e.preventDefault();var bad=false;
      if($('.hp input',rf).value)return;
      var pers=$('input[name=personen]:checked',rf);var pw=$('.pw');pw.classList.toggle('has-err',!pers);if(!pers)bad=true;var anz=0;if(pers&&pers.value==='mehr'){var ael=$('#r-anzahl');anz=parseInt(ael.value,10);var abad=!(anz>=9&&anz<=200);flag(ael,abad,'Bitte eine Zahl zwischen 9 und 200 eingeben.');if(abad)bad=true}
      [['#r-date',!date.value,'Bitte ein Datum wählen.'],['#r-time',!time.value,'Bitte eine Uhrzeit wählen.'],['#r-name',!$('#r-name').value.trim(),'Bitte Ihren Namen angeben.'],['#r-tel',!okTel($('#r-tel').value),'Bitte eine gültige Telefonnummer angeben.'],['#r-mail',!okMail($('#r-mail').value.trim()),'Bitte eine gültige E-Mail-Adresse angeben.']].forEach(function(c){var el=$(c[0]);flag(el,c[1],c[2]);if(c[1])bad=true});
      var okw=ok.closest('.fw');okw.classList.toggle('has-err',!ok.checked);if(!ok.checked)bad=true;
      if(bad){var f=$('.has-err,.f-err',rf);if(f)f.scrollIntoView({block:'center',behavior:'smooth'});return}
      var d=new Date(date.value+'T12:00:00');
      $('#s-when').textContent=de(d)+', '+time.value+' Uhr';
      $('#s-pers').textContent=pers.value==='mehr'?anz+' Personen (wir melden uns bei Ihnen)':pers.value+(pers.value==='1'?' Person':' Personen');
      $('#s-name').textContent=$('#r-name').value.trim();$('#s-mail').textContent=$('#r-mail').value.trim();
      rf.style.display='none';$('#r-head').style.display='none';$('#r-success').classList.add('on');$('#r-success').scrollIntoView({block:'center',behavior:'smooth'});
    });
    $$('input,select,textarea',rf).forEach(function(el){el.addEventListener('input',function(){flag(el,false)})});
  }

  // ================= Online-Bestellung =================
  var cartEl=document.getElementById('ocart');
  if(cartEl&&window.MENU){
    var KEY='mrle_cart_v1',cart={};try{cart=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
    var byId={},menuEl=document.getElementById('omenu');
    function slug(s){return s.toLowerCase().replace(/[^a-zäöüß0-9]+/g,'-').replace(/^-|-$/g,'')}
    var html='',chips='';
    MENU.forEach(function(c){
      chips+='<a href="#cat-'+slug(c.n)+'">'+c.n+'</a>';
      html+='<section class="ocat" id="cat-'+slug(c.n)+'" data-cat><h2><span>'+c.n+'</span>'+(c.note?'<small>'+c.note+'</small>':'')+'</h2>';
      c.items.forEach(function(it){byId[it.id]=it;
        html+='<div class="oi" data-id="'+it.id+'" data-s="'+(it.n+' '+it.d).toLowerCase().replace(/"/g,'')+'"><div><div class="oi-name">'+(it.no?'<span class="oi-num">'+it.no+'</span>':'')+it.n+'</div>'+(it.d?'<div class="oi-desc">'+it.d+'</div>':'')+'</div><div class="oi-price">'+eur(it.p)+'</div><div class="oi-act"></div></div>'});
      html+='</section>';
    });
    menuEl.innerHTML=html+'<div class="nores" id="nores">Keine Treffer. Bitte anderen Suchbegriff versuchen.</div>';
    document.getElementById('ochips').innerHTML=chips;

    function save(){try{localStorage.setItem(KEY,JSON.stringify(cart))}catch(e){}}
    function count(){var n=0;for(var k in cart)n+=cart[k];return n}
    function total(){var t=0;for(var k in cart)t+=cart[k]*byId[k].p;return t}
    function setQty(id,q){if(q<=0)delete cart[id];else cart[id]=Math.min(q,20);save();render()}
    function render(){
      $$('.oi',menuEl).forEach(function(r){var id=r.dataset.id,q=cart[id]||0,a=$('.oi-act',r);
        r.classList.toggle('in-cart',q>0);
        a.innerHTML=q>0?'<div class="qty"><button data-a="-" aria-label="Weniger">−</button><span>'+q+'</span><button data-a="+" aria-label="Mehr">+</button></div>':'<button class="oi-add" data-a="+" aria-label="Hinzufügen">+</button>'});
      var list=$('#cl'),ids=Object.keys(cart);
      list.innerHTML=ids.length?ids.map(function(id){var it=byId[id],q=cart[id];return '<div class="cli" data-id="'+id+'"><div class="nm">'+it.n+'</div><div class="pr">'+eur(q*it.p)+'</div><div class="qty"><button data-a="-" aria-label="Weniger">−</button><span>'+q+'</span><button data-a="+" aria-label="Mehr">+</button></div><button class="rm" data-a="x">entfernen</button></div>'}).join(''):'<div class="cl-empty">Ihr Warenkorb ist leer.<br>Wählen Sie Gerichte aus der Karte.</div>';
      $('#ctotal').textContent=eur(total());$('#ccount').textContent=count()+(count()===1?' Gericht':' Gerichte');
      $('#cb-n').textContent=count();$('#cb-t').textContent=eur(total());
      $('#csend').disabled=!count();$('.cartbar').style.visibility=count()?'visible':'hidden';
    }
    document.addEventListener('click',function(e){
      var b=e.target.closest('[data-a]');if(!b)return;var r=b.closest('[data-id]');if(!r)return;var id=r.dataset.id,a=b.dataset.a;
      if(a==='+')setQty(id,(cart[id]||0)+1);else if(a==='-')setQty(id,(cart[id]||0)-1);else if(a==='x')setQty(id,0)});
    // Suche
    $('#osearch').addEventListener('input',function(){var q=this.value.trim().toLowerCase(),any=false;
      $$('.ocat',menuEl).forEach(function(c){var v=0;$$('.oi',c).forEach(function(r){var s=!q||r.dataset.s.indexOf(q)>-1;r.style.display=s?'':'none';if(s)v++});c.style.display=v?'':'none';if(v)any=true});$('#nores').style.display=any?'none':'block'});
    // aktive Kategorie
    var cl=$$('#ochips a');if('IntersectionObserver' in window){var io=new IntersectionObserver(function(a){a.forEach(function(x){if(x.isIntersecting)cl.forEach(function(l){l.classList.toggle('on',l.getAttribute('href')==='#'+x.target.id)})})},{rootMargin:'-25% 0px -65% 0px'});$$('.ocat',menuEl).forEach(function(c){io.observe(c)})}
    // Abholzeit
    var pd=$('#o-date'),pt=$('#o-time'),today=new Date();today.setHours(12,0,0,0);
    for(var i=0;i<7;i++){var d=new Date(today);d.setDate(d.getDate()+i);var o=document.createElement('option');o.value=iso(d);o.textContent=(i===0?'Heute, ':i===1?'Morgen, ':'')+d.toLocaleDateString('de-DE',{weekday:'long',day:'numeric',month:'long'});pd.appendChild(o)}
    function fillPick(){var d=new Date(pd.value+'T12:00:00'),now=new Date(),nb=(iso(d)===iso(now))?(now.getHours()*60+now.getMinutes()+PICK_LEAD_MIN):null,s=slots(d,15,PICK_LAST_MIN,nb);
      pt.innerHTML='<option value="">Uhrzeit wählen</option>'+s.map(function(t){return '<option value="'+t+'">'+t+' Uhr</option>'}).join('');if(!s.length)pt.innerHTML='<option value="">Heute nicht mehr möglich</option>'}
    pd.addEventListener('change',fillPick);fillPick();
    // Mobil: Warenkorb ein-/ausblenden
    $('.cartbar').addEventListener('click',function(){cartEl.classList.add('open')});
    $('.cart-close').addEventListener('click',function(){cartEl.classList.remove('open')});
    // Senden
    $('#oform').addEventListener('submit',function(e){
      e.preventDefault();if($('.hp input',this).value||!count())return;var bad=false;
      [['#o-time',!pt.value,'Bitte eine Abholzeit wählen.'],['#o-name',!$('#o-name').value.trim(),'Bitte Ihren Namen angeben.'],['#o-tel',!okTel($('#o-tel').value),'Bitte eine gültige Telefonnummer angeben.'],['#o-mail',!okMail($('#o-mail').value.trim()),'Bitte eine gültige E-Mail-Adresse angeben.']].forEach(function(c){var el=$(c[0]);flag(el,c[1],c[2]);if(c[1])bad=true});
      var okw=$('#o-ok').closest('.fw');okw.classList.toggle('has-err',!$('#o-ok').checked);if(!$('#o-ok').checked)bad=true;
      if(bad){var f=$('#oform .has-err,#oform .f-err');if(f)f.scrollIntoView({block:'center',behavior:'smooth'});return}
      var d=new Date(pd.value+'T12:00:00');
      $('#os-when').textContent=d.toLocaleDateString('de-DE',{weekday:'long',day:'numeric',month:'long'})+', '+pt.value+' Uhr';
      $('#os-sum').textContent=count()+(count()===1?' Gericht':' Gerichte')+', '+eur(total());$('#os-name').textContent=$('#o-name').value.trim();
      cart={};save();render();$('#ocart-main').style.display='none';$('#osuccess').classList.add('on');cartEl.classList.add('open')});
    $('#osuccess-close').addEventListener('click',function(){$('#osuccess').classList.remove('on');$('#ocart-main').style.display='';cartEl.classList.remove('open')});
    $$('#oform input,#oform select,#oform textarea').forEach(function(el){el.addEventListener('input',function(){flag(el,false)})});
    render();
  }
})();
