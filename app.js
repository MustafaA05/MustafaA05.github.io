const $=s=>document.querySelector(s);
const scene='assets/scene.png';
function sprite(src,x,y,w,h,fullW=1536,fullH=1024){return `<span class="sprite" style="aspect-ratio:${w}/${h}"><img alt="" draggable="false" src="${src}" style="width:${fullW/w*100}%;height:${fullH/h*100}%;left:${-x/w*100}%;top:${-y/h*100}%"></span>`}
const data=[
 {label:'ROBOT ARM',title:'Vision-powered robot arm',crop:[94,751,120,119],art:()=>sprite(scene,345,211,376,227),body:'A custom-designed, 3D-printed, four-axis arm that follows an AprilTag target using computer vision and inverse kinematics.',role:'Designed and 3D-printed the entire arm structure.',tech:'Arduino · Stepper motors · Inverse kinematics'},
 {label:'F1 CAR',title:'PID-controlled F1 car',crop:[334,746,123,124],art:()=>sheet(0),body:'An Arduino-controlled F1 model car using two smart motors and PID feedback. Transported a stack of 10 blocks across a 15-foot test course without dropping any.',role:'Vehicle design, wiring, and collaborative PID tuning.',tech:'Arduino · Motor feedback · PID control'},
 {label:'FRC PROTOTYPES',title:'Robotics, made tangible',crop:[573,744,125,127],art:()=>sheet(1),body:'Tabletop drivetrain, elevator, and double-jointed arm prototypes that teach high school students about gear ratios and closed-loop control.',role:'All mechanical design, 3D printing, wiring, and programming.',tech:'Fusion 360 · DC motors · Arduino'},
 {label:'ABOUT ME',title:'Mustafa Ahmed',crop:[805,740,132,135],art:()=>sheet(2),body:'I’m an Electrical and Computer Engineering student at Worcester Polytechnic Institute. I design, build, and program projects that bring hardware and software together.',role:'Seeking internship opportunities in electrical or robotics engineering.'},
 {label:'RESUME',title:'Engineering in practice',crop:[1022,747,211,125],art:()=>sheet(2),body:'Mustafa Ahmed\nElectrical and Computer Engineering\nWorcester Polytechnic Institute',role:'Mechanical design, embedded programming, electronics, and feedback control.',resume:true},
 {label:'CONTACT',title:'Let’s connect',crop:[1317,744,128,130],art:()=>sheet(2),body:'Interested in working together? I’m seeking electrical and robotics engineering internships.',contact:true}
];
function sheet(i){return sprite('assets/projects.png',i*512,0,512,512,1536,512)}
const planetCrops=[[37, 994, 141, 146], [218, 994, 144, 146], [413, 996, 143, 144], [599, 995, 145, 145], [757, 1001, 208, 138], [984, 995, 139, 144]];
$('#planets').innerHTML=data.map((p,i)=>`<button class="planet" data-index="${i}" aria-label="${p.title}" aria-pressed="false"><span class="planet-art">${sprite('assets/planet-reference.png',...planetCrops[i],1159,1358)}</span><span class="label">${p.label}</span></button>`).join('');
$('#ufo').innerHTML=sprite(scene,117,694,75,53);
const planets=[...document.querySelectorAll('.planet')], reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let selected=null, flyingTo=null, operation=0, ufoEntered=false, beamProgress=0;
function reveal(){$('#planets').classList.add('revealed')}
function destination(i){const r=planets[i].querySelector('.planet-art').getBoundingClientRect();return{x:r.left+r.width/2-$('#ufo').offsetWidth/2,y:r.top-$('#ufo').offsetHeight+10}}
function place(i){const p=destination(i);$('#ufo').style.left=p.x+'px';$('#ufo').style.top=p.y+'px'}
function beam(){if($('#hologram').hidden)return;const panel=$('#hologram').getBoundingClientRect(),ship=$('#ufo .sprite').getBoundingClientRect();const x=ship.left+ship.width/2,y=ship.top+3;const left=x+(panel.left+5-x)*beamProgress,right=x+(panel.right-5-x)*beamProgress,top=y+(panel.bottom-5-y)*beamProgress;$('#beam polygon').setAttribute('points',`${left},${top} ${right},${top} ${x},${y}`)}
function wait(ms){return new Promise(r=>setTimeout(r,reduced?0:ms))}
function animateBeam(target,ticket){const from=beamProgress,duration=reduced?0:(target?240:190);return new Promise(resolve=>{const start=performance.now();function frame(now){if(ticket!==operation){resolve(false);return}const t=duration?Math.min(1,(now-start)/duration):1;const eased=1-Math.pow(1-t,3);beamProgress=from+(target-from)*eased;beam();if(t<1)requestAnimationFrame(frame);else resolve(true)}requestAnimationFrame(frame)})}
async function retract(ticket){$('#hologram').classList.add('projecting');$('#hologram').classList.remove('projected');if(beamProgress>0&&!await animateBeam(0,ticket))return false;if(ticket!==operation)return false;$('#hologram').hidden=true;$('#beam').classList.remove('active');return true}
async function fly(i,open=false){if(open)window.play?.beforeLand(i);const ticket=++operation;reveal();if(open){selected=i;$('#welcome').classList.add('away');planets.forEach((p,n)=>p.setAttribute('aria-pressed',n===i));if(!await retract(ticket))return;if(!window.play?.gravity&&matchMedia('(max-width:600px)').matches){const orbit=$('#orbit');orbit.scrollTo({left:planets[i].offsetLeft+planets[i].offsetWidth/2-orbit.clientWidth/2,behavior:reduced?'instant':'smooth'});await wait(220);if(ticket!==operation)return}}
 flyingTo=i;if(!ufoEntered){ufoEntered=true;$('#ufo').style.top=destination(i).y-45+'px';await wait(20)}if(ticket!==operation)return;$('#ufo').classList.remove('landing');place(i);await wait(420);if(ticket!==operation)return;$('#ufo').classList.add('landing');await wait(160);if(ticket!==operation)return;if(open){render(i);$('#hologram').hidden=false;$('#hologram').classList.add('projecting');beamProgress=0;beam();$('#beam').classList.add('active');if(!await animateBeam(1,ticket))return;$('#hologram').classList.remove('projecting');$('#hologram').classList.add('projected');$('#announcement').textContent=`${data[i].title} opened`;$('#close').focus({preventScroll:true})}}
