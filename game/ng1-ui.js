(()=> {
  const style=document.createElement('style');
  style.id='ng1RuntimePolish';
  style.textContent=`
    /* Load after game-nav's injected styles so the dashboard has one consistent layout. */
    .topbar{padding:0 clamp(18px,4vw,56px);min-height:72px}
    .top-actions .glass-button{display:flex}
    .account-pill{max-width:none;padding:0 12px;border-radius:13px}
    .account-pill #accountName{display:inline}
    .avatar{width:28px;height:28px}
    .hero{grid-template-columns:minmax(0,1fr) 280px;min-height:0;padding:clamp(24px,5vw,48px)}
    .hero-copy{display:block}
    .hero h1{font-size:clamp(34px,6vw,60px);max-width:760px}
    .stats-grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
    .stat{padding:20px;min-height:98px}
    .stat small{display:block}
    .stat b{font-size:23px}
    .stat span{font-size:21px}
    .section-head{margin-top:38px}
    .section-head h2{font-size:clamp(21px,2.4vw,28px)}
    .games-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
    .game-art{height:clamp(160px,22vw,230px)}
    .game-body p{display:block;height:auto;min-height:42px}
    .achievements-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
    .achievements-grid .achievement{padding:16px}
    .achievements-grid .achievement small{display:block}
    body[data-game-view="home"] #phase2,body[data-game-view="home"] #phase3,body[data-game-view="home"] #gameSocial{display:none}
    @media(max-width:850px){.hero{grid-template-columns:1fr}.games-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.achievements-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:580px){.topbar{min-height:64px;padding:0 12px}.account-pill{max-width:44px;padding:4px}.account-pill #accountName{display:none}.avatar{width:34px;height:34px}.hero{padding:23px 20px}.hero h1{font-size:clamp(32px,9vw,42px)}.stats-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.stat{min-height:82px;padding:13px}.stat small{display:block}.stat b{font-size:21px}.stat span{font-size:18px}.games-grid{grid-template-columns:1fr;gap:13px}.game-art{height:150px}.game-body p{display:block}.achievements-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.achievements-grid .achievement{padding:13px}.achievements-grid .achievement small{display:block}}
    @media(max-width:360px){.brand{font-size:13px}.top-actions{gap:6px}.glass-button{padding:0 10px}}
  `;
  document.head.appendChild(style);

  const playable=new Set(['2048','red-dash']);
  const filterLibrary=()=>{
    const grid=document.getElementById('gameLibraryGrid');
    if(!grid)return;
    grid.querySelectorAll('[data-library-game]').forEach(card=>{
      const id=card.dataset.libraryGame;
      if(!playable.has(id))card.remove();
    });
    const count=document.querySelector('.game-library-count');
    if(count)count.textContent='2 GAMES';
  };
  filterLibrary();
  const grid=document.getElementById('gameLibraryGrid');
  if(grid)new MutationObserver(filterLibrary).observe(grid,{childList:true});
})();