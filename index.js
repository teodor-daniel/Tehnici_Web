const express = require("express");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const sass = require("sass");
const ejs = require("ejs");
const { Client } = require("pg");
const formidable = require("formidable");
const { Utilizator } = require("./module_proprii/utilizator.js")
const session = require('express-session');
const Drepturi = require("./module_proprii/drepturi.js");
const AccesBD = require("./module_proprii/accesbd.js");
const { randomInt } = require("crypto");
app = express();
app.set("view engine", "ejs");

const port = process.env.PORT || 8080;

obGlobal = {
    obErori: null,
    obImagini: null,
    folderScss: path.join(__dirname, "resurse", "scss"),
    folderCss: path.join(__dirname, "resurse", "css"),
    folderBackup: path.join(__dirname, "resurse/backup"),
    optiuniMeniu: []
};


var client = new Client({
    database: "site",
    user: "teo",
    password: "7979",
    host: "localhost",
    port: 5432
});

client.connect();





AccesBD.getInstanta().select({ tabel: "produs_sport", campuri: ["nume"], conditiiAnd: ["id=3"] },
    function (err, rez) {
        console.log(rez);
        console.log(err);
    }
)


console.log("Folder proiect", __dirname);

console.log("Cale fisier", __filename);

console.log("Director de lucru ", process.cwd());

app.use(session({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: false
}));


vectorFoldere = ["temp", "temp1", "backup", "poze_uploadate"]
for (let folder of vectorFoldere) {
    let caleFolder = path.join(__dirname, folder)
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder);
    }
}
vFisiere = fs.readdirSync(obGlobal.folderScss);
console.log("fisiere:");
console.log(vFisiere);






app.use("/resurse", express.static(__dirname + "/resurse"));

app.use("/poze_uploadate", express.static(__dirname + "/poze_uploadate"));

app.use("/node_modules", express.static(__dirname + "/node_modules"));

app.use("/*", function (req, res, next) {
    res.locals.optiuniMeniu = obGlobal.optiuniMeniu;
    res.locals.Drepturi = Drepturi;
    if (req.session.utilizator) {
        req.utilizator = res.locals.utilizator = new Utilizator(req.session.utilizator);
    }
    next();
})

app.use(/^\/resurse(\/[a-zA-Z0-9]*)*$/, function (req, res) {
    afiseazaEroare(res, 403);
});

app.get("/produse", function (req, res) {
    client.query(
        "SELECT * FROM unnest(enum_range(null::categ_produs_sport))",
        function (err, rezCategorie) {
            if (err) {
                console.log(err);
                afiseazaEroare(res, 2);
            } else {
                let conditieWhere = "";
                if (req.query.categorie) {
                    conditieWhere = ` WHERE tip_produs='${req.query.categorie}'`;
                }
                client.query(
                    "SELECT * FROM produs_sport" + conditieWhere,
                    function (err, rez) {
                        if (err) {
                            console.log(err);
                            afiseazaEroare(res, 2);
                        } else {
                            client.query(
                                "SELECT MIN(pret) AS min, MAX(pret) AS max FROM produs_sport",
                                function (err, rezPret) {
                                    if (err) {
                                        console.log(err);
                                        afiseazaEroare(res, 2);
                                    } else {
                                        client.query(
                                            "SELECT MIN(greutate) AS min, MAX(greutate) AS max FROM produs_sport",
                                            function (err, rezGreutate) {
                                                if (err) {
                                                    console.log(err);
                                                    afiseazaEroare(res, 2);
                                                } else {
                                                    client.query(
                                                        "SELECT DISTINCT unnest(materiale) FROM produs_sport",
                                                        function (err, rezMateriale) {
                                                            if (err) {
                                                                console.log(err);
                                                                afiseazaEroare(res, 2);
                                                            } else {
                                                                client.query(
                                                                    "SELECT DISTINCT culoare FROM produs_sport",
                                                                    function (err, rezCuloare) {
                                                                        if (err) {
                                                                            console.log(err);
                                                                            afiseazaEroare(res, 2);
                                                                        } else {
                                                                            client.query(
                                                                                "SELECT DISTINCT testat FROM produs_sport",
                                                                                function (err, rezTestat) {
                                                                                    if (err) {
                                                                                        console.log(err);
                                                                                        afiseazaEroare(res, 2);
                                                                                    } else {



                                                                                        res.render("pagini/produse", {
                                                                                            produse: rez.rows,
                                                                                            minGreutate: rezGreutate.rows[0].min,
                                                                                            maxGreutate: rezGreutate.rows[0].max,
                                                                                            medieGreutate: (rezGreutate.rows[0].min + rezGreutate.rows[0].max) / 10,
                                                                                            minPret: rezPret.rows[0].min,
                                                                                            maxPret: rezPret.rows[0].max,
                                                                                            materiale: rezMateriale.rows.map((row) => row.unnest),
                                                                                            culori: rezCuloare.rows.map((row) => row.culoare),
                                                                                            testat: rezTestat.rows.map((row) => row.testat), //are sens ca sa nu am multiple instante
                                                                                            optiuni: rezCategorie.rows
                                                                                        });
                                                                                    }
                                                                                }
                                                                            );
                                                                        }
                                                                    }
                                                                );
                                                            }
                                                        }
                                                    );
                                                }
                                            }
                                        );
                                    }
                                }
                            );
                        }
                    }
                );
            }
        }
    );
});