function render(i){const p=data[i];$('#panel-content').innerHTML=`<div class="illustration">${p.art()}</div><div class="copy"><h1>${p.title}</h1><p>${p.body.replaceAll('\n','<br>')}</p>${p.role?`<p>${i<3?'My role: ':''}${p.role}</p>`:''}${p.tech?`<p class="meta">${p.tech}</p>`:''}${i<3?'<p class="pending">Full project story coming soon.</p>':''}${p.resume?'<a class="action" href="assets/mustafa-ahmed-resume.pdf" download="Mustafa-Ahmed-Resume.pdf">DOWNLOAD RESUME</a><p class="meta"><a href="assets/mustafa-ahmed-resume.pdf" target="_blank" rel="noopener noreferrer">Open PDF ↗</a></p>':''}${p.contact?'<a class="action" href="mailto:mahmed4@wpi.edu">EMAIL ME</a><br><a class="action" href="https://www.linkedin.com/in/mustafa-ahmed-5546b2292/" target="_blank" rel="noopener noreferrer">LINKEDIN ↗</a><p class="meta">mahmed4@wpi.edu</p>':''}</div>`;$('#panel-content').scrollTop=0}
async function closePanel(){if(selected===null)return;const previous=selected,ticket=++operation;if(!await retract(ticket))return;selected=null;$('#welcome').classList.remove('away');planets.forEach(p=>p.setAttribute('aria-pressed','false'));planets[previous].focus({preventScroll:true});$('#announcement').textContent='Hologram closed. Choose another planet.'}
planets.forEach((p,i)=>{p.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch'&&selected===null&&!window.play?.manual&&!window.play?.gravity)fly(i)});p.addEventListener('focus',()=>{if(selected===null&&flyingTo!==i&&!window.play?.manual&&!window.play?.gravity)fly(i)});p.addEventListener('click',e=>{if(!window.play?.suppressClick(e))fly(i,true)})});$('#close').addEventListener('click',closePanel);document.addEventListener('keydown',e=>{if(e.key==='Escape')closePanel()});$('#orbit').addEventListener('scroll',()=>{if(flyingTo!==null)place(flyingTo);beam()},{passive:true});window.addEventListener('resize',()=>{if(flyingTo!==null)place(flyingTo);beam();drawSky()});
// Stars keep their positions, but each schedules its own random twinkle.
let skyStars=[],skyWidth=0,skyHeight=0;
function drawSky(time=performance.now()){
 const canvas=$('#sky'),ctx=canvas.getContext('2d'),w=innerWidth,h=$('#universe').offsetHeight;
 const motion=!matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(w!==skyWidth||h!==skyHeight){
  skyWidth=w;skyHeight=h;canvas.width=w;canvas.height=h;
  let seed=419;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
  skyStars=Array.from({length:Math.max(440,Math.floor(w*h/750))},()=>({x:Math.floor(rand()*w/3)*3,y:Math.floor(rand()*h/3)*3,size:rand()>.93?3:rand()>.5?2:1,color:['#e5f1ff','#8db8d2','#aaa6d9','#fff1cf'][Math.floor(rand()*4)],base:.48+rand()*.38,next:time+Math.random()*11000,start:0,duration:0}));
 }
 ctx.clearRect(0,0,w,h);
 for(const star of skyStars){
  if(motion&&time>=star.next){star.start=time;star.duration=1000+Math.random()*1600;star.next=time+star.duration+3500+Math.random()*12000}
  const phase=(time-star.start)/star.duration;
  const pulse=motion&&phase>=0&&phase<=1?Math.pow(Math.sin(phase*Math.PI),2):0;
  const quiet=star.x>w*.16&&star.x<w*.84&&star.y>h*.24&&star.y<h*.47;
  ctx.fillStyle=star.color;ctx.globalAlpha=(quiet?.65:1)*Math.min(1,star.base+pulse*.65);
  ctx.fillRect(star.x,star.y,star.size,star.size);
  if(star.size===3&&pulse>.4){ctx.globalAlpha=pulse*.8;ctx.fillRect(star.x-4,star.y+1,11,1);ctx.fillRect(star.x+1,star.y-4,1,11)}
 }
 // Preserve the occasional comet sweeping through the upper sky.
 const cycle=Math.floor(time/11000),progress=(time%11000-3000)/850;
 if(motion&&progress>=0&&progress<=1){
  const x=w*(.48+(cycle%3)*.12)-progress*Math.min(w*.3,310),y=h*.085+progress*h*.095;
  for(let j=12;j>=0;j--){ctx.globalAlpha=(1-j/13)*Math.sin(progress*Math.PI);ctx.fillStyle=j<2?'#e7faff':'#4a91b3';ctx.fillRect(Math.round((x+j*5)/3)*3,Math.round((y-j*2)/3)*3,j<2?3:2,2)}
 }
 ctx.globalAlpha=1;
}
let skyFrame=0,skyLast=0;
function animateSky(time){if(time-skyLast>80){drawSky(time);skyLast=time}skyFrame=requestAnimationFrame(animateSky)}
function syncSkyMotion(){cancelAnimationFrame(skyFrame);if(!document.hidden&&!matchMedia('(prefers-reduced-motion: reduce)').matches)skyFrame=requestAnimationFrame(animateSky);else drawSky()}
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',syncSkyMotion);
document.addEventListener('visibilitychange',syncSkyMotion);
drawSky();syncSkyMotion();
