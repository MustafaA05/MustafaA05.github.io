// Resolve a UFO/planet contact. Mass ratio keeps planets weighty but pushable.
(function(root){
 function pushPlanet(u,p){
  const dx=p.x-u.x,dy=p.y-u.y,d=Math.hypot(dx,dy),radius=u.r+p.r;
  if(d>=radius)return false;
  const nx=d>0?dx/d:1,ny=d>0?dy/d:0,over=radius-d;
  u.x-=nx*over*2/3;u.y-=ny*over*2/3;p.x+=nx*over/3;p.y+=ny*over/3;
  const closing=(u.vx-p.vx)*nx+(u.vy-p.vy)*ny;
  if(closing>0){const impulse=closing*1.2/1.5;u.vx-=impulse*nx;u.vy-=impulse*ny;p.vx+=impulse*nx/2;p.vy+=impulse*ny/2}
  return true;
 }
 if(typeof module!=='undefined')module.exports={pushPlanet};else root.SpacePhysics={pushPlanet};
})(typeof globalThis!=='undefined'?globalThis:this);
