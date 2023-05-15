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



obGlobal = {
    obErori: null,
    obImagini: null,
    folderScss: path.join(__dirname, "resurse", "scss"),
    folderCss: path.join(__dirname, "resurse", "css"),
    folderBackup: path.join(__dirname, "resurse/backup"),
    optiuniMeniu:[]
}; // obiect global

client.query("select * from unnest(enum_range(null::tipuri_produse_sport))", function(err, rezTipuri){
    if (err){
        console.log(err);
    }
    else{
        obGlobal.optiuniMeniu=rezTipuri.rows;
        //console.log(obGlobal.optiuniMeniu);
    }
});


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
function compileazaScss(caleScss, caleCss) {
    if (!caleCss) {
        let numeFisierExt = path.basename(caleScss);
        let numeFis = numeFisierExt.split(".")[0];
        caleCss = numeFis + ".css";
        
    }
    if (!path.isAbsolute(caleScss)) {
        caleScss = path.join(obGlobal.folderScss, caleScss);
    }

    if (!path.isAbsolute(caleCss)) {
        caleCss = path.join(obGlobal.folderCss, caleCss);
    }
    let caleResBackup = path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleResBackup)) {
        fs.mkdirSync(caleResBackup, { recursive: true });
    }
    let numeFisCss = path.basename(caleCss);
    let data_curenta = new Date();
    let numeBackup =
        numeFisCss.split(".")[0] +
        "_" +
        data_curenta.toDateString().replace(" ", "_") +
        "_" +
        data_curenta.getHours() +
        "_" +
        data_curenta.getMinutes() +
        "_" +
        data_curenta.getSeconds() +
        ".css";

    fs.writeFileSync(path.join(obGlobal.folderBackup, numeBackup), "backup");

    if (fs.existsSync(caleCss)) {
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup,"resurse/css",numeBackup));
    }

    rez = sass.compile(caleScss, { sourceMap: true });

    fs.writeFileSync(caleCss, rez.css);

    //console.log("Compilare SCSS", rez);
}

vFisiere = fs.readdirSync(obGlobal.folderScss);
console.log("fisiere:");
console.log(vFisiere);

for (let numeFis of vFisiere) {
    if (path.extname(numeFis) === ".scss") {
        compileazaScss(numeFis);
    }
}

fs.watch(obGlobal.folderScss, function (event, filename) {
    console.log(event, filename);
    if (event === "change" || event === "rename") {
        let caleCompleta = path.join(obGlobal.folderScss, filename);
        if (fs.existsSync(caleCompleta)) {
            compileazaScss(caleCompleta);
        }
    }
});




app.set("view engine", "ejs");

app.use("/resurse", express.static(__dirname + "/resurse"));

app.use("/node_modules", express.static(__dirname + "/node_modules"));

app.use("/*", function(req, res, next){
    res.locals.optiuniMeniu = obGlobal.optiuniMeniu;
    console.log(obGlobal.optiuniMeniu);
    next();
})

app.use(/^\/resurse(\/[a-zA-Z0-9]*(?!\.)[a-zA-Z0-9]*)*$/, function (req, res) {
    afiseazaEroare(res, 403);
});


app.get("/produse",function(req, res){
    //console.log(req.query)
    //TO DO query pentru a selecta toate produsele
    //TO DO se adauaga filtrarea dupa tipul produsului
    //TO DO se selecteaza si toate valorile din enum-ul categ_prajitura
    client.query("select * from unnest(enum_range(null::categ_produs_sport))", function(err, rezCategorie){
        if (err){
            console.log(err);
        }
        else{
            let conditieWhere="";
            //console.log(req.query.tip, rezCategorie.rows);
            if(req.query.tip)
                conditieWhere=` where tip_produs='${req.query.tip}'`  //"where tip='"+req.query.tip+"'"
            

            client.query("select * from produs_sport "+conditieWhere , function( err, rez){
                //console.log(300)
                if(err){
                    console.log(err);
                    afiseazaEroare(res, 2);
                }
                else{
                    //console.log(rez);
                    res.render("pagini/produse", {produse:rez.rows, optiuni:rezCategorie.rows});
                }
            });
            }
    });

        

});

app.get("/produs/:id",function(req, res){
    console.log(req.params);
    
    client.query(`select * from produs_sport where id=${req.params.id}`, function( err, rezultat){
        if(err){
            console.log(err);
            afiseazaEroare(res, 2);
        }
        else
            res.render("pagini/produs", {prod:rezultat.rows[0]});
    });
});

//______________________

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
function afiseazaEroare(
        res,
        _identificator,
        _titlu = "titlu default",
        _text = "text default",
        _imagine
    ) {
        let vErori = obGlobal.obErori.info_erori;
        let eroare = vErori.find(function (element) {
            return element.identificator === _identificator;
        });
    
        if (eroare) {
            let titlu = (_titlu = "titlu default"
                ? eroare.titlu || _titlu
                : _titlu);
            let text = (_text = "text default" ? eroare.text || _text : _text);
            let imagine = (_imagine = "imagine default"
                ? eroare.imagine || _imagine
                : _imagine);
            if (eroare.status) {
                res.status(eroare.identificator).render("pagini/eroare.ejs", {
                    titlu: titlu,
                    text: text,
                    imagine: imagine,
                    optiuni: obGlobal.optiuniMeniu
                });
            } else {
                res.render("pagini/eroare.ejs", {
                    titlu: titlu,
                    text: text,
                    imagine: imagine
                });
            }
        } else {
            let errDef = obGlobal.obErori.eroare_default;
            res.render("pagini/eroare.ejs", {
                titlu: errDef.titlu,
                text: errDef.text,
                imagine: obGlobal.obErori.cale_baza + "/" + errDef.imagine
            });
        }
    }




app.listen(8080);
console.log("Serverul a pornit");