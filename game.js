let scene,camera,renderer,player;
let lane=0,targetX=0,vy=0,jumping=false;
let obstacles=[],coins=[],buildings=[];
let score=0,totalCoins=Number(localStorage.getItem("coins")||0);
let high=Number(localStorage.getItem("high")||0);
let speed=.55,running=false;

const scoreEl=document.getElementById("score");
const coinsEl=document.getElementById("coins");
const highEl=document.getElementById("high");
const menu=document.getElementById("menu");
const gameOver=document.getElementById("gameOver");
const final=document.getElementById("final");

coinsEl.innerText=totalCoins;
highEl.innerText=high;

function init(){
scene=new THREE.Scene();
scene.background=new THREE.Color(0x03000d);

camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.1,1000);
camera.position.set(0,4,7);

camera.lookAt(0,1,-5);

renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth,innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0x5566ff,1.2));
let light=new THREE.DirectionalLight(0xffffff,1.6);
light.position.set(0,12,8);
scene.add(light);

createWorld();
}
init();

function neonMat(color){
return new THREE.MeshStandardMaterial({
color,
emissive:color,
emissiveIntensity:.45,
roughness:.35,
metalness:.45
});
}

function createWorld(){
let road=new THREE.Mesh(
new THREE.BoxGeometry(8,.25,260),
new THREE.MeshStandardMaterial({color:0x070720,roughness:.4,metalness:.6})
);
road.position.set(0,-.15,-90);
scene.add(road);

for(let i=0;i<80;i++){
let l=new THREE.Mesh(new THREE.BoxGeometry(.08,.04,2),new THREE.MeshBasicMaterial({color:0x00ffd5}));
l.position.set(-2.65,.05,-i*4);
scene.add(l);

let r=l.clone();
r.position.x=2.65;
scene.add(r);

}

for(let i=0;i<70;i++){
createBuilding(-6-Math.random()*10,-i*5);
createBuilding(6+Math.random()*10,-i*5);
}
}

function createBuilding(x,z){
let h=3+Math.random()*9;
let b=new THREE.Mesh(
new THREE.BoxGeometry(1.8+Math.random()*2,h,1.8+Math.random()*2),
new THREE.MeshStandardMaterial({color:0x08081c,emissive:0x111144,emissiveIntensity:.3})
);
b.position.set(x,h/2-.2,z);
scene.add(b);
buildings.push(b);

for(let y=1;y<h;y+=1.3){
let w=new THREE.Mesh(new THREE.BoxGeometry(.7,.08,.04),new THREE.MeshBasicMaterial({color:0xff00ff}));
w.position.set(x,y,z+1.01);
scene.add(w);
}
}

function makePlayer(){
if(player)scene.remove(player);

player=new THREE.Group();

let body=new THREE.Mesh(new THREE.CapsuleGeometry(.42,1.05,8,16),neonMat(0x00ffd5));
body.position.y=1;
player.add(body);

let head=new THREE.Mesh(new THREE.SphereGeometry(.34,24,24),neonMat(0xffffff));
head.position.y=1.95;
player.add(head);

let visor=new THREE.Mesh(new THREE.BoxGeometry(.52,.08,.05),new THREE.MeshBasicMaterial({color:0xff00ff}));
visor.position.set(0,2,.32);
player.add(visor);

player.position.set(0,0,3);
scene.add(player);
}

function startGame(){
menu.classList.add("hide");
gameOver.classList.add("hide");
obstacles.forEach(o=>scene.remove(o));
coins.forEach(c=>scene.remove(c));
obstacles=[];coins=[];
lane=0;targetX=0;vy=0;jumping=false;
score=0;speed=.34;running=true;
makePlayer();
}

function spawnObstacle(){
let o=new THREE.Mesh(
new THREE.BoxGeometry(1.2,1.4,1.2),
neonMat(0xff0055)
);
o.position.set([-2.4,0,2.4][Math.floor(Math.random()*3)],.7,-90);
scene.add(o);
obstacles.push(o);
}

function spawnCoin(){
let c=new THREE.Mesh(
new THREE.TorusGeometry(.35,.12,16,30),
new THREE.MeshStandardMaterial({color:0xffd700,emissive:0xffd700,emissiveIntensity:1})
);
c.position.set([-2.4,0,2.4][Math.floor(Math.random()*3)],1.35,-90);
scene.add(c);
coins.push(c);
}

function collide(a,b,range=.9){
return Math.abs(a.position.x-b.position.x)<range &&
Math.abs(a.position.z-b.position.z)<range &&
Math.abs(a.position.y-b.position.y)<1.4;
}

function endGame(){
running=false;
let s=Math.floor(score);
if(s>high){
high=s;
localStorage.setItem("high",high);
highEl.innerText=high;
}
final.innerText="Score: "+s+" | Coins: "+totalCoins;
gameOver.classList.remove("hide");
}

function animate(){
requestAnimationFrame(animate);

if(running){
score+=.12;
speed+=.0002;
scoreEl.innerText=Math.floor(score);

```
player.position.x+=(targetX-player.position.x)*.22;
vy-=.035;
player.position.y+=vy;

if(player.position.y<=0){
  player.position.y=0;
  vy=0;
  jumping=false;
}

player.rotation.y=Math.sin(score*.15)*.18;

if(Math.random()<.018)spawnObstacle();
if(Math.random()<.027)spawnCoin();

obstacles.forEach(o=>{
  o.position.z+=speed;
  o.rotation.y+=.04;
  if(collide(player,o))endGame();
});

coins.forEach(c=>{
  c.position.z+=speed;
  c.rotation.y+=.12;
  if(collide(player,c,1)){
    c.collected=true;
    scene.remove(c);
    totalCoins++;
    localStorage.setItem("coins",totalCoins);
    coinsEl.innerText=totalCoins;
  }
});

obstacles=obstacles.filter(o=>o.position.z<10);
coins=coins.filter(c=>c.position.z<10&&!c.collected);

camera.position.x+=(player.position.x*.35-camera.position.x)*.08;
camera.lookAt(player.position.x,1,-5);
```

}

renderer.render(scene,camera);
}
animate();

function moveLeft(){lane=Math.max(-1,lane-1);targetX=lane*2.4}
function moveRight(){lane=Math.min(1,lane+1);targetX=lane*2.4}
function jump(){if(!jumping&&running){vy=.72;jumping=true}}

addEventListener("keydown",e=>{
if(e.key==="ArrowLeft")moveLeft();
if(e.key==="ArrowRight")moveRight();
if(e.code==="Space")jump();
});

let sx=0,sy=0;
addEventListener("touchstart",e=>{
sx=e.touches[0].clientX;
sy=e.touches[0].clientY;
});
addEventListener("touchend",e=>{
let dx=e.changedTouches[0].clientX-sx;
let dy=e.changedTouches[0].clientY-sy;
if(Math.abs(dx)>Math.abs(dy)){
if(dx>35)moveRight();
if(dx<-35)moveLeft();
}else{
if(dy<-35)jump();
}
});

addEventListener("resize",()=>{
camera.aspect=innerWidth/innerHeight;
camera.updateProjectionMatrix();
renderer.setSize(innerWidth,innerHeight);
});
