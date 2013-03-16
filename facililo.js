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

function trovuVorterojn(arbero, vorto, komenco) {
    var vorteroj = [];
    for (var i = komenco; i < vorto.length; i++) {
        if (arbero[vorto[i]]) {
            arbero = arbero[vorto[i]];
            if (arbero['ekzistas']) {
		vorteroj.push({ fino: i, tipo: arbero['ekzistas'], nivelo: 0 });
            }
        }
        else
            break;
    }
    return vorteroj;
}

function ĉuEnestas(arbero, vorto, devasEstiVorteto) {
    var vorteroj = trovuVorterojn(arbero, vorto, 0);
    while (vorteroj.length > 0) {
	console.log(vorto, vorteroj);
	var novajVorteroj = [];
	for (var i = 0; i < vorteroj.length; i++) {
	    if (vorteroj[i].fino == vorto.length - 1)
		if (vorteroj[i].tipo == 2 || !devasEstiVorteto)
		    return vorteroj[i].nivelo;
	    // XXX: nivelo je kombinoj
	    novajVorteroj = novajVorteroj.concat(trovuVorterojn(arbero, vorto, vorteroj[i].fino + 1));
	    // skribtablo vs skribotablo: permesu unu el la vokaloj A,
	    // O, E kaj I inter radikoj.
	    if ("aoei".indexOf(vorto[vorteroj[i].fino + 1]) != -1)
		novajVorteroj = novajVorteroj.concat(trovuVorterojn(arbero, vorto, vorteroj[i].fino + 2));
	}
	vorteroj = novajVorteroj;
    }

    if (vortaroFacilaj.indexOf(vorto) != -1) {
        return 1;
    } else {
        return 2;
    }
}

ko.applyBindings(new FaciliĝuModelo());
