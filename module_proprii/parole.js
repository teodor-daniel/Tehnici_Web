
sirAlphaNum="";
//array de array-uri de nr 
// iteram prin array-ul de array-uri si apoi prin fiecare array iar codurile sunt transformate in caractere ascii, cifrele si literele mari si mici
v_intervale=[[48,57],[65,90],[97,122]]
for(let interval of v_intervale){
    for(let i=interval[0]; i<=interval[1]; i++)
        sirAlphaNum+=String.fromCharCode(i)
}

console.log(sirAlphaNum);
//genereaza un token de n 
// pt fiecare i luam un caracter random din sirul de caractere si il adaugam la token
// nr de elemente - 1 , de unde luam lungimea
function genereazaToken(n){
    let token=""
    for (let i=0;i<n; i++){
        // nr de la 0 la lungimea sirului de caracterede la 0 la lungimea sirului de caractere
        token+=sirAlphaNum[Math.floor(Math.random()*sirAlphaNum.length)]
    }
    return token;
}

module.exports.genereazaToken=genereazaToken;