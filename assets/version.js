(function(){
  var el=document.getElementById('ver'); if(!el||!el.dataset.repo) return;
  var repo=el.dataset.repo, key='ver:'+repo, TTL=10*60*1000;
  function fmt(d){
    try{return new Date(d).toLocaleDateString('ar-MA-u-nu-latn',{day:'numeric',month:'long',year:'numeric'});}
    catch(e){return new Date(d).toISOString().slice(0,10);}
  }
  function show(r){
    if(!r||!r.tag_name) return;
    el.href=r.html_url||('https://github.com/'+repo+'/releases/latest');
    el.target='_blank'; el.rel='noopener';
    el.innerHTML='';
    var b=document.createElement('b'); b.textContent='آخر إصدار: '+r.tag_name; el.appendChild(b);
    if(r.published_at){var s=document.createElement('span'); s.textContent=' · نُشر في '+fmt(r.published_at); el.appendChild(s);}
    var m=document.createElement('em'); m.textContent='ما الجديد؟ ←'; el.appendChild(m);
    el.hidden=false;
  }
  try{var c=JSON.parse(sessionStorage.getItem(key)||'null'); if(c&&Date.now()-c.t<TTL){show(c.r);return;}}catch(e){}
  fetch('https://api.github.com/repos/'+repo+'/releases/latest',{headers:{'Accept':'application/vnd.github+json'}})
    .then(function(x){return x.ok?x.json():null})
    .then(function(r){
      if(!r) return;
      var o={tag_name:r.tag_name,published_at:r.published_at,html_url:r.html_url};
      try{sessionStorage.setItem(key,JSON.stringify({t:Date.now(),r:o}));}catch(e){}
      show(o);
    }).catch(function(){});
})();
