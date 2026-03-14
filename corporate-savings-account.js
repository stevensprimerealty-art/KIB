// HERO SLIDER

const slides=document.querySelectorAll(".hero-slide")
let index=0

function showSlide(i){

slides.forEach(s=>s.classList.remove("active"))

slides[i].classList.add("active")

}

showSlide(index)

setInterval(()=>{

index++

if(index>=slides.length) index=0

showSlide(index)

},3000)


// FADE IN SCROLL

const reveals=document.querySelectorAll(".reveal")

function reveal(){

reveals.forEach(el=>{

const top=el.getBoundingClientRect().top

if(top<window.innerHeight-80){

el.classList.add("show")

}

})

}

window.addEventListener("scroll",reveal)

reveal()
