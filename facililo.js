// Copyright (C) 2013 Magnus Henoch <magnus.henoch@gmail.com>
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

function enarbigu(arbero, vortero, tipo, nivelo) {
    if (!arbero) arbero = [];
    if (vortero.length == 0) {
        arbero['ekzistas'] = {tipo: tipo, nivelo: nivelo};
        return arbero;
    }
    else {
        var litero = vortero[0];
        arbero[litero] = enarbigu(arbero[litero], vortero.slice(1), tipo, nivelo);
        return arbero;
    }
}
        
var arbo = [];
for (var vorto in vortaroTreFacilaj) {
    var tipo = vortaroTreFacilaj[vorto];
    if (tipo == 1) {
        // por vortoj kun vortklasa finaĵo, konservu nur radikon
        vorto = vorto.slice(0, vorto.length - 1);
    }
    arbo = enarbigu(arbo, vorto, tipo, 0);
}
for (var i in prefiksojTreFacilaj) {
    arbo = enarbigu(arbo, prefiksojTreFacilaj[i], 1, 0);
}
for (var i in sufiksojTreFacilaj) {
    arbo = enarbigu(arbo, sufiksojTreFacilaj[i], 1, 0);
}
// for (var vorto in vortaroFacilaj) {
//     var tipo = vortaroFacilaj[vorto];
//     if (tipo == 1) {
//         // por vortoj kun vortklasa finaĵo, konservu nur radikon
//         vorto = vorto.slice(0, vorto.length - 1);
//     }
//     arbo = enarbigu(arbo, vorto, tipo, 1);
// }
// XXX: intertempe anstataŭigendaj vortoj estas "facilaj".
for (var vorto in vortaroAnstatauigendaj) {
    var tipo = vortaroAnstatauigendaj[vorto];
    if (tipo == 1) {
        // por vortoj kun vortklasa finaĵo, konservu nur radikon
        vorto = vorto.slice(0, vorto.length - 1);
    }
    arbo = enarbigu(arbo, vorto, tipo, 1);
}

var FaciliĝuModelo = function(komencaTeksto, redaktebla) {
    var self = this;

    this.redaktebla = ko.observable(redaktebla);
    this.redaktebligu = function() {
	self.redaktebla(true);
    };

    this.teksto = ko.observable(komencaTeksto);
    this.kontrolorezulto = ko.observable(kontrolu(maliksigu(komencaTeksto)));
    this.maliksigu = ko.observable(true);

    this.ebleMaliksigita = ko.computed(function() {
	if (this.maliksigu()) {
	    return maliksigu(this.teksto());
	} else {
	    return this.teksto();
	}
    }, this);
    var kunMalfruo = ko.computed(this.ebleMaliksigita).extend({ throttle: 500 });
    kunMalfruo.subscribe(function(laTeksto) {
        this.kontrolorezulto(kontrolu(laTeksto));
    }, this);

    this.rekontrolu = function() {
	var teksto = self.ebleMaliksigita();
	console.log(teksto);
	var rezulto = kontrolu(teksto);
	console.log(rezulto);
	self.kontrolorezulto(rezulto);
	console.log("ŝanĝita!");
    };

    this.url = ko.observable(null);
    this.kreuURLn = function() {
	var kodigitaTeksto = encodeURIComponent(self.ebleMaliksigita());
	var novaURL = window.location.href.replace(/\?.*$/, "") + "?t=" + kodigitaTeksto;
	this.url(novaURL);
    };
    this.nuliguURLn = function() {
	this.url(null);
    };

    this.montrasHelpon = ko.observable(false);
    this.montruHelpon = function() {
	self.montrasHelpon(true);
    };
    this.malmontruHelpon = function() {
	self.montrasHelpon(false);
    };
}

function maliksigu(teksto) {
    return teksto
	.replace(/Cx/g, "Ĉ")
	.replace(/Gx/g, "Ĝ")
	.replace(/Hx/g, "Ĥ")
	.replace(/Jx/g, "Ĵ")
	.replace(/Sx/g, "Ŝ")
	.replace(/Ux/g, "Ŭ")
	.replace(/cx/g, "ĉ")
	.replace(/gx/g, "ĝ")
	.replace(/hx/g, "ĥ")
	.replace(/jx/g, "ĵ")
	.replace(/sx/g, "ŝ")
	.replace(/ux/g, "ŭ");
}

function kontrolu(teksto) {
    // antaŭe mi uzis usklec-indiferentan komparilon, sed Opera ne
    // ŝatis ĝin.  anstataŭe mi listigas la literojn po unu fojo por
    // uskleco.
    var vortoRe = /[A-ZĈĜĤĴŜŬa-zĉĝĥĵŝŭ]+/g;
    var rezulto;

    var teksteroj = [], malfacilaj = [], neTreFacilaj = [], treFacilaj = 0;
    var ek = 0;

    while ((rezulto = vortoRe.exec(teksto)) !== null) {
	if (ek < rezulto.index) {
	    teksteroj.push({tekstero: teksto.slice(ek, rezulto.index), nivelo: 0});
	}
	var vorto = rezulto[0];
	ek = rezulto.index + vorto.length;

        var minuskla = vorto.toLowerCase();
        var nivelo = kontroliVorton(minuskla);
        if (nivelo == 0) {
            treFacilaj++;
        }
        else if (nivelo == 1) {
            neTreFacilaj.push(vorto);
        }
        else {
            malfacilaj.push(vorto);
        }
	teksteroj.push({tekstero: vorto, nivelo: nivelo});
    }
    if (teksto.length > ek) {
	teksteroj.push({tekstero: teksto.slice(ek), nivelo: 0});
    }
    console.log(teksteroj);
    return {
	alineoj: alineigu(teksteroj),
        vortoj: treFacilaj + neTreFacilaj.length + malfacilaj.length,
        treFacilaj: treFacilaj,
        facilaj: neTreFacilaj,
        malfacilaj: malfacilaj };
}

