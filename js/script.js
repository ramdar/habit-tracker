// Scroll Up button
let scrollBtn = document.querySelector(".scrollBtn");

scrollBtn.addEventListener('click',()=>{
    window.scrollTo({
        top : 0 ,
        behavior : "smooth"
    })
})
function scrollUp(){
    window.scrollY > 100 ? scrollBtn.classList.add('active') : scrollBtn.classList.remove('active'); 
}
window.addEventListener("scroll", ()=>{
    scrollUp()
})
scrollUp()



// Install Btn
let InstallBtn = document.getElementById("install");

// show  the install btn when the page is loaded.
window.addEventListener("beforeinstallprompt" , (installEvent) => {
    InstallBtn.style.display = "block";
    deferredPrompt = installEvent;
})

// Click the "Install" button to trigger the prompt
InstallBtn.addEventListener('click' , () => {
    if(deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {

            if(choiceResult.outcome === "accepted"){
                console.log("User Accepted Installing");
                InstallBtn.style.display = "none";
            } else{
                console.log("User Refused Installing");
            }
        })
    }
})



// Registration Services  Worker 
if(navigator.serviceWorker){
    navigator.serviceWorker.register('../sw.js')
    .then((reg) => {
        console.log('file Is Register' , reg)
    })
    .catch((err) => {
        console.log("Error", err)
    })
}

// Check Network, If It Offline => Show The Alert To User
if(!navigator.onLine){
    alert('Website Is Offline');
}