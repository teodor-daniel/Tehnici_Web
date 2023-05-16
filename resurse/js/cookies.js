
//setCookie("a",10, 1000)
function setCookie(nume, val, timpExpirare){//timpExpirare in milisecunde trebuie o cale
    d=new Date();
    d.setTime(d.getTime()+timpExpirare) //getTime() returneaza milisecunde de la 1 ian 1970 pana la data curenta si se adauga timpul de expirare in milisecunde 
    document.cookie=`${nume}=${val}; expires=${d.toUTCString()}`;//toUTCString() transforma in string data si ora in format universal de timp
}

function getCookie(nume){
    vectorParametri=document.cookie.split(";") // ["a=10","b=ceva"]
    for(let param of vectorParametri){
        if (param.trim().startsWith(nume+"="))
            return param.split("=")[1]
    }
    return null;
}

function deleteCookie(nume){
    console.log(`${nume}; expires=${(new Date()).toUTCString()}`)//stergem cookie-ul prin setarea timpului de expirare la o data din trecut
    document.cookie=`${nume}=0; expires=${(new Date()).toUTCString()}`;
}


window.addEventListener("load", function(){
    if (getCookie("acceptat_banner")){
        document.getElementById("banner").style.display="none"; //ascundem bannerul daca a dat ok deja
    }   

    this.document.getElementById("ok_cookies").onclick=function(){
        setCookie("acceptat_banner",true,60000); //daca a dat click pe ok, setam cookie-ul acceptat_banner cu valoarea true si timp de expirare 60 secunde
        document.getElementById("banner").style.display="none" //ascundem bannerul
    }
})
