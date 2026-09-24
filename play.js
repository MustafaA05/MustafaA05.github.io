// Pixel-universe flight, gravity playground, and spaceship repair.
(()=>{
 const universe=$('#universe'),ship=$('#ufo');
 universe.insertAdjacentHTML('beforeend',`<div id="space-controls" aria-label="Universe controls"><button id="gravity-toggle" aria-pressed="false">LOW GRAVITY</button><button id="reset-orbit" hidden>RESET PLANETS</button></div><div id="touch-flight" aria-label="UFO flight controls"><button data-flight="ArrowUp" aria-label="Fly up">↑</button><button data-flight="ArrowLeft" aria-label="Fly left">←</button><button data-flight="ArrowDown" aria-label="Fly down">↓</button><button data-flight="ArrowRight" aria-label="Fly right">→</button></div><p id="flight-hint">WASD / ARROWS TO FLY</p><p id="space-toast" role="status"></p><button id="derelict" aria-label="Investigate drifting damaged spaceship"><span class="sprite"></span><span class="distress">SOS</span></button><dialog id="repair-dialog" aria-labelledby="repair-title"><button class="dialog-close" aria-label="Close repair puzzle">×</button><p class="eyebrow">DISTRESS SIGNAL / ENGINE OFFLINE</p><h2 id="repair-title">A little roadside assistance?</h2><p>Rotate the circuit pieces to connect the power supply to the engine through all nine pieces.</p><div class="circuit-labels"><span>POWER ↓</span><span>↓ ENGINE</span></div><div id="circuit"></div><p id="repair-status" role="status">Click a piece to rotate it.</p><button id="repair-reset">RESET CIRCUIT</button></dialog>`);
 const gravityPlanets=planets;
 const state=window.play={manual:false,gravity:false,beforeLand(i){state.manual=false;keys.clear();ship.classList.remove('manual-flight');if(bodies[i]){bodies[i].vx=0;bodies[i].vy=0}$('#flight-hint').textContent='WASD / ARROWS TO FLY';},suppressClick(e){return e.detail!==0&&performance.now()<suppressUntil}};
 const keys=new Set(),directions={w:[0,-1],ArrowUp:[0,-1],s:[0,1],ArrowDown:[0,1],a:[-1,0],ArrowLeft:[-1,0],d:[1,0],ArrowRight:[1,0]};
 let x=0,y=0,vx=0,vy=0,last=0,suppressUntil=0,drag=null,bodies=[],toastTimer,repairDone=false,shipPhase=0;
 function toast(text){$('#space-toast').textContent=text;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#space-toast').textContent='',4500)}
 function dismissProjection(){++operation;selected=null;flyingTo=null;beamProgress=0;$('#hologram').hidden=true;$('#hologram').classList.remove('projected');$('#beam').classList.remove('active');$('#welcome').classList.remove('away');planets.forEach(p=>p.setAttribute('aria-pressed','false'))}
 function beginManual(){if(state.manual)return;dismissProjection();ship.classList.remove('landing');const r=ship.getBoundingClientRect();x=ufoEntered?Math.max(0,Math.min(innerWidth-r.width,r.left)):24;y=ufoEntered?r.top:universe.clientHeight*.55;ufoEntered=true;state.manual=true;ship.classList.add('manual-flight');$('#flight-hint').textContent='FLY FREELY · CLICK A PLANET TO LAND';reveal()}
 function modalOpen(){return !!document.querySelector('dialog[open]')}
 document.addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(!directions[k]||e.ctrlKey||e.metaKey||e.altKey||modalOpen()||e.target.closest('input,textarea,select,[contenteditable="true"]'))return;e.preventDefault();beginManual();if(!keys.has(k)){vx+=directions[k][0]*55;vy+=directions[k][1]*55}keys.add(k)});
 document.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));
 window.addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>{keys.clear();last=0});
 document.querySelectorAll('[data-flight]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();beginManual();keys.add(b.dataset.flight);b.setPointerCapture(e.pointerId)};b.onpointerup=b.onpointercancel=()=>keys.delete(b.dataset.flight)});
 const clamp=(v,a,b)=>Math.max(a,Math.min(Math.max(a,b),v));
 function bounds(b){return {maxX:innerWidth-b.w,maxY:universe.clientHeight-b.h-20}}
 function paintBodies(){bodies.forEach((b,i)=>{gravityPlanets[i].style.left=b.x+'px';gravityPlanets[i].style.top=b.y+'px'})}
 function locked(i){return selected===i||drag?.i===i}
 function resetGravity(){dismissProjection();state.gravity=false;drag=null;bodies=[];universe.classList.remove('gravity');gravityPlanets.forEach(p=>{p.style.left='';p.style.top='';p.style.width=''});$('#gravity-toggle').setAttribute('aria-pressed','false');$('#reset-orbit').hidden=true;$('#mobile-hint').textContent='SWIPE TO EXPLORE';toast('Planets back in orbit.')}
 $('#gravity-toggle').onclick=()=>{if(state.gravity){resetGravity();return}dismissProjection();const rects=planets.map(p=>p.getBoundingClientRect());state.gravity=true;universe.classList.add('gravity');bodies=rects.map((r,i)=>({x:clamp(r.left,0,innerWidth-Math.min(r.width,140)),y:clamp(r.top,115,universe.clientHeight-r.height-20),w:Math.min(r.width,140),h:r.height,vx:reduced?0:(i%2?12:-12),vy:reduced?0:-15-i*3}));bodies.forEach((b,i)=>{planets[i].style.width=b.w+'px';if(innerWidth<600){b.x=25+(i%2)*(innerWidth-180);b.y=145+Math.floor(i/2)*145}});paintBodies();$('#gravity-toggle').setAttribute('aria-pressed','true');$('#reset-orbit').hidden=false;$('#mobile-hint').textContent='DRAG TO TOSS · TAP TO LAND';reveal();toast('Toss planets or push them with your UFO. Click to land.')};
 $('#reset-orbit').onclick=resetGravity;
 gravityPlanets.forEach((p,i)=>{
  p.addEventListener('pointerdown',e=>{if(!state.gravity||e.button!==0||!bodies[i])return;const b=bodies[i];drag={i,id:e.pointerId,startX:e.clientX,startY:e.clientY,dx:e.clientX-b.x,dy:e.clientY-b.y,lastX:e.clientX,lastY:e.clientY,time:performance.now(),moved:false};p.setPointerCapture(e.pointerId)});
  p.addEventListener('pointermove',e=>{if(!drag||drag.i!==i||drag.id!==e.pointerId)return;const b=bodies[i];if(!drag.moved&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>6){drag.moved=true;if(selected===i||flyingTo===i){dismissProjection();ship.style.top=(parseFloat(ship.style.top)-35)+'px'}}if(!drag.moved)return;const now=performance.now(),dt=Math.max(.016,(now-drag.time)/1000);b.vx=clamp((e.clientX-drag.lastX)/dt,-420,420);b.vy=clamp((e.clientY-drag.lastY)/dt,-420,420);const limits=bounds(b);b.x=clamp(e.clientX-drag.dx,0,limits.maxX);b.y=clamp(e.clientY-drag.dy,110,limits.maxY);drag.lastX=e.clientX;drag.lastY=e.clientY;drag.time=now;paintBodies()});
  const release=e=>{if(!drag||drag.i!==i)return;if(drag.moved){suppressUntil=performance.now()+350;if(performance.now()-drag.time>100){bodies[i].vx=0;bodies[i].vy=0}}drag=null;if(p.hasPointerCapture(e.pointerId))p.releasePointerCapture(e.pointerId)};p.addEventListener('pointerup',release);p.addEventListener('pointercancel',release);
 });
 window.addEventListener('resize',()=>{x=clamp(x,0,innerWidth-ship.offsetWidth);y=clamp(y,80,universe.clientHeight-ship.offsetHeight);if(state.gravity){bodies.forEach(b=>{const l=bounds(b);b.x=clamp(b.x,0,l.maxX);b.y=clamp(b.y,110,l.maxY)});paintBodies()}});
 $('#derelict').querySelector('.sprite').outerHTML='<span class="sprite pixel-drifter" style="aspect-ratio:2/1"><img alt="" draggable="false" src="assets/pixel-drifter.png"></span>';
 function openDialog(id){keys.clear();$(id).showModal()}
 document.querySelectorAll('dialog .dialog-close').forEach(b=>b.onclick=()=>b.closest('dialog').close());
 // Rotate a real connected path through a 3×3 circuit. Bits are N/E/S/W.
 const initial=[10,12,6,10,6,9,6,5,3];let tiles=[...initial];
 const turn=n=>((n<<1)&15)|(n>>3);
 const wires=t=>[[1,'n'],[2,'e'],[4,'s'],[8,'w']].filter(([bit])=>t&bit).map(([,dir])=>`<span aria-hidden="true" class="wire wire-${dir}"></span>`).join('');
 function connected(){const seen=new Set(),queue=[];if(tiles[0]&1)queue.push(0);while(queue.length){const i=queue.shift();if(seen.has(i))continue;seen.add(i);for(const [bit,opposite,dx,dy] of [[1,4,0,-1],[2,8,1,0],[4,1,0,1],[8,2,-1,0]]){const xx=i%3+dx,yy=Math.floor(i/3)+dy,j=yy*3+xx;if(xx>=0&&xx<3&&yy>=0&&yy<3&&(tiles[i]&bit)&&(tiles[j]&opposite))queue.push(j)}}return seen}
 function paintCircuit(){const powered=connected();$('#circuit').innerHTML=tiles.map((t,i)=>`<button class="circuit-piece ${powered.has(i)?'powered':''}" data-cell="${i}" aria-label="Rotate circuit piece ${i+1}" ${repairDone?'disabled':''}>${wires(t)}</button>`).join('');if(powered.size===9&&powered.has(2)&&(tiles[2]&1)&&!repairDone){repairDone=true;$('#repair-status').textContent='POWER RESTORED. The crew owes you one.';$('#repair-title').textContent='Back among the stars.';$('#repair-reset').hidden=true;$('#circuit').querySelectorAll('button').forEach(b=>b.disabled=true);$('#repair-dialog .eyebrow').textContent='ENGINE ONLINE / CLEARED FOR DEPARTURE';$('#derelict').classList.add('repaired');toast('Spaceship repaired. Safe travels!')}}
 $('#circuit').onclick=e=>{const b=e.target.closest('[data-cell]');if(!b||repairDone)return;const i=+b.dataset.cell;tiles[i]=turn(tiles[i]);paintCircuit();$('#circuit').children[i]?.focus()};
 $('#repair-reset').onclick=()=>{tiles=[...initial];paintCircuit()};$('#derelict').onclick=()=>{paintCircuit();openDialog('#repair-dialog')};
 function pushPlanets(){
  if(!state.manual||modalOpen())return;
  const offsetX=ship.offsetWidth/2,offsetY=ship.offsetHeight*.58;
  const u={x:x+offsetX,y:y+offsetY,vx,vy,r:ship.offsetWidth*.3};
  bodies.forEach((b,i)=>{
   if(drag?.i===i)return;
   const p={x:b.x+b.w/2,y:b.y+53,vx:b.vx,vy:b.vy,r:44};
   if(!SpacePhysics.pushPlanet(u,p))return;
   b.x=p.x-b.w/2;b.y=p.y-53;b.vx=clamp(p.vx,-420,420);b.vy=clamp(p.vy,-420,420);
   const limit=bounds(b);b.x=clamp(b.x,0,limit.maxX);b.y=clamp(b.y,110,limit.maxY);
  });
  x=clamp(u.x-offsetX,0,innerWidth-ship.offsetWidth);y=clamp(u.y-offsetY,80,universe.clientHeight-ship.offsetHeight-10);vx=u.vx;vy=u.vy;
  ship.style.left=x+'px';ship.style.top=y+'px';
 }
 function frame(now){requestAnimationFrame(frame);if(document.hidden){last=0;return}const dt=Math.min(.035,last?(now-last)/1000:0);last=now;
  if(state.manual&&!modalOpen()){
   let ax=0,ay=0;for(const k of keys){ax+=directions[k][0];ay+=directions[k][1]}const length=Math.hypot(ax,ay)||1;vx=(vx+ax/length*800*dt)*Math.exp(-3.8*dt);vy=(vy+ay/length*800*dt)*Math.exp(-3.8*dt);x=clamp(x+vx*dt,0,innerWidth-ship.offsetWidth);y=clamp(y+vy*dt,80,universe.clientHeight-ship.offsetHeight-10);ship.style.left=x+'px';ship.style.top=y+'px';
  }
  if(state.gravity){bodies.forEach((b,i)=>{if(locked(i))return;const l=bounds(b);b.x+=b.vx*dt;b.y+=b.vy*dt;b.vx*=Math.exp(-.025*dt);b.vy*=Math.exp(-.025*dt);if(b.x<0||b.x>l.maxX){b.x=clamp(b.x,0,l.maxX);b.vx*=-.8}if(b.y<110||b.y>l.maxY){b.y=clamp(b.y,110,l.maxY);b.vy*=-.8}});for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){const a=bodies[i],b=bodies[j],dx=b.x+b.w/2-a.x-a.w/2,dy=b.y-a.y,dist=Math.hypot(dx,dy),min=95;if(dist>0&&dist<min){const nx=dx/dist,ny=dy/dist,over=(min-dist)/2;const lockedA=locked(i),lockedB=locked(j);if(!lockedA){a.x-=nx*over;a.y-=ny*over}if(!lockedB){b.x+=nx*over;b.y+=ny*over}const speed=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(speed<0){if(!lockedA){a.vx+=speed*nx*.85;a.vy+=speed*ny*.85}if(!lockedB){b.vx-=speed*nx*.85;b.vy-=speed*ny*.85}}}}pushPlanets();paintBodies();if(flyingTo!==null&&!state.manual)place(flyingTo);beam()}
  if(!reduced&&!modalOpen()){const speed=repairDone?170:9;shipPhase+=dt*speed;const heading=Math.atan2(Math.cos(now/8000)*17/8,speed)*180/Math.PI;$('#derelict').style.setProperty('--ship-heading',heading+'deg');$('#derelict').style.left=(repairDone?innerWidth*.7+shipPhase:((innerWidth*.73+shipPhase)%(innerWidth+160)-80))+'px';$('#derelict').style.top=(universe.clientHeight*.12+Math.sin(now/8000)*17)+'px';if(repairDone&&shipPhase>innerWidth+200)$('#derelict').hidden=true}
 }
 requestAnimationFrame(frame);
})();