app.get("/produs/:id", function (req, res) {
    console.log(req.params);

    client.query(`select * from produs_sport where id=${req.params.id}`, function (err, rezultat) {
        if (err) {
            console.log(err);
            afiseazaEroare(res, 2);
        }
        else
            res.render("pagini/produs", { prod: rezultat.rows[0] });
    });
});







app.post("/inregistrare", function (req, res) {
    var username;
    var poza;
    console.log("ceva");
    var formular = new formidable.IncomingForm()
    formular.parse(req, function (err, campuriText, campuriFisier) {
        console.log("Inregistrare:", campuriText);

        console.log(campuriFisier);
        var eroare = "";

        var utilizNou = new Utilizator();
        if (campuriText.parola.length < 4) {
            eroare += "Parola trebuie sa contina cel putin 4 caractere. ";
            res.render("pagini/inregistrare", { err: "Eroare: " + eroare });
        }
        if (campuriText.nume.toLowerCase().includes('malefic')) {
            eroare += "Numele nu poate conține combinații negative.";
            res.render("pagini/inregistrare", { err: "Eroare: " + eroare });
        }
        if (eroare == '') {
            try {

                console.log(campuriText.nume);

                utilizNou.setareNume = campuriText.nume;
                utilizNou.setareUsername = campuriText.username;
                utilizNou.email = campuriText.email;
                utilizNou.prenume = campuriText.prenume;
                utilizNou.data_adaugare = campuriText.data_adaugare;
                utilizNou.parola = campuriText.parola;
                utilizNou.culoare_chat = campuriText.culoare_chat;
                utilizNou.tema = campuriText.tema;
                utilizNou.poza = poza;
                Utilizator.getUtilizDupaUsername(campuriText.username, {}, function (u, parametru, eroareUser) {
                    if (eroareUser == -1) {
                        utilizNou.salvareUtilizator();
                    }
                    else {
                        eroare += "Mai exista username-ul";
                    }

                    if (!eroare) {
                        res.render("pagini/inregistrare", { raspuns: "Inregistrare cu succes!" })

                    }
                    else
                        res.render("pagini/inregistrare", { err: "Eroare: " + eroare });
                })


            }
            catch (e) {
                console.log(e);
                eroare += "Eroare site; reveniti mai tarziu";
                console.log(eroare);
                res.render("pagini/inregistrare", { err: "Eroare: " + eroare })
            }



        }
    });

    formular.on("field", function (nume, val) {

        console.log(`--- ${nume}=${val}`);

        if (nume == "username")
            username = val;
    })

    formular.on("fileBegin", function (nume, fisier) {
        console.log("fileBegin");
        console.log(nume, fisier);

        let folderUser = path.join(__dirname, "poze_uploadate", username);

        console.log(folderUser);

        if (!fs.existsSync(folderUser))
            fs.mkdirSync(folderUser);
        fisier.filepath = path.join(folderUser, fisier.originalFilename)
        poza = fisier.originalFilename

    })
    formular.on("file", function (nume, fisier) {
        console.log("file");
        console.log(nume, fisier);
    });
});


app.get("/logout", function (req, res) {
    res.locals.utilizator = null;
    req.session.destroy();
    res.render("pagini/home");
});


app.get("/cod/:username/:token", function (req, res) {
    console.log(req.params);
    try {

        Utilizator.getUtilizDupaUsername(req.params.username, { res: res, token: req.params.token }, function (u, obparam) {
            AccesBD.getInstanta().update(
                {
                    tabel: "utilizatori",
                    campuri: { confirmat_mail: 'true' },
                    conditiiAnd: [`cod='${obparam.token}'`]
                },
                function (err, rezUpdate) {
                    if (err || rezUpdate.rowCount == 0) {
                        console.log("Cod:", err);
                        afisareEroare(res, 3);
                    }
                    else {
                        res.render("pagini/confirmare.ejs");
                    }
                })
        })
    }
    catch (e) {
        console.log(e);
        renderError(res, 2);
    }
})

