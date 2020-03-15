## JClic Check Download

https://clic.xtec.cat/utils/checkspeed

Aquest projecte serveix per a mesurar la velocitat de resposta en la descàrrega de projectes JClic del servidor clic.xtec.cat (o de qualsevol altre servidor).

El primer pas per utilitzar l'aplicació és indicar el _path_ d'un dels projectes disponibles. Aquesta expressió es mostra al paràmetre `prj` de l'URL de la [biblioteca de projectes](https://clic.xtec.cat/repo/) en seleccionar qualsevol targeta.

L'aplicació descarrega primer el fitxer `project.json` del directori indicat. Aquest fitxer conté la llista de fitxers del projecte i informació diversa com ara la seva mida total i altres característiques.

Es poden utilitzar fins a 6 connexions simultànies, que és l'[estàndard](https://docs.pushtechnology.com/cloud/latest/manual/html/designguide/solution/support/connection_limitations.html) en la majoria de navegadors web moderns. Aquest paràmetre es pot ajustar entre 1 i 6 abans de llençar la descàrrega dels fitxers.

Quan es detecta que un fitxer triga més de 3 segons a ser descarregat es mostra en color taronja. Quan són més de 6 segons passa a vermell.

Les gràfiques mostren l'evolució del nombre de fitxers i KBytes descarregats al llarg del temps. Les línies planes demostren una aturada de la connexió.

Per repetir la prova amb un altre projecte cal recarregar la pàgina.

---

Aquest projecte ha estat desenvolupat amb [React](https://reactjs.org/), [Material UI](https://material-ui.com/) i [Recharts](http://recharts.org/), i es distribueix sota els termes de la [Llicència Pública de la Unió Europea v. 1.2](https://eupl.eu/1.2/en/).
