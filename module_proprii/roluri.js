const Drepturi = require('./drepturi.js');

//Clasa de bază pentru roluri.

class Rol {
  /**
   * Returnează tipul rolului.
   * @returns {string} - Tipul rolului.
   */
  static get tip() {
    return "generic";
  }

  /**
   * Returnează drepturile asociate rolului.
   * @returns {Array<Symbol>} - Drepturile asociate rolului.
   */
  static get drepturi() {
    return [];
  }

  /**
   * Constructorul clasei Rol.
   */
  constructor() {
    this.cod = this.constructor.tip;
  }

  /**
   * Verifică dacă rolul are dreptul specificat.
   * @param {Symbol} drept - Dreptul de verificat.
   * @returns {boolean} - Adevărat dacă rolul are dreptul, altfel fals.
   */
  areDreptul(drept) {
    console.log("În metoda areDreptul din clasa Rol!");
    return this.constructor.drepturi.includes(drept);
  }
}

/**
 * Clasa pentru rolul de administrator.
 */
class RolAdmin extends Rol {
  /**
   * Returnează tipul rolului.
   * @returns {string} - Tipul rolului.
   */
  static get tip() {
    return "admin";
  }

  /**
   * Constructorul clasei RolAdmin.
   */
  constructor() {
    super();
  }

  /**
   * Verifică dacă rolul are dreptul specificat.
   * @returns {boolean} - Adevărat deoarece rolul de admin are toate drepturile.
   */
  areDreptul() {
    return true;
  }
}

/**
 * Clasa pentru rolul de moderator.
 */
class RolModerator extends Rol {
  /**
   * Returnează tipul rolului.
   * @returns {string} - Tipul rolului.
   */
  static get tip() {
    return "moderator";
  }

  /**
   * Returnează drepturile asociate rolului.
   * @returns {Array<Symbol>} - Drepturile asociate rolului.
   */
  static get drepturi() {
    return [
      Drepturi.vizualizareUtilizatori,
      Drepturi.stergereUtilizatori
    ];
  }

  /**
   * Constructorul clasei RolModerator.
   */
  constructor() {
    super();
  }
}

/**
 * Clasa pentru rolul de client.
 */
class RolClient extends Rol {
  /**
   * Returnează tipul rolului.
   * @returns {string} - Tipul rolului.
   */
  static get tip() {
    return "comun";
  }

  /**
   * Returnează drepturile asociate rolului.
   * @returns {Array<Symbol>} - Drepturile asociate rolului.
   */
  static get drepturi() {
    return [
      Drepturi.cumparareProduse
    ];
  }

  /**
   * Constructorul clasei RolClient.
   */
  constructor() {
    super();
  }
}

/**
 * Clasa factory pentru crearea instanțelor de roluri.
 */
class RolFactory {
  /**
   * Creează o instanță de rol pe baza tipului specificat.
   * @param {string} tip - Tipul rolului.
   * @returns {Rol|null} - Instanța de rol creată sau null în cazul în care tipul este invalid.
   */
  static creeazaRol(tip) {
    switch (tip) {
      case RolAdmin.tip:
        return new RolAdmin();
      case RolModerator.tip:
        return new RolModerator();
      case RolClient.tip:
        return new RolClient();
      default:
        console.error('Tip invalid:', tip);
        return null;
    }
  }
}

module.exports = {
  RolFactory: RolFactory,
  RolAdmin: RolAdmin
};