app.get("/useri", function (req, res) {

    if (req?.utilizator?.areDreptul?.(Drepturi.vizualizareUtilizatori)) {
        AccesBD.getInstanta().select({ tabel: "utilizatori", campuri: ["*"] }, function (err, rezQuery) {
            console.log(err);
            res.render("pagini/useri", { useri: rezQuery.rows });
        });
    }
    else {
        renderError(res, 403);
    }
});


app.post("/sterge_utiliz", function (req, res) {
    if (req?.utilizator?.areDreptul?.(Drepturi.stergereUtilizatori)) {
        var formular = new formidable.IncomingForm();
        formular.parse(req, function (err, campuriText, campuriFile) {
            //querry de dlete
            AccesBD.getInstanta().delete({ tabel: "utilizatori", conditiiAnd: [`id=${campuriText.id_utiliz}`] }, function (err, rezQuery) {
                console.log(err);
                res.redirect("/useri");
            });
        });
    } else {
        renderError(res, 403);
    }
})

Utilizator.stergeUtilizatorDupaId(2);

app.post("/login", function (req, res) {
    var username;
    console.log("ceva");
    var formular = new formidable.IncomingForm()
    formular.parse(req, function (err, campuriText, campuriFisier) {
        Utilizator.getUtilizDupaUsername(campuriText.username, {
            req: req,
            res: res,
            parola: campuriText.parola
        }, function (u, obparam) {
            let parolaCriptata = Utilizator.criptareParola(obparam.parola);
            if (u.parola == parolaCriptata && u.confirmat_mail) {
                u.poza = u.poza ? path.join("poze_uploadate", u.username, u.poza) : "";
                obparam.req.session.utilizator = u;

                obparam.req.session.mesajLogin = "Bravo! Te-ai logat!";
                obparam.res.redirect("/despre");
            }
            else {
                console.log("Eroare logare");
                obparam.req.session.mesajLogin = "Date logare incorecte sau nu a fost confirmat mailul!";
                obparam.res.redirect("/despre");
            }
        })
    });
});



app.post("/profil", function (req, res) {
    console.log("profil");
    if (!req.session.utilizator) {
        afiseazaEroare(res, 403,)
        res.render("pagini/eroare_generala", { text: "Nu sunteti logat." });
        return;
    }
    var formular = new formidable.IncomingForm();

    formular.parse(req, function (err, campuriText, campuriFile) {

        var parolaCriptata = Utilizator.criptareParola(campuriText.parola);

        AccesBD.getInstanta().updateParametrizat(
            {
                tabel: "utilizatori",
                campuri: ["nume", "prenume", "email", "culoare_chat"],
                valori: [`${campuriText.nume}`, `${campuriText.prenume}`, `${campuriText.email}`, `${campuriText.culoare_chat}`],
                conditiiAnd: [`parola='${parolaCriptata}'`, `username='${campuriText.username}'`]
            },
            function (err, rez) {
                if (err) {
                    console.log(err);
                    afiseazaEroare(res, 2);
                    return;
                }
                console.log(rez.rowCount);
                if (rez.rowCount == 0) {
                    res.render("pagini/profil", { mesaj: "Update-ul nu s-a realizat. Verificati parola introdusa." });
                    return;
                }
                else {
                    console.log("ceva");
                    req.session.utilizator.nume = campuriText.nume;
                    req.session.utilizator.prenume = campuriText.prenume;
                    req.session.utilizator.email = campuriText.email;
                    req.session.utilizator.culoare_chat = campuriText.culoare_chat;
                    res.locals.utilizator = req.session.utilizator;
                }


                res.render("pagini/profil", { mesaj: "Update-ul s-a realizat cu succes." });

            });


    });
});

app.get("/useri", function (req, res) {

    if (req?.utilizator?.areDreptul?.(Drepturi.vizualizareUtilizatori)) {
        AccesBD.getInstanta().select({ tabel: "utilizatori", campuri: ["*"] }, function (err, rezQuery) {
            console.log(err);
            res.render("pagini/useri", { useri: rezQuery.rows });
        });
    }
    else {
        afisareEroare(res, 403);
    }
});


app.post("/sterge_utiliz", function (req, res) {
    if (req?.utilizator?.areDreptul?.(Drepturi.stergereUtilizatori)) {
        var formular = new formidable.IncomingForm();

        formular.parse(req, function (err, campuriText, campuriFile) {

            AccesBD.getInstanta().delete({ tabel: "utilizatori", conditiiAnd: [`id=${campuriText.id_utiliz}`] }, function (err, rezQuery) {
                console.log(err);
                res.redirect("/useri");
            });
        });
    } else {
        afisareEroare(res, 403);
    }
})



