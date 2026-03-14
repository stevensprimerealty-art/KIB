/* HERO AUTO SLIDER */

const track=document.querySelector('.hero-track');
const slides=document.querySelectorAll('.hero-slide');

let index=0;

function move(){

index++;

if(index>=slides.length){
index=0;
}

track.style.transform=`translateX(-${index*100}%)`;

}

setInterval(move,3000);



/* SCROLL FADE IN */

const reveals=document.querySelectorAll(".reveal");

window.addEventListener("scroll",()=>{

reveals.forEach(el=>{

const top=el.getBoundingClientRect().top;
const windowHeight=window.innerHeight;

if(top<windowHeight-100){
el.classList.add("show");
}

});

});
