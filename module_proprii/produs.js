class Produs {
    /**
     * Constructorul clasei Produs.
     * @param {Object} [props={}] - Un obiect cu proprietățile dorite pentru produs.
     */
    constructor({
      id ,
      nume ,
      descriere,
      imagine,
      tip_produs,
      categorie ,
      pret ,
      bucati ,
      greutate ,
      data_adaugare,
      culoare ,
      materiale ,
      testat
    } = {}) {
      for (let prop in arguments[0]) {
        this[prop] = arguments[0][prop];
      }
    }
  }
  