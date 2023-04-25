const express = require("express");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const sass = require("sass");
const ejs = require("ejs");
const { Client } = require("pg");

var client= new Client({
    database:"site",
    user:"teo",
    password:"7979",
    host:"localhost",
    port:5432
});

client.connect();

client.query("SELECT * FROM lab8_16", function(err, rezultat) {
   // console.log("erorare", err);
    //console.log("rezultat", rezultat);
});


obGlobal = {
    obErori: null,
    obImagini: null,
    folderScss: path.join(__dirname, "resurse", "scss"),
    folderCss: path.join(__dirname, "resurse", "css"),
    folderBackup: path.join(__dirname, "resurse/backup"),
}; // obiect global



app = express();


console.log("Folder proiect", __dirname);

console.log("Cale fisier", __filename);

console.log("Director de lucru ", process.cwd());

vectorFoldere = ["temp", "temp1", "backup","statistici"]
for (let folder of vectorFoldere) {
    //let caleFolder =__dirname+"/"+folder;
    let caleFolder = path.join(__dirname, folder)
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder);
    }
}
function compileazaCss(caleScss, caleCss) {
    if (!caleCss) {
        let vectorCale = caleScss.split("\\");
        let numeFisierExtensie = vectorCale[vectorCale.length - 1];
        let numeFisier = numeFisierExtensie.split(".")[0]; // a.scss->[("a"), ("scss")]
        caleCss = numeFisier + ".css";
    }
    if (!path.isAbsolute(caleScss))
        caleScss = path.join(obGlobal.folderScss, caleScss);
    if (!path.isAbsolute(caleCss))
        caleCss = path.join(obGlobal.folderCss, caleCss);

    //LA ACEST PUNCT AVEM CAI ABSOLUTE IN CALESCSS SI FOLDER
    let vectorCale = caleScss.split("\\");
    let numeFisCss = vectorCale[vectorCale.length - 1];
    let data_azi = new Date();
    let numeBackup = numeFisCss.split(".")[0] + "_" + data_azi.getDate() + "_" + (data_azi.getMonth() + 1) + "_" + data_azi.getFullYear() + "_" + data_azi.getHours() + "_" + data_azi.getMinutes() + "_" + data_azi.getSeconds() + ".css";
    fs.writeFileSync(path.join(obGlobal.folderBackup, numeBackup), "backup");
    if (fs.existsSync(caleCss)) {
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, numeFisCss));
    }
    rez = sass.compile(caleScss, { "sourceMap": true });
    fs.writeFileSync(caleCss, rez.css);
    // console.log("Compilare css: ", rez);

}


vFisiere = fs.readdirSync(obGlobal.folderScss); //da vector de stringuri cu numele fisierelor
for (let numeFis of vFisiere) {
    if (path.extname(numeFis) == ".scss")
        compileazaCss(numeFis);
}

fs.watch(obGlobal.folderScss, function (eveniment, numeFis) {
    // console.log(eveniment, numeFis);
    if (eveniment == "change" || eveniment == "rename") {
        let caleCompleta = path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta))
            compileazaCss(caleCompleta);
    }
})
app.set("view engine", "ejs");

app.use("/resurse", express.static(__dirname + "/resurse"));

app.use("/node_modules", express.static(__dirname + "/node_modules"));

app.use(/^\/resurse(\/[a-zA-Z0-9]*(?!\.)[a-zA-Z0-9]*)*$/, function (req, res) {
    afiseazaEroare(res, 403);
});


app.get("/favicon.ico", function (req, res) {
    res.sendFile(__dirname + "/resurse/ico/favicon.ico");
});


app.get("/ceva", function (req, res) {
    console.log("cale:", req.url)
    res.send("<h1>altceva</h1> ip:" + req.ip);
})

 
app.get(["/despre", "/", "/despree"], function (req, res) {
    res.render("pagini/despre", { ip: req.ip, a: 10, b: 20, imagini: obGlobal.obImagini.imagini });
}) 
app.get("/*.ejs", function (req, res) {//wildcard pentru a verifica daca fisierele .ejs

    afiseazaEroare(res, 400);
});

app.get("/*", function (req, res) {
    try {
        console.log(req.url);
        res.render("pagini" + req.url, function (err, rezRandare) {
            if (err) {
                if (err.message.startsWith("Failed to lookup view"))
                    // afiseazaEroare(res, { _identificator: 404, _titlu: "ceva" }); //trimit ca obiect
                    afiseazaEroare(res, 404); // trimit ca parametrii
                else
                    afiseazaEroare(res);
            }
            else {
                console.log(rezRandare);
                res.send(rezRandare);
            }
        });
    } catch (err) {
        if (err.message.startsWith("Cannot find module"))
            afiseazaEroare(res, 404, "Fisier resursa negasit");
    }
}); // path general pentru fiecare pagina si in caz de not found, send error

