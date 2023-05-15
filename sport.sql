DROP TYPE IF EXISTS categ_produs_sport;
DROP TYPE IF EXISTS tipuri_produse_sport;

CREATE TYPE categ_produs_sport AS ENUM( 'incepator', 'intermediar', 'avansat', 'pentru copii', 'extrem','uzual'); --extrem = highend si uzual gen recomandat
CREATE TYPE tipuri_produse_sport AS ENUM('barbati','unisex','femei', 'copii');


CREATE TABLE IF NOT EXISTS produs_sport (
   id serial PRIMARY KEY, --a
   nume VARCHAR(50) UNIQUE NOT NULL,--b
   descriere TEXT,--c
   imagine VARCHAR(300),--d
   tip_produs tipuri_produse_sport DEFAULT 'unisex',--e
   categorie categ_produs_sport DEFAULT 'uzual',--f
   pret NUMERIC(8,2) NOT NULL,--g
   bucati INT NOT NULL CHECK (bucati>=0),--h
   greutate INT NOT NULL CHECK (greutate>=0), -- extra ca sa fie 3 cu numere 
   data_adaugare TIMESTAMP DEFAULT current_timestamp,--i
   culoare VARCHAR(15) NOT NULL CHECK (culoare IN ('Rosu', 'Verde', 'Albastru', 'Negru', 'Alb', 'Portocaliu', 'Galben', 'Gri', 'Multicolor')), --j
   materiale VARCHAR[], --k pot sa nu fie specificare deci nu punem NOT NULL
   testat BOOLEAN NOT NULL DEFAULT FALSE
   );
INSERT INTO produs_sport (nume, descriere, imagine, tip_produs, categorie, pret, bucati, greutate, culoare, materiale, testat) 
VALUES ('Minge Spalding', 'Minge de baschet cu design atractiv si performanta superioara', 'minge_spalding.jpg', 'barbati', 'avansat', 200, 1, 400, 'Portocaliu', '{piele, cauciuc}', TRUE);
INSERT INTO produs_sport (nume, descriere, imagine, tip_produs, categorie, pret, bucati, greutate, culoare, materiale, testat) 
VALUES ('Set Golf Callaway', 'Set de golf cu 10 piese marca Callaway pentru jucatori intermediari si avansati', 'set_golf_callaway.jpg', 'unisex', 'avansat', 2000, 1, 1555, 'Negru', '{otel, carbon, piele}', FALSE);
INSERT INTO produs_sport (nume, descriere, imagine, tip_produs, categorie, pret, bucati, greutate, culoare, materiale, testat) VALUES
('Bicicletă de oraș', 'Bicicletă de oraș, ușoară și cu design modern', 'bicicleta_oras.jpg', 'copii', 'uzual', 1200, 1, 7000,'Alb', '{oțel, aluminiu}', TRUE),
('Bicicletă de munte', 'Bicicletă de munte, cu suspensie puternică și frâne hidraulice', 'bicicleta_munte.jpg', 'femei', 'avansat', 3500, 1, 4700,'Verde', '{oțel, aluminiu, carbon}', TRUE);
INSERT INTO produs_sport(nume, descriere, imagine, tip_produs, categorie, pret, bucati, greutate, culoare, materiale, testat) VALUES
('Minge Nike', 'Minge de football Nike super usoara si moderna', 'minge_nike.jpg', 'barbati', 'extrem', 400, 1, 300,'Multicolor' ,'{PU, PVC}', FALSE),
('Minge Baschet Tarmak', 'Mingi de baschet Tarmak, conform FIBA mingea este de marimea 7', 'bakset_tarmak', 'unisex', 'interdemiar',149.99, 2, 450,'Portocaliu' ,'{cauciuc, latex}', FALSE)
('Vitamine Veggie', 'Vitamine esentiale cu continut ridicat de B-uri', 'vitamine.jpg', 'unisex', 'uzual', 49.99, 30, 50, 'Negru', '{ulei de peste, leguminoase, fibra}', TRUE)
('Bicicletă de zăpadă', 'Bicicletă specială pentru sporturile de iarnă, cu frână pe disc și cadru din aluminiu', 'bicicleta_zapada.jpg', 'unisex', 'extrem', 2499.99, 1, 11000, 'Multicolor', '{aluminiu, oțel}', TRUE),
('Placă de zăpadă', 'Placă pentru sporturile de iarnă, cu design modern și ergonomie ridicată', 'placa_de_zapada.jpg', 'unisex', 'extrem', 799.99, 1, 1700, 'Albastru', '{polietilenă}', TRUE),
('Placă de surf', 'Placă pentru sporturile de apă, cu dimensiuni mici și design modern', 'placa_surf.jpg', 'femei', 'intermediar', 1499.99, 1, 1200, 'Albastru', '{poliuretan}', TRUE);
