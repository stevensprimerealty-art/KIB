// FADE IN ON SCROLL

const revealEls = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(entries => {

entries.forEach(entry => {

if(entry.isIntersecting){

entry.target.classList.add("is-visible");

}

});

},{threshold:.12});

revealEls.forEach(el => observer.observe(el));



/* HERO SLIDER */

const track = document.getElementById("heroTrack");
const slides = track ? track.children : [];
const dotsWrap = document.getElementById("heroDots");

let index = 0;
let timer;

/* create dots */

for(let i=0;i<slides.length;i++){

const dot=document.createElement("button");

dot.addEventListener("click",()=>go(i,true));

dotsWrap.appendChild(dot);

}

const dots=dotsWrap.children;

function updateDots(){

for(let i=0;i<dots.length;i++){

dots[i].classList.toggle("is-active",i===index);

}

}

function go(i,user=false){

index=(i+slides.length)%slides.length;

track.style.transform=`translateX(-${index*100}%)`;

updateDots();

if(user) restart();

}

function start(){

timer=setInterval(()=>{

go(index+1);

},3000);

}

function stop(){

clearInterval(timer);

}

function restart(){

stop();

start();

}


/* swipe */

let startX=0;

track.addEventListener("touchstart",e=>{

startX=e.touches[0].clientX;

stop();

});

track.addEventListener("touchend",e=>{

let dx=e.changedTouches[0].clientX-startX;

if(dx>50) go(index-1,true);

else if(dx<-50) go(index+1,true);

else restart();

});

go(0);
start();



/* FOOTER ACCORDION */

document.querySelectorAll(".footer-btn").forEach(button => {

button.addEventListener("click", () => {

const panel = button.nextElementSibling;

const open = panel.style.display === "block";

document.querySelectorAll(".footer-panel").forEach(p=>{
p.style.display="none";
});

if(!open){
panel.style.display="block";
}

});

});
