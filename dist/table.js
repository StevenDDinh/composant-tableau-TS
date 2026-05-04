"use strict";
// import { TabulatorFull as Tabulator} from 'tabulator-tables'; //'https://unpkg.com/tabulator-tables@6.4.0/dist/js/tabulator_esm.min.mjs';
// Création d'un nouveau type de filtre de date sur une période définie
Tabulator.extendModule?.("filter", "filters", {
    "dateRange": function (headerValue, rowValue) {
        if (!rowValue || !headerValue.dateDeb || !headerValue.dateFin)
            return true;
        // On transforme la date de la ligne en objet Date
        const [day, month, year] = rowValue.split("/").map(Number);
        const dateLigne = new Date(year, month - 1, day);
        // Comparaison
        return dateLigne >= headerValue.dateDeb && dateLigne <= headerValue.dateFin;
    }
});
// Fonction qui récupère les dates et les convertis en objet date
const recupDate = (idDateDeb, idDateFin) => {
    // On récupère les dates
    const dateDeb = document.querySelector(idDateDeb).value;
    const dateFin = document.querySelector(idDateFin).value;
    // On les convertie en date
    const dateDebNew = new Date(dateDeb);
    const dateFinNew = new Date(dateFin);
    return [dateDebNew, dateFinNew];
};
// Fenêtre de filtre par colonne générique
const filtreGeneral = (event, column) => {
    // Conteneur principal
    const container = document.createElement("div");
    container.className = "popup-filtre";
    // Récupération des données afin de les affichés dans les listes de selection
    const field = column.getField(); // Récupère le nom de la colonne
    const allData = column.getTable().getData(); // Récupère toutes les lignes de la colonne
    const valeursUniques = [...new Set(allData.map(row => row[field]))].filter(v => v !== null && v !== ""); // On créé une nouvelle liste avec que les valeurs de la colonne sans doublon, sans case vide et valeur null
    const currentFilter = column.getHeaderFilterValue() || []; // Récupère l'état actuel des filtres déjà appliqués sinon rien
    // Partie header
    const headerFilter = document.createElement("div");
    headerFilter.className = "popup-headerFilter";
    // Contenue du header
    // Titre du header : "Filtrer par"
    const filterTitle = document.createElement("p");
    filterTitle.innerText = `Filtrer par`;
    headerFilter.appendChild(filterTitle);
    // Icone croix
    const xmark = document.createElement("i");
    xmark.className = "fa-solid fa-xmark";
    headerFilter.appendChild(xmark);
    // Action croix
    xmark.addEventListener("click", () => {
        document.body.click(); // Permet de forcer la fermeture du popup, en simulant un click hors de la fenetre 
    });
    // Partie main
    const mainFilter = document.createElement("div");
    mainFilter.className = "popup-main";
    // Contenue du main
    // Titre du main, ici le nom de la colonne à filtrer
    const fieldName = document.createElement("label");
    fieldName.innerText = column.getDefinition().title || field;
    fieldName.className = "popup-nomChamp";
    const liste = document.createElement("div");
    liste.className = "popup-liste";
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Rechercher...";
    searchInput.className = "popup-search-input";
    const checkboxes = []; // Tableau pour stocker les cases à cocher
    const labelElements = []; // tableau pour stocker les labels à filtrer
    // Ajout option "Tout sélectionner"
    const selectAllLabel = document.createElement("label");
    selectAllLabel.className = "label-tout-selectionner";
    const selectAllCb = document.createElement("input");
    selectAllCb.type = "checkbox";
    selectAllLabel.appendChild(selectAllCb);
    selectAllLabel.appendChild(document.createTextNode(" Tout sélectionner"));
    liste.appendChild(selectAllLabel);
    // Action du "Tout sélectionner"
    selectAllCb.addEventListener("change", (event) => {
        checkboxes.forEach(cb => cb.checked = event.target.checked);
    });
    // Création des cases à cocher pour chaque valeur unique
    valeursUniques.forEach(val => {
        const labelEl = document.createElement("label");
        const inputEl = document.createElement("input");
        inputEl.type = "checkbox";
        inputEl.value = val;
        // Coche la case si elle est déjà dans les filtres actifs
        if (currentFilter.includes(val)) {
            inputEl.checked = true;
        }
        labelEl.appendChild(inputEl);
        labelEl.appendChild(document.createTextNode(" " + val));
        checkboxes.push(inputEl);
        liste.appendChild(labelEl);
        // On sauvegarde le label et sa valeur en minuscules pour la recherche
        labelElements.push({ el: labelEl, val: String(val).toLowerCase() });
    });
    // barre de recherche
    searchInput.addEventListener("input", (event) => {
        const valeurRecherche = event.target.value.toLowerCase();
        labelElements.forEach(item => {
            // Si la valeur contient le texte recherché, on affiche, sinon on masque
            if (item.val.includes(valeurRecherche)) {
                item.el.style.display = ""; // Rétablit l'affichage par défaut
            }
            else {
                item.el.style.display = "none"; // Cache la ligne
            }
        });
    });
    mainFilter.appendChild(fieldName);
    mainFilter.appendChild(searchInput);
    mainFilter.appendChild(liste);
    container.appendChild(headerFilter);
    container.appendChild(mainFilter);
    // Partie footer, les boutons Valider / Réinitialiser
    const footerFilter = document.createElement("div");
    footerFilter.className = "popup-footer";
    const btnReset = document.createElement("button");
    btnReset.className = "btn-reinitialiser";
    btnReset.textContent = "Réinitialiser";
    const btnValider = document.createElement("button");
    btnValider.className = "btn-valider";
    btnValider.textContent = "Valider";
    footerFilter.appendChild(btnReset);
    footerFilter.appendChild(btnValider);
    container.appendChild(footerFilter);
    // Evénements des boutons
    btnValider.addEventListener("click", () => {
        // On récupère toutes les valeurs cochées
        const valeursCochees = checkboxes.filter(cb => cb.checked).map(cb => cb.value);
        if (valeursCochees.length > 0) {
            column.setHeaderFilterValue(valeursCochees); // Applique le filtre
        }
        else {
            column.setHeaderFilterValue(""); // Enlève le filtre si rien n'est coché
        }
        document.body.click(); // Permet de forcer la fermeture du popup, en simulant un click hors de la fenetre
    });
    btnReset.addEventListener("click", () => {
        table.clearFilter(true); // Enlève tous les filtres appliqués
        column.setHeaderFilterValue("");
        afficherResultat(); // Permet d'afficher le nombre de ligne
        document.body.click(); // Permet de forcer la fermeture du popup, en simulant un click hors de la fenetre
    });
    return container;
};
// Fenêtre de filtre date
const filtreDate = (event, column) => {
    // Conteneur principal
    const container = document.createElement("div");
    container.className = "popup-filtre";
    // Partie header
    const headerFilter = document.createElement("div");
    headerFilter.className = "popup-headerFilter";
    // Contenue du header
    // Titre du header : "Filtrer par"
    const filterTitle = document.createElement("p");
    filterTitle.innerText = `Filtrer par`;
    headerFilter.appendChild(filterTitle);
    // Icone croix
    const xmark = document.createElement("i");
    xmark.className = "fa-solid fa-xmark";
    headerFilter.appendChild(xmark);
    // Action croix
    xmark.addEventListener("click", () => {
        document.body.click(); // Permet de forcer la fermeture du popup, en simulant un click hors de la fenetre 
    });
    // Partie main
    const mainFilter = document.createElement("div");
    mainFilter.className = "popup-main";
    const groupeDate = document.createElement("div");
    groupeDate.className = "popup-groupe-date";
    // champ de date debut
    const champDateDeb = document.createElement("div");
    champDateDeb.className = "popup-champ-date";
    const inputDateDeb = document.createElement("input");
    inputDateDeb.className = "popup-input-date-deb";
    inputDateDeb.type = "date";
    const labelDeb = document.createElement("label");
    labelDeb.innerText = "Période du*";
    champDateDeb.appendChild(labelDeb);
    champDateDeb.appendChild(inputDateDeb);
    // champ de date fin
    const champDateFin = document.createElement("div");
    champDateFin.className = "popup-champ-date";
    const inputDateFin = document.createElement("input");
    inputDateFin.className = "popup-input-date-fin";
    inputDateFin.type = "date";
    const labelFin = document.createElement("label");
    labelFin.innerText = "au*";
    champDateFin.appendChild(labelFin);
    champDateFin.appendChild(inputDateFin);
    groupeDate.appendChild(champDateDeb);
    groupeDate.appendChild(champDateFin);
    mainFilter.appendChild(groupeDate);
    // Partie footer, les boutons Valider / Réinitialiser
    const footerFilter = document.createElement("div");
    footerFilter.className = "popup-footer";
    const btnReset = document.createElement("button");
    btnReset.className = "btn-reinitialiser";
    btnReset.textContent = "Réinitialiser";
    const btnValider = document.createElement("button");
    btnValider.className = "btn-valider";
    btnValider.textContent = "Valider";
    footerFilter.appendChild(btnReset);
    footerFilter.appendChild(btnValider);
    container.appendChild(headerFilter);
    container.appendChild(mainFilter);
    container.appendChild(footerFilter);
    // Evénement des boutons
    btnValider.addEventListener("click", () => {
        // Récupération des dates dans une liste grâce aux id 
        const listeDate = recupDate(".popup-input-date-deb", ".popup-input-date-fin");
        const dateDebNew = listeDate[0];
        const dateFinNew = listeDate[1];
        // On applique le filtre DateRange avec les dates de fin et de début passées en paramètre
        table.setFilter("derniereMAJ", "dateRange", {
            dateDeb: dateDebNew,
            dateFin: dateFinNew
        });
        document.body.click(); // Permet de forcer la fermeture du popup, en simulant un click hors de la fenetre 
    });
    btnReset.addEventListener("click", () => {
        table.clearFilter(true); // Enlève tous les filtres appliqués
        column.setHeaderFilterValue("");
        afficherResultat(); // Permet d'afficher le nombre de résulat
        document.body.click(); // Permet de forcer la fermeture du popup, en simulant un click hors de la fenetre 
    });
    return container;
};
// Créer un filtre d'en-tête factice pour permettre au filtre de s'afficher dans la fenêtre contextuelle.
const emptyHeaderFilter = function () {
    return document.createElement("div");
};
const iconeFiltre = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                            <path d="M6.04167 15.0042C5.94583 15.0042 5.84583 14.9833 5.75417 14.9333C5.54583 14.825 5.41667 14.6125 5.41667 14.3792V8.08333L1.19167 4.7875C0.433333 4.1875 0 3.29583 0 2.32917V1.04167C0 0.466667 0.466667 0 1.04167 0H13.9583C14.5333 0 15 0.466667 15 1.04167V2.32917C15 3.29167 14.5667 4.1875 13.8083 4.78333L9.58333 8.07917V12.2917C9.58333 12.4917 9.4875 12.6833 9.32083 12.8L6.40417 14.8833C6.29583 14.9625 6.17083 15 6.04167 15V15.0042ZM1.25 1.25417V2.33333C1.25 2.9125 1.50833 3.45 1.96667 3.80417L6.42917 7.28333C6.57917 7.4 6.67083 7.58333 6.67083 7.775V13.1583L8.3375 11.9667V7.77083C8.3375 7.57917 8.425 7.39583 8.57917 7.27917L13.0417 3.79583C13.4917 3.44167 13.7542 2.90417 13.7542 2.325V1.24583H1.25V1.25417Z" fill="#505458"/>
                          </svg>`;
//Création de la table
const table = new Tabulator("#id-table", {
    ajaxURL: "./data.json",
    layout: "fitDataFill",
    movableColumns: false,
    height: "515px",
    pagination: false,
    paginationSize: 20,
    paginationCounter: (totalRows) => {
        return `  ${totalRows} résultats`;
    },
    paginationSizeSelector: [5, 10, 20],
    rowHeight: 45,
    // Case à cocher
    rowHeader: {
        field: "selection",
        headerSort: false,
        frozen: true,
        headerHozAlign: "center",
        hozAlign: "center",
        formatter: "rowSelection",
        titleFormatter: "rowSelection",
        // @ts-ignore
        headerPopup: false,
        headerPopupIcon: "",
        headerFilter: false,
        cellClick: (even, cell) => {
            cell.getRow().toggleSelect();
        }
    },
    // Définition des colonnes par défaut
    columnDefaults: {
        width: "auto",
        vertAlign: "middle",
        // @ts-ignore
        headerPopup: filtreGeneral,
        headerPopupIcon: iconeFiltre,
        headerFilter: emptyHeaderFilter,
        headerFilterFunc: "in",
        formatter: (cell) => {
            const val = cell.getValue() || "";
            return `
                    <input type="text" class="champ-encadre" value="${val}" placeholder="Saisir un nom...">
                `;
        },
        // 2. On sauvegarde la donnée quand l'utilisateur tape du texte
        // cellClick: (e, cell) => {
        //     const vTarget= <HTMLSelectElement>e.target
        //     if (vTarget.tagName === "INPUT") {
        //         vTarget.addEventListener('input', (event) => {
        //             cell.setValue((<HTMLSelectElement>event.target).value);
        //         }, { once: true });
        //     }
        // }
    },
    // Définition des colonnes du tableau
    columns: [
        //Colonne Civilité
        { title: "Civilite", field: "civilite",
            //Editer la colonne qu'avec la liste de valeur définie dans editorParams
            editor: "list", editorParams: {
                values: ["M.", "Mme"]
            },
            // A voir si je garde ou pas 
            formatter: (cell) => {
                const val = cell.getValue() || "";
                return `
                    <select class="champ-encadre">
                        <option value="Monsieur" ${val === 'M.' ? 'selected' : ''}>Monsieur</option>
                        <option value="Madame" ${val === 'Mme' ? 'selected' : ''}>Madame</option>
                    </select>
                `;
            }
        },
        //Colonne Nom
        { title: "Nom", field: "nom", editor: "input" },
        //Colonne Prenom
        { title: "Prenom", field: "prenom", editor: "input" },
        //Colonne Fonction
        { title: "Fonction", field: "fonction", editor: "input" },
        //Colonne Telephone
        { title: "Telephone", field: "telephone", editor: "input" },
        //Colonne Mail
        { title: "Mail", field: "mail", editor: "input" },
        //Colonne DerniereMAJ
        { title: "DerniereMAJ", field: "derniereMAJ", editor: "date", editorParams: {
                format: "dd/MM/yyyy" // Pour ne pas avoir les dates au format anglais
            },
            sorter: "date",
            // @ts-ignore
            headerPopup: filtreDate,
            headerPopupIcon: iconeFiltre,
            headerFilter: emptyHeaderFilter,
            headerFilterFunc: "like"
        },
        //Colonne AccesSupport
        { title: "AccesSupport", field: "accesSupport",
            editor: "list", editorParams: {
                values: ["true", "false"]
            } },
        //Colonne ContactPrincipe
        { title: "ContactPrincipe", field: "contactPrincipe",
            editor: "list", editorParams: {
                values: ["true", "false"]
            }
        },
        // Colonne action
        { title: "Petit btn", field: "faker", frozen: true, headerSort: false,
            formatter: (cell) => {
                const checked = cell.getValue() ? "checked" : "";
                // On crée un switch HTML classique
                return `
                    <label class="switch">
                        <input type="checkbox" ${checked}>
                        <span class="slider round"></span>
                    </label>`;
            },
            // @ts-ignore
            headerPopup: false,
            headerFilter: undefined,
            headerPopupIcon: "" },
        { title: "Bouton action 1", field: "faker", frozen: true, headerSort: false,
            formatter: (cell) => {
                const checked = cell.getValue() ? "checked" : "";
                // On crée un switch HTML classique
                return `
                    <label class="switch">
                        <input type="checkbox" ${checked}>
                        <span class="slider round"></span>
                    </label>`;
            },
            // @ts-ignore
            headerPopup: false,
            headerFilter: undefined,
            headerPopupIcon: "" },
        { title: "Bouton action 2", field: "faker", frozen: true, headerSort: false,
            formatter: (cell) => {
                const checked = cell.getValue() ? "checked" : "";
                // On crée un switch HTML classique
                return `
                    <label class="switch">
                        <input type="checkbox" ${checked}>
                        <span class="slider round"></span>
                    </label>`;
            },
            // @ts-ignore
            headerPopup: false,
            headerFilter: undefined,
            headerPopupIcon: "" },
    ],
    // Affichage dans le footer le nombre de lignes selectionnées 
    footerElement: `<div id="id-footer-nb-ligne">
                        <div id='compteur-selection'></div>
                        <button id="supprimer-ligne" style="display:none" >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M15.36 3.768H11.37C11.37 2.51682 10.3478 1.5 9.09 1.5C7.8322 1.5 6.81 2.51682 6.81 3.768H2.82C2.5046 3.768 2.25 4.02126 2.25 4.335C2.25 4.64874 2.5046 4.902 2.82 4.902H3.77V14.541C3.77 15.6863 4.7086 16.62 5.86 16.62H12.32C13.4714 16.62 14.41 15.6863 14.41 14.541V4.902H15.36C15.6754 4.902 15.93 4.64874 15.93 4.335C15.93 4.02126 15.6754 3.768 15.36 3.768ZM9.09 2.634C9.717 2.634 10.23 3.1443 10.23 3.768H7.95C7.95 3.1443 8.463 2.634 9.09 2.634ZM13.27 14.541C13.27 15.0626 12.8444 15.486 12.32 15.486H5.86C5.3356 15.486 4.91 15.0626 4.91 14.541V4.902H13.27V14.541Z" fill="#505458"/>
                                <path d="M7.77744 13.5601C8.08869 13.5601 8.33994 13.3088 8.33994 12.9976V7.37256C8.33994 7.06131 8.08869 6.81006 7.77744 6.81006C7.46619 6.81006 7.21494 7.06131 7.21494 7.37256V12.9976C7.21494 13.3088 7.46619 13.5601 7.77744 13.5601Z" fill="#505458"/>
                                <path d="M10.4026 13.5601C10.7138 13.5601 10.9651 13.3088 10.9651 12.9976V7.37256C10.9651 7.06131 10.7138 6.81006 10.4026 6.81006C10.0913 6.81006 9.84006 7.06131 9.84006 7.37256V12.9976C9.84006 13.3088 10.0913 13.5601 10.4026 13.5601Z" fill="#505458"/>
                            </svg>
                            Supprimer
                        </button>
                        <div id="icone-croix" style="display:none">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <mask id="mask0_248_169" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="12" height="12">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M0.96967 0.969666C1.26256 0.676778 1.73744 0.676778 2.03033 0.969666L11.0303 9.96952C11.3232 10.2624 11.3232 10.7373 11.0303 11.0302C10.7374 11.3231 10.2626 11.3231 9.96967 11.0302L0.96967 2.03031C0.676777 1.73742 0.676777 1.26256 0.96967 0.969666Z" fill="#006FFD"/>
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M11.0303 0.969666C10.7374 0.676778 10.2626 0.676778 9.96967 0.969666L0.96967 9.96952C0.676777 10.2624 0.676777 10.7373 0.96967 11.0302C1.26256 11.3231 1.73744 11.3231 2.03033 11.0302L11.0303 2.03031C11.3232 1.73742 11.3232 1.26256 11.0303 0.969666Z" fill="#006FFD"/>
                                </mask>
                                <g mask="url(#mask0_248_169)">
                                    <rect width="12" height="11.9998" fill="white"/>
                                </g>
                            </svg>
                        </div>
                        <div id="total-resultat"></div>
                    </div>`,
});
// Partie evenement
const barrRecherche = document.querySelector("#input-barre-rechercher");
const btnFiltreGlobal = document.querySelector("#btn-filtre");
const fntFiltre = document.querySelector("#popup-interrogation");
const btnFermer = document.querySelector("#fermer-interrogation");
const btnAnnuler = document.querySelector(".btn-annuler-av");
const btnValider = document.querySelector(".btn-valider-av");
const btnReinitialiser = document.querySelector(".btn-reinitialiser-av");
const selectNom = document.querySelector("#nomSelect");
const selectPrenom = document.querySelector("#prenomSelect");
const selectFonction = document.querySelector("#fonctionSelect");
const inputDateDeb = document.querySelector("#dateDeb-global");
const inputDateFin = document.querySelector("#dateFin-global");
//Barre de recherche
barrRecherche?.addEventListener("keyup", () => {
    const valeur = barrRecherche.value;
    // Recherche dans toutes les colonnes avec la méthode setFilter, pour utiliser la logique "OU", on utilise un tableau imbriqué : [[]]
    table.setFilter([
        [
            { field: "civilite", type: "like", value: valeur },
            { field: "nom", type: "like", value: valeur },
            { field: "prenom", type: "like", value: valeur },
            { field: "fonction", type: "like", value: valeur },
            { field: "telephone", type: "like", value: valeur },
            { field: "derniereMAJ", type: "like", value: valeur },
            { field: "accesSupport", type: "like", value: valeur },
            { field: "contactPrincipe", type: "like", value: valeur }
        ]
    ]);
});
//Bouton organiser les colonnes
document.addEventListener("DOMContentLoaded", () => {
    const btnOrganiser = document.querySelector("#btn-organiser-colonne");
    const popupOrganisation = document.querySelector("#popupOrganisation");
    // Partie header
    const headerOrga = document.createElement("div");
    headerOrga.className = "popup-orga-header";
    // Contenue du header
    const divGauche = document.createElement("div");
    divGauche.className = "popup-orga-header-div-gauche";
    const gearMark = document.createElement("i");
    gearMark.id = "popup-orga-headerGearMark";
    gearMark.className = "fa-solid fa-gear";
    divGauche.appendChild(gearMark);
    const filterTitle = document.createElement("p");
    filterTitle.id = "popup-orga-headerTitre";
    filterTitle.innerText = `Paramétrage du tableau`;
    divGauche.appendChild(filterTitle);
    headerOrga.appendChild(divGauche);
    const xmark = document.createElement("i");
    xmark.className = "popup-orga-headerXmark";
    xmark.className = "fa-solid fa-xmark";
    headerOrga.appendChild(xmark);
    // Action croix
    xmark.addEventListener("click", () => {
        document.body.click(); // Permet de forcer la fermeture du popup, en simulant un click hors de la fenetre 
    });
    // Partie body
    const bodyOrga = document.createElement("div");
    bodyOrga.className = "popup-orga-body";
    const listeColonnes = document.createElement("div");
    listeColonnes.className = "popup-orga-liste-colonne";
    table.on("tableBuilt", () => {
        const colonnes = table.getColumns();
        // On génère les colonnes à organiser
        colonnes.forEach((col) => {
            const def = col.getDefinition();
            if (!def.title)
                return; // Ignore la colonne des checkbox
            const colonne = document.createElement("label");
            colonne.className = "popup-orga-colonne";
            const checkbox = document.createElement("input");
            checkbox.className = "popup-orga-checkbox";
            checkbox.type = "checkbox";
            checkbox.checked = col.isVisible();
            checkbox.addEventListener("change", () => {
                col.toggle();
            });
            colonne.appendChild(checkbox);
            colonne.appendChild(document.createTextNode(def.title));
            listeColonnes.appendChild(colonne);
        });
    });
    // Partie footer
    const footerOrga = document.createElement("div");
    footerOrga.className = "popup-orga-footer";
    const btnReset = document.createElement("button");
    btnReset.className = "btn-reinitialiser";
    btnReset.textContent = "Réinitialiser";
    const btnValider = document.createElement("button");
    btnValider.className = "btn-valider";
    btnValider.textContent = "Valider";
    footerOrga.appendChild(btnReset);
    footerOrga.appendChild(btnValider);
    // Evénements des boutons
    btnValider.addEventListener("click", () => {
        // On récupère toutes les valeurs cochées
        // const valeursCochees = checkboxes.filter(cb => cb.checked).map(cb => cb.value);
        // if (valeursCochees.length > 0) {
        //     column.setHeaderFilterValue(valeursCochees); // Applique le filtre
        // } else {
        //     column.setHeaderFilterValue(""); // Enlève le filtre si rien n'est coché
        // }
        document.body.click(); // Permet de forcer la fermeture du popup, en simulant un click hors de la fenetre 
    });
    // btnReset.addEventListener("click", () => {
    //     console.log("début du reset");
    //     table.getColumns().forEach(col => {
    //         console.log(col.is)
    //         table.on("rowDeselected",(row)=>{
    //             row.toggleSelect()
    //         });
    //     });
    //     console.log("fin du reset");
    //     document.body.click(); // Permet de forcer la fermeture du popup, en simulant un click hors de la fenetre
    // });
    bodyOrga.appendChild(listeColonnes);
    popupOrganisation?.appendChild(headerOrga);
    popupOrganisation?.appendChild(bodyOrga);
    popupOrganisation?.appendChild(footerOrga);
    if (popupOrganisation) {
        btnOrganiser?.addEventListener("click", (event) => {
            // Si le menu est déjà ouvert, on le ferme et on s'arrête
            if (popupOrganisation.style.display === "block") {
                popupOrganisation.style.display = "none";
                return;
            }
            // On affiche le menu sinon
            popupOrganisation.style.display = "block";
        });
        // Refermer le menu si on clique ailleurs
        document.addEventListener("click", (event) => {
            if (popupOrganisation && !popupOrganisation.contains(event.target) && event.target !== btnOrganiser) {
                popupOrganisation.style.display = "none";
            }
        });
    }
});
// Bouton filtre pour ouvrir et fermer la fenetre popup
document.addEventListener("DOMContentLoaded", () => {
    if (fntFiltre) {
        // Ouvrir / Fermer au clic sur le bouton principal
        btnFiltreGlobal?.addEventListener("click", () => {
            // Si ouvert, on ferme la fenetre, on ouvre sinon
            if (fntFiltre.style.display === "block") {
                fntFiltre.style.display = "none";
            }
            else {
                fntFiltre.style.display = "block";
            }
        });
        // Fermer avec la croix ou le bouton Annuler
        btnFermer?.addEventListener("click", () => {
            fntFiltre.style.display = "none";
        });
        btnAnnuler?.addEventListener("click", () => {
            fntFiltre.style.display = "none";
        });
        // Bouton réinitialiser
        btnReinitialiser?.addEventListener("click", () => {
            if (selectNom)
                selectNom.selectedIndex = 0;
            if (selectPrenom)
                selectPrenom.selectedIndex = 0;
            if (selectFonction)
                selectFonction.selectedIndex = 0;
            if (inputDateDeb)
                inputDateDeb.value = "";
            if (inputDateFin)
                inputDateFin.value = "";
            fntFiltre.style.display = "none";
            table.clearFilter(true);
            afficherResultat();
        });
    }
    // Refermer la fenetre si on clique ailleurs
    document.addEventListener("click", (event) => {
        if (fntFiltre && !fntFiltre.contains(event.target) && event.target !== btnFiltreGlobal) {
            fntFiltre.style.display = "none";
        }
    });
});
/**
 * Remplit dynamiquement un menu déroulant selon les données du tableau
 * - select : L'ID de l'élément HTML <select>
 * - valeur : Le champ de données (colonne) dont on veut extraire les valeurs
 * - data : Les données du tableau récupéré
 */
const remplisseurDeSelect = (select, valeur, data) => {
    // Récupération de l'élément HTML
    const selectNom = document.querySelector('#' + select);
    // Création d'une liste des données récupérées de la colonne désirée
    let listeNom = [];
    data.forEach((ligne) => {
        listeNom.push(ligne[valeur]);
    });
    [...new Set(listeNom.sort())].forEach((elt) => {
        const newOption = document.createElement("option");
        newOption.value = elt;
        newOption.innerText = elt;
        selectNom?.appendChild(newOption);
    });
};
// Appel de remplisseurDeSelect après construction du tableau
document.addEventListener("DOMContentLoaded", () => {
    table.on("tableBuilt", () => {
        const data = table.getData();
        remplisseurDeSelect("nomSelect", "nom", data);
        remplisseurDeSelect("prenomSelect", "prenom", data);
        remplisseurDeSelect("fonctionSelect", "fonction", data);
    });
});
// Bouton valider de la fenetre de filtre global
btnValider?.addEventListener("click", () => {
    const listeDate = recupDate("#dateDeb-global", "#dateFin-global"); // Récupération des dates entrées dans le filtre
    const dateDebValide = listeDate[0] && !isNaN(listeDate[0].getTime()); // On vérifie que la date récupérée est bien un nombre valide
    const dateFinValide = listeDate[1] && !isNaN(listeDate[1].getTime());
    table.clearFilter(true); // Réinitialisation de tous les filtres en cours d'application
    if (selectNom?.value && selectNom.value !== "Sélectionner") {
        table.addFilter("nom", "like", selectNom.value);
    }
    if (selectPrenom?.value && selectPrenom.value !== "Sélectionner") {
        table.addFilter("prenom", "like", selectPrenom.value);
    }
    if (selectFonction?.value && selectFonction.value !== "Sélectionner") {
        table.addFilter("fonction", "like", selectFonction.value);
    }
    if (dateDebValide && dateFinValide) {
        table.addFilter("derniereMAJ", "dateRange", {
            dateDeb: listeDate[0],
            dateFin: listeDate[1]
        });
    }
    afficherResultat();
    document.body.click(); // Permet de forcer la fermeture du popup, en simulant un click hors de la fenetre
});
//Affiche dans le footer le nombre de ligne total affiché sur le tableau
const afficherResultat = () => {
    const totalLigne = document.querySelector("#total-resultat");
    if (totalLigne) {
        totalLigne.textContent = `${table.getDataCount("active")} résultats`;
    }
};
// Appelle la fonction afficherResultat après construction du tableau 
table.on("tableBuilt", () => {
    afficherResultat();
});
// Affiche afficherResultat après suppression d'une ligne
table.on("rowDeleted", () => {
    afficherResultat();
});
//Affiche le nombre de ligne selectionné et les boutons actions liés, si des cases sont cochées
table.on("rowSelectionChanged", (data) => {
    const compteur = document.querySelector('#compteur-selection');
    const suppr = document.querySelector("#supprimer-ligne");
    const divCroix = document.querySelector("#icone-croix");
    const result = document.querySelector("#total-resultat");
    const footer = document.querySelector('.tabulator .tabulator-footer .tabulator-footer-contents');
    const iconeCroix = document.querySelector("#icone-croix svg");
    const nbLignes = data.length;
    //affiche le nombre de ligne et active le bouton supprimer dans le footer s'il y a au moins une ligne selectionnée
    if (compteur && suppr && divCroix && footer && result) {
        // Permet de désactiver ou d'activer l'affichage du nombre de ligne et le bouton selon les paramètres css
        const affichageLigneCaseACoche = (valCompteur, valSuppr, valCroix, valResult, valFooter) => {
            compteur.textContent = valCompteur;
            suppr.style.display = valSuppr;
            divCroix.style.display = valCroix;
            result.style.display = valResult;
            footer.style.background = valFooter;
        };
        if (nbLignes > 0) {
            const nbLigneString = ` ${nbLignes} ligne(s) sélectionnée(s)`;
            affichageLigneCaseACoche(nbLigneString, "block", "block", "none", "#006EDC");
        }
        else {
            affichageLigneCaseACoche("", "none", "none", "block", "#ECF0F4");
        }
        //Bouton "supprimer" qui supprime les lignes selectionnées
        suppr?.addEventListener("click", () => {
            const ligneSelectionne = table.getSelectedData(); // Récupération de toutes les lignes selectionnées
            ligneSelectionne.forEach((ligne) => {
                table.deleteRow(ligne["id"]); // On efface la ligne grace à son id
            });
            if (compteur && suppr) {
                affichageLigneCaseACoche("", "none", "none", "block", "#ECF0F4");
            }
        });
        // Bouton "croix" qui annule la selection de toutes les cases à cochées
        iconeCroix?.addEventListener("click", () => {
            table.deselectRow();
        });
    }
});
