/**
 * ATENTIE!
 * inca nu am implementat protectia contra SQL injection
 */

const { Client } = require("pg");

/**
 * Clasa AccesBD oferă funcționalitatea de acces la baza de date.
 */
class AccesBD {
  /**
   * Proprietatea statică instanta conține unica instanță a clasei. Inițial are valoarea null.
   * @type {AccesBD|null}
   * @private
   */
  static #instanta = null;

  /**
   * Proprietatea statică initializat indică dacă clasa a fost sau nu inițializată.
   * @type {boolean}
   * @private
   */
  static #initializat = false;

  /**
   * Constructorul clasei AccesBD aruncă o eroare dacă deja a fost instanțiată clasa sau dacă nu a fost inițializată baza de date.
   */
  constructor() {
    if (AccesBD.#instanta) {
      throw new Error("Deja a fost instantiat");
    } else if (!AccesBD.#initializat) {
      throw new Error("Trebuie apelat doar din getInstanta; fara sa fi aruncat vreo eroare");
    }
  }

  /**
   * Metoda initLocal inițializează baza de date locală.
   */
  initLocal() {
    this.client = new Client({
      database: "site",
      user: "teo",
      password: "7979",
      host: "localhost",
      port: 5432,
    });
    this.client.connect();
  }

  /**
   * Metoda getClient returnează clientul pentru conexiunea la baza de date.
   * @returns {Client} - Clientul pentru conexiunea la baza de date.
   * @throws {Error} - Dacă clasa AccesBD nu a fost instantiată.
   */
  getClient() {
    if (!AccesBD.#instanta) {
      throw new Error("Nu a fost instantiata clasa");
    }
    return this.client;
  }

  /**
   * @typedef {object} ObiectConexiune - obiect primit de functiile care realizeaza un query
   * @property {string} init - tipul de conexiune ("init", "render" etc.)
   */

  /**
   * Metoda getInstanta creează o instanță a clasei AccesBD și o atribuie variabilei statice instanta.
   * În această metodă se va inițializa și conexiunea la baza de date.
   * @param {ObiectConexiune} [optiuni={}] - Un obiect cu datele pentru query.
   * @returns {AccesBD} - Referință către instanță.
   */
  static getInstanta({ init = "local" } = {}) {
    if (!this.#instanta) {
      this.#initializat = true;
      this.#instanta = new AccesBD();

      try {
        switch (init) {
          case "local":
            this.#instanta.initLocal();
            break;
        }
      } catch (e) {
        console.error("Eroare la initializarea bazei de date!");
      }
    }
    return this.#instanta;
  }

  /**
   * @typedef {object} ObiectQuerySelect - obiect primit de functiile care realizeaza un query
   * @property {string} tabel - numele tabelului
   * @property {string[]} campuri - o listă de stringuri cu numele coloanelor afectate de query; poate cuprinde și elementul "*"
   * @property {string[]} conditiiAnd - lista de stringuri cu condiții pentru clauza WHERE
   */

  /**
   * Selectează înregistrări din baza de date.
   * @param {ObiectQuerySelect} obj - Un obiect cu datele pentru query.
   * @param {function} callback - O funcție callback cu 2 parametri: eroare și rezultatul query-ului.
   * @param {any[]} [parametriQuery=[]] - Parametrii suplimentari pentru query.
   */
  select({ tabel = "", campuri = [], conditiiAnd = [] } = {}, callback, parametriQuery = []) {
    let conditieWhere = "";
    if (conditiiAnd.length > 0) {
      conditieWhere = `WHERE ${conditiiAnd.join(" AND ")}`;
    }
    let comanda = `SELECT ${campuri.join(",")} FROM ${tabel} ${conditieWhere}`;
    console.error(comanda);
    this.client.query(comanda, parametriQuery, callback);
  }

