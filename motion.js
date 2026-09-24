// Decorative motion remains independent from navigation and respects reduced motion.
(()=>{
 const media=matchMedia('(prefers-reduced-motion: reduce)'),universe=document.querySelector('#universe'),galaxy=document.querySelector('#galaxy'),ufo=document.querySelector('#ufo');
 const shimmer=document.createElement('canvas');shimmer.id='galaxy-shimmer';shimmer.setAttribute('aria-hidden','true');galaxy.after(shimmer);const ctx=shimmer.getContext('2d');
 let pointer={x:0,y:0},current={x:0,y:0},frame=0,last=0,nextBlink=performance.now()+4000,blinkUntil=0,clusters=[];
 const galaxyImage=new Image();galaxyImage.src='assets/galaxy-detailed.png';galaxyImage.onload=()=>{
  const sample=document.createElement('canvas');sample.width=galaxyImage.width;sample.height=galaxyImage.height;const c=sample.getContext('2d',{willReadFrequently:true});c.drawImage(galaxyImage,0,0);const pix=c.getImageData(0,0,sample.width,sample.height).data;
  for(let k=0;k<6000&&clusters.length<100;k++){const x=Math.floor(Math.random()*sample.width),y=Math.floor(Math.random()*sample.height),p=(y*sample.width+x)*4;if(pix[p+2]>100&&pix[p]+pix[p+1]>150&&x>sample.width*.1&&x<sample.width*.88)clusters.push({x:x/sample.width,y:y/sample.height,phase:Math.random()*6.28,period:2000+Math.random()*5500,size:Math.random()>.85?3:1})}
 };
 function reset(){current={x:0,y:0};universe.style.setProperty('--drift-x','0px');universe.style.setProperty('--drift-y','0px');ufo.style.setProperty('--bob','0px');ufo.classList.remove('pilot-blink');ctx.clearRect(0,0,shimmer.width,shimmer.height)}
 function animate(now){frame=requestAnimationFrame(animate);if(now-last<60)return;last=now;
  current.x+=(pointer.x-current.x)*.09;current.y+=(pointer.y-current.y)*.09;universe.style.setProperty('--drift-x',current.x+'px');universe.style.setProperty('--drift-y',current.y+'px');
  const bob=Math.sin(now/1100)*2.4;ufo.style.setProperty('--bob',bob+'px');
  if(now>nextBlink){blinkUntil=now+150;nextBlink=now+3500+Math.random()*6500}ufo.classList.toggle('pilot-blink',now<blinkUntil);
  // Track the visible UFO dome so the beam stays attached as it bobs.
  if(typeof beam==='function')beam();
  const width=universe.clientWidth,height=universe.clientHeight;if(shimmer.width!==width||shimmer.height!==height){shimmer.width=width;shimmer.height=height}ctx.clearRect(0,0,width,height);
  const rect=galaxy.getBoundingClientRect();for(const star of clusters){const wave=Math.pow((Math.sin(now/star.period+star.phase)+1)/2,5);if(wave<.1)continue;const x=Math.round((rect.left+star.x*rect.width)/2)*2,y=Math.round((rect.top+star.y*rect.height)/2)*2;ctx.globalAlpha=wave*.8;ctx.fillStyle='#d9ceff';ctx.fillRect(x,y,star.size,star.size);if(star.size===3&&wave>.65){ctx.globalAlpha=wave*.55;ctx.fillRect(x-3,y+1,9,1);ctx.fillRect(x+1,y-3,1,9)}}ctx.globalAlpha=1;
 }
 function sync(){cancelAnimationFrame(frame);if(media.matches){reset();return}if(!document.hidden)frame=requestAnimationFrame(animate)}
 universe.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||media.matches)return;pointer={x:(e.clientX/innerWidth-.5)*16,y:(e.clientY/innerHeight-.5)*12}});universe.addEventListener('pointerleave',()=>pointer={x:0,y:0});media.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);sync();
})();
