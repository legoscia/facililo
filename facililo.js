function enarbigu(arbero, vortero, tipo) {
    if (!arbero) arbero = [];
    if (vortero.length == 0) {
        arbero['ekzistas'] = tipo;
        return arbero;
    }
    else {
        var litero = vortero[0];
        arbero[litero] = enarbigu(arbero[litero], vortero.slice(1), tipo);
        return arbero;
    }
}
        
var arbo = [];
for (var i = 0; i < Object.keys(vortaroTreFacilaj).length; i++) {
    var vorto = Object.keys(vortaroTreFacilaj)[i];
    var tipo = vortaroTreFacilaj[vorto];
    if (tipo == 1) {
        // por vortoj kun vortklasa finaĵo, konservu nur radikon
        vorto = vorto.slice(0, vorto.length - 1);
    }
    arbo = enarbigu(arbo, vorto, tipo);
}

var FaciliĝuModelo = function() {
    this.teksto = ko.observable('');
    this.kontrolorezulto = ko.observable({vortoj: 0, treFacilaj: 0, facilaj: [], malfacilaj: []});

    var kunMalfruo = ko.computed(this.teksto).extend({ throttle: 500 });
    kunMalfruo.subscribe(function(laTeksto) {
        this.kontrolorezulto(kontrolu(laTeksto));
    }, this);
}

function kontrolu(teksto) {
    var vortoRe = /[a-zĉĝĥĵŝŭ]+/gi;

    var vortoj = teksto.match(vortoRe);

    if (!vortoj) {
        return {vortoj: 0, treFacilaj: 0, facilaj: [], malfacilaj: []};
    }

    console.log("Trovis vortojn: " + vortoj.toString());

    var malfacilaj = [], neTreFacilaj = [], treFacilaj = 0;

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
    // Ĉu ĝi estas verbo?
    var verbradiko;
    if (verbradiko = senSufiksoj(vorto, ["i", "as", "is", "os", "us", "u"])) {
        var rezulto = ĉuEnestas(verbradiko, false);
        if (rezulto < 2) {
            return rezulto;
        }
    }

    // Ĉu ĝi estas substantivo?
    var substantivradiko;
    if (substantivradiko = senSufiksoj(vorto, ["o", "on", "oj", "ojn"])) {
        var rezulto = ĉuEnestas(substantivradiko, false);
        if (rezulto < 2) {
            return rezulto;
        }
    }

    // Ĉu ĝi estas adjektivo?
    var adjektivradiko;
    if (adjektivradiko = senSufiksoj(vorto, ["a", "an", "aj", "ajn"])) {
        var rezulto = ĉuEnestas(adjektivradiko, false);
        if (rezulto < 2) {
            return rezulto;
        }
    }

    // Ĉu ĝi estas adverbo?
    var adverbradiko;
    if (adverbradiko = senSufiksoj(vorto, ["e", "en"])) {
        var rezulto = ĉuEnestas(adverbradiko, false);
        if (rezulto < 2) {
            return rezulto;
        }
    }

    return ĉuEnestas(vorto, true);
}

function ĉuEnestas(vorto, devasEstiSenfinaĵa) {
    var arbero = arbo;
    for (var i = 0; i < vorto.length; i++) {
        if (arbero[vorto[i]]) {
            arbero = arbero[vorto[i]];
            if (arbero['ekzistas']) {
                if (i + 1 < vorto.length) {
		    // XXX: skribtablo vs skribotablo
                    if (ĉuEnestas(vorto.slice(i + 1), devasEstiSenfinaĵa) == 0) {
                        return 0;
                    }
                }
                else if (arbero['ekzistas'] == 2 || !devasEstiSenfinaĵa) {
                    return 0;
                }
            }
        }
        else
            break;
    }

    if (vortaroFacilaj.indexOf(vorto) != -1) {
        return 1;
    } else {
        return 2;
    }
}

ko.applyBindings(new FaciliĝuModelo());
