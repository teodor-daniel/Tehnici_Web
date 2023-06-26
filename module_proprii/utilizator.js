const AccesBD=require('./accesbd.js');
const parole=require('./parole.js');

const {RolFactory}=require('./roluri.js');
const crypto=require("crypto");
const nodemailer=require("nodemailer");


class Utilizator{
  /**
   * @type {string} - Tipul de conexiune.
   * @type {string} - Numele tabelului utilizatorilor în baza de date.
   * @type {string} - Parola utilizată pentru criptarea parolelor utilizatorilor.
   * @type {string} - Adresa de email a serverului.
   * @type {number} - Lungimea codului generat pentru utilizatori.
   * @type {string} -  Numele de domeniu utilizat pentru generarea link-urilor.
   * @type {string} -
   */
  static tipConexiune = "local";
  static tabel = "utilizatori";
  static parolaCriptare = "tehniciweb";
  static emailServer = "tehniciwebteodor@gmail.com";
  static lungimeCod = 64;
  static numeDomeniu = "localhost:8080";
  #eroare;
  /**
   * Creează o instanță a clasei Utilizator.
   * @param {Object} options - Opțiuni pentru utilizator.
   * @param {number} options.id - ID-ul utilizatorului.
   * @param {string} options.username - Numele de utilizator.
   * @param {string} options.nume - Numele utilizatorului.
   * @param {string} options.prenume - Prenumele utilizatorului.
   * @param {string} options.email - Adresa de email a utilizatorului.
   * @param {string} options.parola - Parola utilizatorului.
   * @param {Object|string} options.rol - Rolul utilizatorului (obiect sau cod).
   * @param {string} options.culoare_chat - Culoarea utilizatorului în chat (implicit "black").
   * @param {string} options.poza - Poza de profil a utilizatorului.
   */
    constructor({id, username, nume, prenume, email, parola, rol, data_adaugare, culoare_chat, tema, poza}={}) {
        this.id=id;

        //optional sa facem asta in constructor
        try{
        if(this.checkUsername(username))
            this.username = username;
        }
        catch(e){ this.#eroare=e.message}
        //fiecare element din constructor
        for(let prop in arguments[0]){
        //copiez argumentele in utilizator
            this[prop]=arguments[0][prop]
        }
        //Verific daca am setat rolul atunci transform din string in obiect
        if(this.rol)
        //iau codul daca exista atunci creez o instanta a rolului , daca nu exista atunci consider ca e string 
            this.rol=this.rol.cod? RolFactory.creeazaRol(this.rol.cod):  RolFactory.creeazaRol(this.rol);
        console.log(this.rol);

        this.#eroare="";
    }

    checkName(nume){
        return nume!="" && nume.match(new RegExp("^[A-Z][a-z]+$")) ;
    }

    set setareNume(nume){
        if (this.checkName(nume)) this.nume=nume
        else{
            throw new Error("Nume gresit")
        }
    }

    /*
    * folosit doar la inregistrare si modificare profil
    */
    set setareUsername(username){
        if (this.checkUsername(username)) this.username=username
        else{
            throw new Error("Username gresit")
        }
    }

    checkUsername(username){
        return username!="" && username.match(new RegExp("^[A-Za-z0-9#_./]+$")) ;
    }

    static criptareParola(parola){
        //foloseste un alt string cu care cripteaza, si parola efectiva,
        //cripteaza sincron , primeste parola din constructor, cu ajutorul parolei de criptare , unde e setata tehnici web, pt fiecare utilizator un token unic, salt string 
        //
        return crypto.scryptSync(parola,Utilizator.parolaCriptare,Utilizator.lungimeCod).toString("hex");
    }

    //Datele scrise in formular, avem deja utilizatorul 
    salvareUtilizator(){
        //parolele trebuie criptate, si o si salvam in aceelasi timp
        let parolaCriptata=Utilizator.criptareParola(this.parola);
        let utiliz=this;
        //bonus genreaza un string
        let token=parole.genereazaToken(100);
        AccesBD.getInstanta(Utilizator.tipConexiune).insert({tabel:Utilizator.tabel,
            campuri:{
                username:this.username,
                nume: this.nume,
                prenume:this.prenume,
                parola:parolaCriptata,
                data_adaugare:this.data_adaugare,
                email:this.email,
                culoare_chat:this.culoare_chat,
                tema:this.tema,
                cod:token,
                poza:this.poza}
            }, function(err, rez){
            if(err)
                console.log(err);
            //metoda trimiteMail, primeste subiect, mesaj text, mesaj html, atasamente
            let subiect = `Salut, ${utiliz.prenume} ${utiliz.nume}`;
            let mesajText = `Te-ai înregistrat pe TeoSport cu username-ul ${utiliz.username}`;
            let mesajHtml = `<h1>Salut!</h1><p>Te-ai înregistrat pe TeoSport cu username-ul <em>${utiliz.username}</em>.</p><p><a href="http://${Utilizator.numeDomeniu}/cod/${utiliz.username}/${token}">Click aici pentru confirmare</a></p>`;
      
            utiliz.trimiteMail(subiect, mesajText, mesajHtml);

        });
    }
//xjxwhotvuuturmqm

    
    async trimiteMail(subiect, mesajText, mesajHtml, atasamente=[]){
        //creez un obiect care primeste serviciul mail, securitate fals nu e bine productie, 
        var transp= nodemailer.createTransport({
            service: "gmail",
            secure: false,
            auth:{//date login 
                user:Utilizator.emailServer,
                pass:"kudjfqewbivixkbj" //parola data de google
            },
            tls:{
                rejectUnauthorized:false
            }
        });
        //genereaza html functie asyncrona, vreau sa vad ca s-a dat mailul, dupa ce s-a dat mailul, vreau sa vad ca s-a trimis mailul
        await transp.sendMail({
            from:Utilizator.emailServer,
            to:this.email, //email-ul utilizatorului
            subject:subiect,//"Te-ai inregistrat cu succes",
            text:mesajText, //"Username-ul tau este "+username
            html: mesajHtml,// `<h1>Salut!</h1><p style='color:blue'>Username-ul tau este ${username}.</p> <p><a href='http://${numeDomeniu}/cod/${username}/${token}'>Click aici pentru confirmare</a></p>`,
            attachments: atasamente
        })
        console.log("trimis mail");
    }
    static stergeUtilizatorDupaId(id) {
        AccesBD.getInstanta(Utilizator.tipConexiune).delete({
          tabel: Utilizator.tabel,
          conditiiAnd: [`id=${id}`]
        }, function(err, rez) {
          if (err) {
            console.error("Eroare la ștergerea utilizatorului:", err);
          } else {
            console.log("Utilizatorul a fost șters cu succes.");
          }
        });
      }
      
    static async getUtilizDupaUsernameAsync(username){
        if (!username) return null;
        try{
            let rezSelect= await AccesBD.getInstanta(Utilizator.tipConexiune).selectAsync(
                {tabel:"utilizatori",
                campuri:['*'],
                conditiiAnd:[`username='${username}'`]
            });
            if(rezSelect.rowCount!=0){
                return new Utilizator(rezSelect.rows[0])
            }
            else {
                console.log("getUtilizDupaUsernameAsync: Nu am gasit utilizatorul");
                return null;
            }
        }
        catch (e){
            console.log(e);
            return null;
        }
        
    }

    static getUtilizDupaUsername(username, obparam, proceseazaUtiliz) {//primeste username, un parametru, si o functie callback,
        if (!username) return null
        let eroare = null//selectez din tabelul utilizatori, toate val unde username-ul e cel primit ca parametru, unde user e cel din formularul de login
        AccesBD.getInstanta(Utilizator.tipConexiune).select(
          { tabel: 'utilizatori', campuri: ['*'], conditiiAnd: [`username='${username}'`] },// selectul e din baza de date
          function (err, rezSelect) {
            let u = null
            if (err) {
              console.error('Utilizator:', err)
              //throw new Error()
              eroare = -2
            } else if (rezSelect.rowCount == 0) {//verific daca avem randuri in select daca exista, in baza de date, daca nu exista, eroare
              eroare = -1
            }
            //constructor({id, username, nume, prenume, email, rol, culoare_chat="black", poza}={})
            else {
              u = new Utilizator(rezSelect.rows[0])//daca exista,apelez un constructor din clasa utilizator creez un obiect utilizator, cu datele din baza de date
            }
            proceseazaUtiliz(u, obparam, eroare)//cu utiliz si eroare apelez functia callback
          }
        )
      }


    areDreptul(drept){
        return this.rol.areDreptul(drept);
    }
}
module.exports={Utilizator:Utilizator}