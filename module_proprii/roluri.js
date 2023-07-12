/**
 * Clasa `Rol` reprezintă un rol generic în sistem.
 */
class Rol {
    /**
     * @returns {string} Returnează tipul rolului.
     */
    static get tip() { return "generic" }

    /**
     * @returns {Array} Returnează drepturile asociate rolului.
     */
    static get drepturi() { return [] }

    /**
     * Creează o nouă instanță a clasei `Rol`.
     */
    constructor() {
        this.cod = this.constructor.tip;
    }

    /**
     * Verifică dacă rolul curent are dreptul specificat.
     * @param {Symbol} drept - Un simbol reprezentând dreptul de verificat.
     * @returns {boolean} Returnează `true` dacă rolul are dreptul specificat, `false` în caz contrar.
     */
    areDreptul(drept) {
        return this.constructor.drepturi.includes(drept);
    }
}

/**
 * Clasa `RolAdmin` reprezintă un rol de administrator în sistem.
 * Extinde clasa `Rol`.
 */
class RolAdmin extends Rol {
    /**
     * @returns {string} Returnează tipul rolului (admin).
     */
    static get tip() { return "admin" }

    /**
     * Creează o nouă instanță a clasei `RolAdmin`.
     */
    constructor() {
        super();
    }

    /**
     * @returns {boolean} Returnează întotdeauna `true` pentru că este un administrator.
     */
    areDreptul() {
        return true;
    }
}

/**
 * Clasa `RolModerator` reprezintă un rol de moderator în sistem.
 * Extinde clasa `Rol`.
 */
class RolModerator extends Rol {
    /**
     * @returns {string} Returnează tipul rolului (moderator).
     */
    static get tip() { return "moderator" }

    /**
     * @returns {Array} Returnează drepturile asociate rolului de moderator.
     */
    static get drepturi() {
        return [
            Drepturi.vizualizareUtilizatori,
            Drepturi.stergereUtilizatori
        ];
    }

    /**
     * Creează o nouă instanță a clasei `RolModerator`.
     */
    constructor() {
        super();
    }
}

/**
 * Clasa `RolClient` reprezintă un rol de client în sistem.
 * Extinde clasa `Rol`.
 */
class RolClient extends Rol {
    /**
     * @returns {string} Returnează tipul rolului (comun).
     */
    static get tip() { return "comun" }

    /**
     * @returns {Array} Returnează drepturile asociate rolului de client.
     */
    static get drepturi() {
        return [
            Drepturi.cumparareProduse
        ];
    }

    /**
     * Creează o nouă instanță a clasei `RolClient`.
     */
    constructor() {
        super();
    }
}

/**
 * Clasa `RolFactory` este responsabilă pentru crearea de instanțe ale claselor de rol.
 */
class RolFactory {
    /**
     * Creează și returnează o instanță a unei clase de rol, în funcție de tipul specificat.
     * @param {string} tip - Tipul rolului.
     * @returns {Rol} O instanță a clasei de rol corespunzătoare tipului specificat.
     */
    static creeazaRol(tip) {
        switch (tip) {
            case RolAdmin.tip:
                return new RolAdmin();
            case RolModerator.tip:
                return new RolModerator();
            case RolClient.tip:
                return new RolClient();
        }
    }
}

module.exports = {
    RolFactory: RolFactory,
    RolAdmin: RolAdmin
};
