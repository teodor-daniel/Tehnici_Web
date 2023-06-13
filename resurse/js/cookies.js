function setCookie(nume, val, timpExpirare) {//timpExpirare in milisecunde
    d = new Date();
    d.setTime(d.getTime() + timpExpirare)
    document.cookie = `${nume}=${val}; expires=${d.toUTCString()}`;
}
var lastPage = getCookie("last_page");

function getCookie(nume) {
    vectorParametri = document.cookie.split(";") // ["a=10","b=ceva"]
    for (let param of vectorParametri) {
        if (param.trim().startsWith(nume + "="))
            return param.split("=")[1]
    }
    return null;
}

function deleteCookie(nume) {
    // console.log(`${nume}; expires=${(new Date()).toUTCString()}`)
    document.cookie = `${nume}=0; expires=${(new Date()).toUTCString()}`;
}

//Sterge toate cookeiuri
function deleteAllCookies() {
    vectorParametri = document.cookie.split(";")
    for (let param of vectorParametri) {
        deleteCookie(param.split("=")[0])
    }
}

function setLastFiltersCookie(filters) {
    const jsonString = JSON.stringify(filters);
    setCookie("last_filters", jsonString, 604800000); // Expires after 1 week 
}

function resetLastFiltersCookie() {
    deleteCookie("last_filters");
}
function setLastPageCookie() {
    var currentPage = window.location.href;
    setCookie("last_page", currentPage, 86400000); // Cookie expiră după 24 de ore
  }
  
  function getLastPageCookie() {
    return getCookie("last_page");
  }
  setLastPageCookie();
  

window.addEventListener("load", function () {
    if (getCookie("acceptat_banner")) {
        document.getElementById("banner").style.display = "none";
    }
    else
        document.getElementById("banner").classList.add("animation");

    this.document.getElementById("ok_cookies").onclick = function () {
        setCookie("acceptat_banner", true, 60000);
        document.getElementById("banner").style.display = "none"
    }
})

if (lastPage) {
    console.log("Ultima pagină accesată:", lastPage);
  }