app.get("/favicon.ico", function (req, res) {
    res.sendFile(__dirname + "/resurse/ico/favicon.ico");
});


app.get("/ceva", function (req, res) {
    console.log("cale:", req.url)
    res.send("<h1>altceva</h1> ip:" + req.ip);
})




app.get("/*.ejs", function (req, res) {

    afiseazaEroare(res, 400);
});

app.get("/galerie", function (req, res) {
    let nrImagini = randomInt(5, 11);
    if (nrImagini % 2 == 0) nrImagini++;

    let imgInv = [...obGlobal.obImagini.imagini].reverse();

    let fisScss = path.join(__dirname, "resurse/scss/galerie_animata.scss");
    let liniiFisScss = fs.readFileSync(fisScss).toString().split("\n");

    let stringImg = "$nrImg: " + nrImagini + ";";

    liniiFisScss = liniiFisScss.slice(1);


    liniiFisScss.unshift(stringImg);


    fs.writeFileSync(fisScss, liniiFisScss.join("\n"));

    res.render("pagini/galerie", {
        imagini: obGlobal.obImagini.imagini,
        nrImagini: nrImagini,
        imgInv: imgInv
    });
});



app.get(["/despre", "/", "/homee", "/login"], function (req, res) {
    let sir = req.session.mesajLogin;
    req.session.mesajLogin = null;
    let nrImagini = randomInt(5, 11);
    if (nrImagini % 2 == 0) nrImagini++;

    let imgInv = [...obGlobal.obImagini.imagini].reverse();

    let fisScss = path.join(__dirname, "resurse/scss/galerie_animata.scss");
    let liniiFisScss = fs.readFileSync(fisScss).toString().split("\n");

    let stringImg = "$nrImg: " + nrImagini + ";";

    liniiFisScss = liniiFisScss.slice(1);


    liniiFisScss.unshift(stringImg);


    fs.writeFileSync(fisScss, liniiFisScss.join("\n"));


    AccesBD.getInstanta().select({ tabel: "utilizatori", campuri: ["*"] }, function (err, rezQuery) {
        console.log(err);

        res.render("pagini/despre", { imagini: obGlobal.obImagini.imagini, mesajLogin: sir, useri: rezQuery.rows, imagini: obGlobal.obImagini.imagini, nrImagini: nrImagini, imgInv: imgInv });
    });
})


app.get("/*", function (req, res) {
    try {
        console.log(req.url);
        res.render("pagini" + req.url, function (err, rezRandare) {
            if (err) {
                if (err.message.startsWith("Failed to lookup view"))
                    afiseazaEroare(res, 404);
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
});

function initErori() {
    var continut = fs.readFileSync(__dirname + "/resurse/json/erori.json").toString("utf-8");
    obGlobal.obErori = JSON.parse(continut);
    let vErori = obGlobal.obErori.info_erori;
    for (let eroare of vErori) {
        eroare.imagine = "/" + obGlobal.obErori.cale_baza + "/" + eroare.imagine;
    }
}

initErori();

function initImagini() {
    var continut = fs
        .readFileSync(path.join(__dirname, "/resurse/json/galerie.json"))
        .toString("utf-8");
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

        imag.fisier_mediu =
            "/" +
            path.join(
                obGlobal.obImagini.cale_galerie,
                "mediu",
                nume_fisier + "_mediu" + ".webp"
            );
        imag.fisier_mic =
            "/" +
            path.join(
                obGlobal.obImagini.cale_galerie,
                "mic",
                nume_fisier + "_mic" + ".webp"
            );

        let caleAbsFisMediu = path.join(__dirname, imag.fisier_mediu);
        let caleAbsFisMic = path.join(__dirname, imag.fisier_mic);

        sharp(path.join(caleAbs, imag.fisier))
            .resize(1000, 1000)
            .toFile(caleAbsFisMediu);
        sharp(path.join(caleAbs, imag.fisier))
            .resize(300, 300)
            .toFile(caleAbsFisMic);

        imag.fisier =
            "/" + path.join(obGlobal.obImagini.cale_galerie, imag.fisier);
    }
}
initImagini();







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
    let caleResBackup = path.join(obGlobal.folderBackup);
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


    if (fs.existsSync(caleCss)) {
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css", numeBackup));
    }

    rez = sass.compile(caleScss, { sourceMap: true });

    fs.writeFileSync(caleCss, rez.css);

}

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


app.listen(process.env.PORT || port, () => console.log(`The port is on ${port}`));
console.log("Serverul a pornit");