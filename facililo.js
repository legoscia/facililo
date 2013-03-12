var FaciliĝuModelo = function() {
    this.teksto = ko.observable('');
    this.kontrolorezulto = ko.observable({vortoj: 0, treFacilaj: 0, facilaj: [], malfacilaj: []});

    var kunMalfruo = ko.computed(this.teksto).extend({ throttle: 500 });
    kunMalfruo.subscribe(function(laTeksto) {
        console.log("Kontrolas na " + laTeksto);
        this.kontrolorezulto(kontrolu(laTeksto));
    }, this);
}

function kontrolu(teksto) {
    var vortoRe = /[a-zĉĝĥĵŝŭ]+/gi;

    var vortoj = teksto.match(vortoRe);

    if (!vortoj) {
        return "Nenio estas tajpita.";
    }

    console.log("Trovis vortojn: " + vortoj.toString());

    var malfacilaj = [], neTreFacilaj = [], treFacilaj = 0;
    console.log("vortoj: "+typeof vortoj);

    for (var i = 0; i < vortoj.length; i++) {
        var vorto = vortoj[i];
        var minuskla = vorto.toLowerCase();
        var rezulto = kontroliVorton(minuskla);
        if (rezulto == 0) {
            treFacilaj++;
        }
        else if (rezulto == 1) {
            neTreFacilaj.push(vorto);
        }
        else {
            malfacilaj.push(vorto);
        }
    }
    return {
        vortoj: vortoj.length,
        treFacilaj: treFacilaj,
        facilaj: neTreFacilaj,
        malfacilaj: malfacilaj };
}

// Se 'sufikso' estas ĉe la fino de 'vorto', redonu 'vorto'n sen
// 'sufikso', alie redonu null.
function senSufikso(vorto, sufikso) {
    var kie = vorto.indexOf(sufikso, vorto.length - sufikso.length);
    if (kie == -1) {
        return null;
    } else {
        return vorto.substring(0, kie);
    }
}

function senSufiksoj(vorto, sufiksoj) {
    for (var i = 0; i < sufiksoj.length; i++) {
        var rezulto = senSufikso(vorto, sufiksoj[i]);
        if (rezulto) {
            return rezulto;
        }
    }
    return null;
}

// 0 = tre facila vorto, 1 = facila vorto, 2 = malfacila vorto
function kontroliVorton(vorto) {
    // Ĉu ĝi estas verbo ne-infinitiva?
    var verbradiko;
    if (verbradiko = senSufiksoj(vorto, ["as", "is", "os", "us", "u"])) {
        var infinitiva = verbradiko + "i";
        var rezulto = ĉuEnestas(infinitiva);
        if (rezulto < 2) {
            return rezulto;
        }
    }

    // Ĉu ĝi estas substantivo ne-nominativa / ne-ununombra?
    var substantivradiko;
    if (substantivradiko = senSufiksoj(vorto, ["on", "oj", "ojn"])) {
        var nominativununombra = substantivradiko + "o";
        var rezulto = ĉuEnestas(nominativununombra);
        if (rezulto < 2) {
            return rezulto;
        }
    }

    // Ĉu ĝi estas adjektivo ne-nominativa / ne-ununombra?
    var adjektivradiko;
    if (adjektivradiko = senSufiksoj(vorto, ["an", "aj", "ajn"])) {
        var nominativununombra = adjektivradiko + "a";
        var rezulto = ĉuEnestas(nominativununombra);
        if (rezulto < 2) {
            return rezulto;
        }
    }

    // Ĉu ĝi estas adverbo kun akuzativa finaĵo?
    var adverbradiko;
    if (adverbradiko = senSufikso(vorto, "en")) {
        var senakuzativa = adverbradiko + "e";
        var rezulto = ĉuEnestas(senakuzativa);
        if (rezulto < 2) {
            return rezulto;
        }
    }

    return ĉuEnestas(vorto);
}

function ĉuEnestas(vorto) {
    if (vortaroTreFacilaj.indexOf(vorto) != -1) {
        return 0;
    } else if (vortaroFacilaj.indexOf(vorto) != -1) {
        return 1;
    } else {
        return 2;
    }
}

ko.applyBindings(new FaciliĝuModelo());