function alineigu(teksteroj) {
    if (teksteroj.length == 0) return [];

    var nunaAlineo = [], alineoj = [nunaAlineo];

    for (var i = 0; i < teksteroj.length; i++) {
	var tekstero = teksteroj[i];
	var linioj = tekstero.tekstero.split(/\n+/);
	if (linioj === null || linioj.length <= 1) {
	    nunaAlineo.push(tekstero);
	} else {
	    for (var j = 0; j < linioj.length; j++) {
		nunaAlineo.push({tekstero: linioj[j], nivelo: tekstero.nivelo});
		if (j < linioj.length - 1) {
		    nunaAlineo = [];
		    alineoj.push(nunaAlineo);
		}
	    }
	}
    }
    return alineoj;
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
    // Ĉu ĝi estas persona aŭ poseda pronomo?
    var pronomo;
    // atentu pri la ordo de sufiksoj!
    if (pronomo = senSufiksoj(vorto, ["a", "an", "aj", "ajn", "n", ""])) {
	if (personajPronomoj.indexOf(pronomo) != -1) {
	    return 0;
	}
    }

    // Ĉu ĝi estas verbo?  Aŭ ĉu ĝi estas substantivo finiĝanta je
    // "-anto", la sola participa finaĵo permesata en la nivelo "tre
    // facila"?
    var verbradiko;
    if (verbradiko = senSufiksoj(vorto, ["i", "as", "is", "os", "us", "u",
					 "anto", "anton", "antoj", "antojn"])) {
        var rezulto = ĉuEnestas(arbo, verbradiko, false);
        if (rezulto < 2) {
            return rezulto;
        }
    }

    // Ĉu ĝi estas substantivo?
    var substantivradiko;
    if (substantivradiko = senSufiksoj(vorto, ["o", "on", "oj", "ojn"])) {
        var rezulto = ĉuEnestas(arbo, substantivradiko, false);
        if (rezulto < 2) {
            return rezulto;
        }
    }

    // Ĉu ĝi estas adjektivo?
    var adjektivradiko;
    if (adjektivradiko = senSufiksoj(vorto, ["a", "an", "aj", "ajn"])) {
        var rezulto = ĉuEnestas(arbo, adjektivradiko, false);
        if (rezulto < 2) {
            return rezulto;
        }
    }

    // Ĉu ĝi estas adverbo?
    var adverbradiko;
    if (adverbradiko = senSufiksoj(vorto, ["e", "en"])) {
        var rezulto = ĉuEnestas(arbo, adverbradiko, false);
        if (rezulto < 2) {
            return rezulto;
        }
    }

    return ĉuEnestas(arbo, vorto, true);
}

function trovuVorterojn(arbero, vorto, komenco, minimumaNivelo) {
    var vorteroj = [];
    for (var i = komenco; i < vorto.length; i++) {
        if (arbero[vorto[i]]) {
            arbero = arbero[vorto[i]];
            if (arbero['ekzistas']) {
		vorteroj.push(
		    { fino: i,
		      tipo: arbero['ekzistas'].tipo,
		      nivelo: Math.max(arbero['ekzistas'].nivelo, minimumaNivelo)
		    });
            }
        }
        else
            break;
    }
    return vorteroj;
}

function ĉuEnestas(arbero, vorto, devasEstiVorteto) {
    var vorteroj = trovuVorterojn(arbero, vorto, 0, 0);
    while (vorteroj.length > 0) {
	console.log(vorto, vorteroj);
	var novajVorteroj = [];
	for (var i = 0; i < vorteroj.length; i++) {
	    if (vorteroj[i].fino == vorto.length - 1)
		if (vorteroj[i].tipo == 2 || !devasEstiVorteto)
		    return vorteroj[i].nivelo;
	    // XXX: nivelo je kombinoj
	    novajVorteroj = novajVorteroj.concat(
		trovuVorterojn(arbero, vorto, vorteroj[i].fino + 1, vorteroj[i].nivelo));
	    // skribtablo vs skribotablo: permesu unu el la vokaloj A,
	    // O, E kaj I inter radikoj.
	    if ("aoei".indexOf(vorto[vorteroj[i].fino + 1]) != -1)
		novajVorteroj = novajVorteroj.concat(
		    trovuVorterojn(arbero, vorto, vorteroj[i].fino + 2, vorteroj[i].nivelo));
	}
	vorteroj = novajVorteroj;
    }

    return 2;
}

var jamaTeksto, rezulto, redaktebla = true;
if (window.location.search && (rezulto = /t=([^&]+)/.exec(window.location.search))) {
    jamaTeksto = decodeURIComponent(rezulto[1].replace(/\+/g, " "));
    redaktebla = false;
}
else if (jamaTeksto = document.getElementById('tekstujo').value) {
}
else {
    jamaTeksto = "";
}
ko.applyBindings(new FaciliĝuModelo(jamaTeksto, redaktebla));
