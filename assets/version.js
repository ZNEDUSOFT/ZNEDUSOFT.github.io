(function(){
  var TTL=10*60*1000;
  function fmt(d){ try{return new Date(d).toLocaleDateString('ar-MA-u-nu-latn',{day:'numeric',month:'long',year:'numeric'});}catch(e){return String(d).slice(0,10);} }
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function inl(s){return esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/`(.+?)`/g,'<code>$1</code>');}
  function md(t){
    var out=[],ul=false,lines=String(t||'').replace(/\r/g,'').split('\n');
    function close(){if(ul){out.push('</ul>');ul=false;}}
    lines.forEach(function(l){
      var m;
      if((m=l.match(/^\s*[-*•]\s+(.*)/))){ if(!ul){out.push('<ul>');ul=true;} out.push('<li>'+inl(m[1])+'</li>'); }
      else if((m=l.match(/^#{1,6}\s+(.*)/))){ close(); out.push('<h4>'+inl(m[1])+'</h4>'); }
      else if(l.trim()===''){ close(); }
      else { close(); out.push('<p>'+inl(l)+'</p>'); }
    });
    close(); return out.join('');
  }
  function run(list,repo){
    if(!list||!list.length) return;
    var r=list[0];
    document.querySelectorAll('.hv[data-repo="'+repo+'"]').forEach(function(h){ h.textContent='الإصدار '+r.tag_name; h.hidden=false; });
    var el=document.getElementById('ver');
    if(el&&el.dataset.repo===repo){
      var box=document.getElementById('whatsnew');
      el.href=box?'#whatsnew':(r.html_url||'#'); el.innerHTML='';
      var b=document.createElement('b'); b.textContent='آخر إصدار: '+r.tag_name; el.appendChild(b);
      if(r.published_at){var s=document.createElement('span'); s.textContent=' · نُشر في '+fmt(r.published_at); el.appendChild(s);}
      var m=document.createElement('em'); m.textContent='ما الجديد؟ ←'; el.appendChild(m); el.hidden=false;
      var out=document.getElementById('notes');
      if(box&&out){
        out.innerHTML=list.map(function(x,i){
          return '<article class="rel'+(i?'':' cur')+'"><h3>'+esc(x.tag_name)+(i?'':' <small class="newtag">الأحدث</small>')+'</h3>'+(x.published_at?'<div class="rd">نُشر في '+esc(fmt(x.published_at))+'</div>':'')+(x.body&&x.body.trim()?md(x.body):'<p class="rd">لا توجد ملاحظات لهذا الإصدار.</p>')+'</article>';
        }).join('');
        box.hidden=false;
        if(location.hash==='#whatsnew') box.scrollIntoView();
      }
    }
  }
  function go(repo){
    var key='rels:'+repo;
    try{var c=JSON.parse(sessionStorage.getItem(key)||'null'); if(c&&Date.now()-c.t<TTL){run(c.l,repo);return;}}catch(e){}
    fetch('https://api.github.com/repos/'+repo+'/releases?per_page=6',{headers:{'Accept':'application/vnd.github+json'}})
      .then(function(x){return x.ok?x.json():null}).then(function(a){
        if(!a) return;
        var l=a.filter(function(x){return !x.draft&&!x.prerelease;}).slice(0,5).map(function(x){return {tag_name:x.tag_name,published_at:x.published_at,html_url:x.html_url,body:x.body||''};});
        try{sessionStorage.setItem(key,JSON.stringify({t:Date.now(),l:l}));}catch(e){}
        run(l,repo);
      }).catch(function(){});
  }
  var seen={};
  document.querySelectorAll('[data-repo]').forEach(function(e){var r=e.dataset.repo; if(!seen[r]){seen[r]=1;go(r);}});
})();
