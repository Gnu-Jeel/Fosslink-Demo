/* Measure actual content, so labels and controls determine a tile's height.
   Pack tiles first, then room sections; neither stretches to a taller neighbour. */
(()=>{
let frame;
function pack(){
 for(const grid of app.querySelectorAll('.room-group .devices')){
  grid.classList.add('packed');
  const sizes=[...grid.children].map(card=>[card,Math.ceil(card.getBoundingClientRect().height)+8]);
  for(const [card,height] of sizes)card.style.gridRowEnd=`span ${height}`;
 }
 const rooms=app.querySelector('.room-groups');
 if(rooms){
  rooms.classList.add('packed');
  const sizes=[...rooms.children].map(group=>[group,Math.ceil(group.getBoundingClientRect().height)+24]);
  for(const [group,height] of sizes)group.style.gridRowEnd=`span ${height}`;
 }
}
function schedule(){cancelAnimationFrame(frame);frame=requestAnimationFrame(pack)}
const observer=new ResizeObserver(schedule);
function refresh(){observer.disconnect();pack();for(const el of app.querySelectorAll('.room-group,.room-group .device'))observer.observe(el)}
const previousRender=render;
render=function(){previousRender();refresh()};
document.fonts.ready.then(schedule);
refresh();
})();