function initErori() {
    var continut = fs.readFileSync(__dirname + "/resurse/json/erori.json").toString("utf-8"); // asteptam raspuns ( se pun intr-o coada de taskuri)
    //pentru functie asyncrona nu se asteapta raspuns 
    // console.log(continut);
    obGlobal.obErori = JSON.parse(continut);
    let vErori = obGlobal.obErori.info_erori;
    // for (let i = 0; i < vErori.length; i++) {
    //     console.log(vErori[i].imagine);
    // } o opriune de a parcurge vectorul, dar nu e cea mai buna

    for (let eroare of vErori) { //echivalent cu iteratorul din C++
        eroare.imagine = "/" + obGlobal.obErori.cale_baza + "/" + eroare.imagine;
        // eroare.imagine = path.join(obGlobal.obErori.cale_baza, eroare.imagine);
    }
}

initErori();

function initImagini() {

    var continut = fs.readFileSync(path.join(__dirname, "/resurse/json/galerie.json")).toString("utf-8");
    obGlobal.obImagini = JSON.parse(continut);

    let vImagini = obGlobal.obImagini.imagini;

    let caleAbs = path.join(__dirname, obGlobal.obImagini.cale_galerie);
    let caleAbsMediu = path.join(caleAbs, "mediu");
    let caleAbsMic = path.join(caleAbs, "mic");

    if (!fs.existsSync(caleAbsMediu)) {
        fs.mkdirSync(caleAbsMediu);
    }

    if (!fs.existsSync(caleAbsMic)) {
        fs.mkdirSync(caleAbsMic);
    }

    for (let imag of vImagini) {
        [nume_fisier, extensie] = imag.fisier.split(".");

        imag.fisier_mediu = "/" + path.join(obGlobal.obImagini.cale_galerie, "mediu", nume_fisier + "_mediu" + ".webp");
        imag.fisier_mic = "/" + path.join(obGlobal.obImagini.cale_galerie, "mic", nume_fisier + "_mic" + ".webp");

        let caleAbsFisMediu = path.join(__dirname, imag.fisier_mediu);
        let caleAbsFisMic = path.join(__dirname, imag.fisier_mic);

        sharp(path.join(caleAbs, imag.fisier)).resize(1000, 1000).toFile(caleAbsFisMediu);
        sharp(path.join(caleAbs, imag.fisier)).resize(300, 300).toFile(caleAbsFisMic);

        imag.fisier = "/" + path.join(obGlobal.obImagini.cale_galerie, imag.fisier);

    }
}

initImagini();



/*
daca  programatorul seteaza titlul, se ia titlul din argument
daca nu e setat, se ia cel din json
daca nu avem titluk nici in JSOn se ia titlul de valoarea default
idem pentru celelalte
*/

//function afisareEroare(res, {_identificator, _titlu, _text, _imagine}={} ){
function afiseazaEroare(res, _identificator, _titlu = "titlu default", _text, _imagine) {
    let vErori = obGlobal.obErori.info_erori;
    let eroare = vErori.find(function (element) {
        return element.identificator === _identificator;
    });
    if (eroare) {
        let titlu = _titlu == "titlu default" ? (eroare.titlu || _titlu) : _titlu;
        // daca programatorul seteaza titlul, se ia titlul din argument,
        //daca nu e setat, se ia cel din json, 
        // daca nu avem titlu nici in json, se ia titlul din valoarea default 
        let text = _text || eroare.text;
        let imagine = _imagine || eroare.imagine;
        if (eroare.status) {
            res.status(eroare.identificator).render("pagini/eroare", { titlu: titlu, text: text, imagine: imagine });
        } else {
            res.render("pagini/eroare", { titlu: titlu, text: text, imagine: obGlobal.obErori.cale_baza = "/" + errDef.imagine });

        }
    }
    else {
        let errDef = obGlobal.obErori.eroare_default;
        res.render("pagini/eroare", { titlu: errDef.titlu, text: errDef.text, imagine: errDef.imagine });
    }
}




app.get("*/galerie-animata.css",function(req, res){

    var sirScss=fs.readFileSync(__dirname+"/resurse/scss_ejs/galerie_animata.scss").toString("utf8");
    var culori=["navy","black","purple","grey"];
    var indiceAleator=Math.floor(Math.random()*culori.length);
    var culoareAleatoare=culori[indiceAleator]; 
    rezScss=ejs.render(sirScss,{culoare:culoareAleatoare});
    console.log(rezScss);
    var caleScss=__dirname+"/temp/galerie_animata.scss"
    fs.writeFileSync(caleScss,rezScss);
    try {
        rezCompilare=sass.compile(caleScss,{sourceMap:true});
        
        var caleCss=__dirname+"/temp/galerie_animata.css";
        fs.writeFileSync(caleCss,rezCompilare.css);
        res.setHeader("Content-Type","text/css");
        res.sendFile(caleCss);
    }
    catch (err){
        console.log(err);
        res.send("Eroare");
    }
});

app.get("*/galerie-animata.css.map",function(req, res){
    res.sendFile(path.join(__dirname,"temp/galerie-animata.css.map"));
});



app.listen(8080);
console.log("Serverul a pornit");