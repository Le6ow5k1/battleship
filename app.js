var _ = require('lodash');


var userField = document.getElementById('usr');
var compField = document.getElementById('comp');

//
function Game(argument) {
    this.userGrid = createGrid(userField);
    this.compGrid = createGrid(compField);
    this.isOver = false;

}

var game = new Game();

Game.prototype.getUserGrid = function() {
    return userGrid;
};

// Создает сетку из клеток, клетка представляет собой div элемент.
// Возвращяет двумерный массив, в котором каждый элемент это клетка.
function Grid(field, numRows, numCols) {
    var grid = new Array(numRows);
    for (var y=0; y < numRows; y++) {
        var row = [];
        var cell = null;
        for (var x=0; x < numCols; x++) {
            cell = document.createElement('div');
            //
            cell.className = y.toString()+'_'+x.toString()+' o';
            row[x] = cell;
            field.appendChild(cell);
        }
        grid[y] = row;
    }

    this.get = grid;
}

createGrid(userField);
createGrid(compField);

function Element() {
    this.single = [['nnn','nfn','nnn']];
    this.twos = [['nnnn','nffn','nnnn'], ['nnn','nfn','nfn','nnn']];
    this.threes = [['nnnnn','nfffn','nnnnn'], ['nnn','nfn','nfn','nfn','nnn'], ['nnnn','nffn','nfnn','nnnn'],
                 ['nnnn','nnfn','nffn','nnnn'], ['nnnn','nffn','nnfn','nnnn'], ['nnnn','nfnn','nffn','nnnn']];
    this.fours = [['nnnnnn','nffffn','nnnnnn'], ['nnn','nfn','nfn','nfn','nfn','nnn'], ['nnnnn','nfffn','nfnnn'],
                 ['nnnnn','nfffn','nnnfn'],['nnnnn','nnnfn','nfffn'],['nnnnn','nfnnn','nfffn'],['nnnn','nffn','nffn','nnnn'],
                 ['nnno','nfno','nfnn','nffn','nnnn'],['onnn','onfn','nnfn','nffn','nnnn'],['nnnn','nffn','nnfn','onfn','onnn'],
                 ['nnnn','nffn','nfnn','nfno','nnno']];


}

Element.prototype.getSingles = function() {
    var res = [null,null,null,null];
    return res.map(function(el) { return this.single[0]; });
};

Element.prototype.getTwos = function() {
    var res = [null,null,null];
    var max = this.twos.length - 1;
    return res.map(function(el) {
        var randInd = getRandomInt(0, max);
        return res.map(function() { return this.twos[randInd]; });
    });
};

Element.prototype.getThrees = function() {
    var res = [null,null];
    var max = this.threes.length - 1;
    return res.map(function(el) {
        var randInd = getRandomInt(0, max);
        return res.map(function() { return this.twos[randInd]; });
    });
};
Element.prototype.getFours = function() {
    var max = this.fours.length - 1;
    var randInd = getRandomInt(0, max);
    return [this.fours[randInd]];
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max-min+1) + min);
}

// Находит место для расположения элемента и возвращает x,y координаты начальной точки
// для "вставки" данного элемента
function findPlaceForElem(grid, elem) {
    var start_ind = null;

    rep:
    for (var i=0; i < grid.length-elem.length+1; i++) {
        for (var j=0; j < elem.length; j++) {
            start_ind = findPlaceInRow(grid[i+j],elem[j], start_ind);
            if (start_ind===false) {
                continue rep;
            }
        }
        return [i, start_ind];
    }
    return false;
}

// Определяет есть ли в строке сетки место для расположения "строчки" данного элемента,
// если есть, то функция возвращяет индекс с которого начинается свободное место, иначе false.
// Можно указать индекс с которого начинать проверку - start_ind.
function findPlaceInRow(rowGrid, rowElem, start_ind) {
    var start = 0;
    if (start_ind) { start = start_ind; }

    rep:
    for (var i=start; i < rowGrid.length-rowElem.length+1; i++) {
        for (var j=0; j < rowElem.length; j++) {
            if (rowGrid[i+j] !== 0) {
                continue rep;
            }
        }
        return i;
    }
    return false;
}

var two_s = [ ["nnnn", "nffn", "nnnn"], ["nnn", "nfn", "nfn", "nnn"] ];

