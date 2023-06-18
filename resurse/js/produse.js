window.addEventListener("DOMContentLoaded", function () {

    function Filtru() {
        let val_nume = document.getElementById("inp-nume").value.toLowerCase();
        let radiobuttons = document.getElementsByName("gr_rad");
        let val_criteriu;
        let produseAfisate = 0;
        for (let r of radiobuttons) {
            if (r.checked) {
                val_criteriu = r.value;
                break;
            }
        }

        var cal_a, cal_b;

        if (val_criteriu != "toate") {
            [cal_a, cal_b] = val_criteriu.split(":");
            cal_a = parseInt(cal_a);
            cal_b = parseInt(cal_b);
        }

        let val_pret = document.getElementById("inp-pret").value;
        let val_categ = document.getElementById("inp-categorie").value;
        var produse = document.getElementsByClassName("produs");


        let val_material2 = document.getElementById("i_sel_multiplu");

        let selectedMaterials = [];
        for (let option of val_material2.selectedOptions) {
            selectedMaterials.push(option.value);
            console.log(option.value);
        }

        let val_culoareInput = document.getElementById("i_datalist");

        let val_culoare = document.getElementById("i_datalist").value;

        //Verific daca data exista in datalist
        let datalistOptions = document.getElementById("id_lista").children;
        let isculoare = false;
        for (let i = 0; i < datalistOptions.length; i++) {
            if (datalistOptions[i].value === val_culoare || val_culoare === "") {
                isculoare = true;
                break;
            }
        }

        if (!isculoare) {
            // Eroare ca nu este un material valid
            alert("Invalid material!");
            val_culoareInput.style.border = "3px solid red";
            return; 
        } else {
        
            val_culoareInput.style.border = "";
        }

        let testatCheckbox = document.getElementById("testatCheckbox");
        let testatChecked = testatCheckbox.checked;


        for (let prod of produse) {
            prod.style.display = "none";

            let nume = prod.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase();

            let greutate = parseInt(prod.getElementsByClassName("val-greutate")[0].innerHTML);

            let pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML);

            let categorie = prod.getElementsByClassName("val-categorie")[0].innerHTML;

            let prod_material = prod.getElementsByClassName("materiale")[0].innerHTML.toLowerCase();

            let prod_materials_array = prod_material.split(",").map(material => material.trim());

            let prod_culoare = prod.getElementsByClassName("val-culoare")[0].innerHTML;

            let prod_testat = prod.getElementsByClassName("val-test")[0].innerHTML === "true";

            let cond1 = (nume.startsWith(val_nume));//nume
            let cond2 = (val_criteriu == "toate" || (cal_a <= greutate && greutate < cal_b)); //greutate
            let cond3 = (pret >= val_pret);//pret
            let cond4 = (val_categ == "toate" || val_categ == categorie);//categorie
            let cond6 = (val_culoare === "" || prod_culoare.includes(val_culoare));//culoare
            let cond7 = !testatChecked || (testatChecked && prod_testat);//testat
            let cond8 = (selectedMaterials.length == 0 || selectedMaterials.filter(material => prod_materials_array.includes(material.toLowerCase())).length == 0);//materiale

            if (cond1 && cond2 && cond3 && cond4  && cond6 && cond7 && cond8) {
                prod.style.display = "block";
                produseAfisate++;
            }
        }
        let messageContainer = document.getElementById("message-container");

        if (produseAfisate === 0) {
            if (!messageContainer) {
                messageContainer = document.createElement("div");
                messageContainer.id = "message-container";
                document.getElementById("loc-afișare-produse").appendChild(messageContainer);
            }

            messageContainer.innerHTML = "Nu există produse conform filtrării curente.";
        } else if (messageContainer) {
            messageContainer.remove();
        }

    }

    document.getElementById("resetare").onclick = function () {
        // Afișează un mesaj de confirmare
        var confirmReset = confirm("Sigur doriți să resetați filtrele?");

        // Verifică răspunsul utilizatorului
        if (confirmReset) {
            // Resetarea filtrelor
            document.getElementById("inp-nume").value = "";
            document.getElementById("inp-pret").value = document.getElementById("inp-pret").min;
            document.getElementById("inp-categorie").value = "toate";
            document.getElementById("i_rad4").checked = true;
            document.getElementById("i_sel_multiplu").value = "";
            document.getElementById("infoRange").innerHTML = "(0)";
            document.getElementById("i_datalist").value = "";
            document.getElementById("testatCheckbox").checked = false;
            document.getElementById("i_textarea").value = "";

            // Afisarea tuturor produselor
            var produse = document.getElementsByClassName("produs");
            for (let prod of produse) {
                prod.style.display = "block";
            }
        }
    };

    //Descriere
    document.getElementById("i_textarea").addEventListener("input", function () {
        let description = removeDiacritics(this.value.toLowerCase().trim());
        let produse = document.getElementsByClassName("produs");

        for (let prod of produse) {
            let prodDescription = removeDiacritics(prod.getElementsByClassName("val-descriere")[0].innerHTML.toLowerCase());

            let positiveKeywords = [];
            let negativeKeywords = [];

            let keywords = description.split(" ");
            for (let keyword of keywords) {
                keyword = keyword.trim();
                if (keyword.startsWith("+")) {
                    positiveKeywords.push(keyword.substring(1));
                } else if (keyword.startsWith("-")) {
                    negativeKeywords.push(keyword.substring(1));
                }
            }

            let shouldDisplay = positiveKeywords.length === 0 || positiveKeywords.some(keyword => prodDescription.includes(keyword));
            shouldDisplay = shouldDisplay && !negativeKeywords.some(keyword => prodDescription.includes(keyword));

            prod.style.display = shouldDisplay ? "block" : "none";

        }
    });
/*
Metoda replace(/[\u0300-\u036f]/g, "") este apelată pe textul normalizat. Această metodă înlocuiește orice caracter din 
intervalul Unicode [\u0300-\u036f] (care reprezintă diacriticele) cu un șir vid, eliminând astfel diacriticele.
*/
    function removeDiacritics(text) {
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");//de re explicat
    }



    function sortare(semn) {
        var produse = document.getElementsByClassName("produs");
        var v_produse = Array.from(produse);
        v_produse.sort(function (a, b) {
            let pret_a = parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML);
            let pret_b = parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML);
            if (pret_a == pret_b) {
                let nume_a = a.getElementsByClassName("val-nume")[0].innerHTML;
                let nume_b = b.getElementsByClassName("val-nume")[0].innerHTML;
                return semn * nume_a.localeCompare(nume_b);
            }
            return semn * (pret_a - pret_b);
        });
        for (let prod of v_produse) {
            prod.parentElement.appendChild(prod);
        }
    }

    document.getElementById("sortCrescNume").onclick = function () {
        sortare(1);
    };
    document.getElementById("sortDescrescNume").onclick = function () {
        sortare(-1);
    };

    document.getElementById("inp-pret").onchange = function () {//bara de selectie a pretului
        document.getElementById("infoRange").innerHTML = `(${this.value})`;
        Filtru();
    };

    document.getElementById("inp-nume").onchange = function () {
        Filtru();
    };
    document.getElementById("inp-categorie").onchange = function () {
        Filtru();
    };
    document.getElementById("i_rad1").onchange = function () {
        Filtru();
    };
    document.getElementById("i_rad2").onchange = function () {
        Filtru();
    };
    document.getElementById("i_rad3").onchange = function () {
        Filtru();
    };
    document.getElementById("i_rad4").onchange = function () {
        Filtru();
    };

    this.document.getElementById("i_datalist").onchange = function () {
        Filtru();
    };
    document.getElementById("i_sel_multiplu").onchange = function () {
        Filtru();
    };
    this.document.getElementById("testatCheckbox").onchange = function () {
        Filtru();
    };

    window.onkeydown = function (e) {
        if (e.key == "c" && e.altKey) {
            if (document.getElementById("info-suma"))
                return;
            var produse = document.getElementsByClassName("produs");
            let suma = 0;
            for (let prod of produse) {
                if (prod.style.display != "none") {
                    let pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML);
                    suma += pret;
                }
            }

            let p = document.createElement("p");
            p.innerHTML = suma;
            p.id = "info-suma";
            ps = document.getElementById("p-suma");
            container = ps.parentNode;
            frate = ps.nextElementSibling;
            container.insertBefore(p, frate);
            setTimeout(function () {
                let info = document.getElementById("info-suma");
                if (info)
                    info.remove();
            }, 1000);
        }
    };
});