  /**
   * Selectează înregistrări din baza de date utilizând async/await.
   * @param {ObiectQuerySelect} obj - Un obiect cu datele pentru query.
   * @returns {Promise<Object|null>} - Rezultatul query-ului.
   */
  async selectAsync({ tabel = "", campuri = [], conditiiAnd = [] } = {}) {
    let conditieWhere = "";
    if (conditiiAnd.length > 0) {
      conditieWhere = `WHERE ${conditiiAnd.join(" AND ")}`;
    }

    let comanda = `SELECT ${campuri.join(",")} FROM ${tabel} ${conditieWhere}`;
    console.error("selectAsync:", comanda);
    try {
      let rez = await this.client.query(comanda);
      console.log("selectasync: ", rez);
      return rez;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  /**
   * @typedef {object} ObiectQueryInsert - obiect primit de functiile care realizeaza un query de tipul INSERT
   * @property {string} tabel - numele tabelului
   * @property {Object} campuri - un obiect cu perechile nume-camp: valoare
   */

  /**
   * Inserează înregistrări în baza de date.
   * @param {ObiectQueryInsert} obj - Un obiect cu datele pentru query.
   * @param {function} callback - O funcție callback care primește eroarea și rezultatul query-ului.
   */
  insert({ tabel = "", campuri = {} } = {}, callback) {
    let numeCampuri = Object.keys(campuri).join(",");
    let valoriCampuri = Object.values(campuri).map((x) => `'${x}'`).join(",");
    let comanda = `INSERT INTO ${tabel}(${numeCampuri}) VALUES (${valoriCampuri})`;
    console.log(comanda);
    this.client.query(comanda, callback);
  }

  /**
   * @typedef {object} ObiectQueryUpdate - obiect primit de functiile care realizeaza un query de tipul UPDATE
   * @property {string} tabel - numele tabelului
   * @property {Object} campuri - un obiect cu perechile nume-camp: valoare
   * @property {string[]} conditiiAnd - lista de stringuri cu condiții pentru clauza WHERE
   */

  /**
   * Actualizează înregistrări în baza de date.
   * @param {ObiectQueryUpdate} obj - Un obiect cu datele pentru query.
   * @param {function} callback - O funcție callback care primește eroarea și rezultatul query-ului.
   * @param {any[]} [parametriQuery] - Parametrii suplimentari pentru query.
   */
  update({ tabel = "", campuri = {}, conditiiAnd = [] } = {}, callback, parametriQuery) {
    let campuriActualizate = [];
    for (let prop in campuri) {
      campuriActualizate.push(`${prop}='${campuri[prop]}'`);
    }
    let conditieWhere = "";
    if (conditiiAnd.length > 0) {
      conditieWhere = `WHERE ${conditiiAnd.join(" AND ")}`;
    }
    let comanda = `UPDATE ${tabel} SET ${campuriActualizate.join(", ")} ${conditieWhere}`;
    console.log(comanda);
    this.client.query(comanda, parametriQuery, callback);
  }

  updateParametrizat({tabel="",campuri=[],valori=[], conditiiAnd=[]} = {}, callback, parametriQuery){
    if(campuri.length!=valori.length)
        throw new Error("Numarul de campuri difera de nr de valori")
    let campuriActualizate=[];
    for(let i=0;i<campuri.length;i++)
        campuriActualizate.push(`${campuri[i]}=$${i+1}`);
    let conditieWhere="";
    if(conditiiAnd.length>0)
        conditieWhere=`where ${conditiiAnd.join(" and ")}`;
    let comanda=`update ${tabel} set ${campuriActualizate.join(", ")}  ${conditieWhere}`;
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1111",comanda);
    this.client.query(comanda,valori, callback)
}



  /**
   * @typedef {object} ObiectQueryDelete - obiect primit de functiile care realizeaza un query de tipul DELETE
   * @property {string} tabel - numele tabelului
   * @property {string[]} conditiiAnd - lista de stringuri cu condiții pentru clauza WHERE
   */

  /**
   * Șterge înregistrări din baza de date.
   * @param {ObiectQueryDelete} obj - Un obiect cu datele pentru query.
   * @param {function} callback - O funcție callback care primește eroarea și rezultatul query-ului.
   */
  delete({ tabel = "", conditiiAnd = [] } = {}, callback) {
    let conditieWhere = "";
    if (conditiiAnd.length > 0) {
      conditieWhere = `WHERE ${conditiiAnd.join(" AND ")}`;
    }
    let comanda = `DELETE FROM ${tabel} ${conditieWhere}`;
    console.log(comanda);
    this.client.query(comanda, callback);
  }

  /**
   * Execută o comandă SQL directă.
   * @param {string} comanda - Comanda SQL.
   * @param {function} callback - O funcție callback care primește eroarea și rezultatul query-ului.
   */
  query(comanda, callback) {
    this.client.query(comanda, callback);
  }
}

module.exports = AccesBD;
