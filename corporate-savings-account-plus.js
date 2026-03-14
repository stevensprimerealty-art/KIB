writing{variant=“standard” id=“csap_js”}
const track=document.getElementById(“heroTrack”);
const slides=track.children;

let index=0;

setInterval(()=>{
index=(index+1)%slides.length;
track.style.transform=translateX(-${index*100}%);
},3000);

document.querySelectorAll(”.footer-btn”).forEach(btn=>{

btn.addEventListener(“click”,()=>{

const panel=btn.nextElementSibling;

panel.style.display=
panel.style.display===“block”?“none”:“block”;

});

});
