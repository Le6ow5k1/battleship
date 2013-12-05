
window.onload = function() {

// var _ = require('lodash');

var human = document.getElementById('usr');
var machine = document.getElementById('comp');

function Game(numRows, numCols, user, comp) {
    var grid = new Grid(numRows, numCols);
    var testGrid = ['nnnnnnoonf',
                    'nffnfnoonn',
                    'nnnnfnnnnn',
                    'nnnnnnfffn',
                    'nfffnnfnnn',
                    'nnnnnnnnnn',
                    'nnnfffnffn',
                    'nfnnnnnnnn',
                    'nnnonnnfno',
                    'oooonfnnno'];

    this.userField = new Field(user);
    this.userField.draw(testGrid);
    this.compField = new Field(comp);
    this.compField.draw(testGrid);
}

Game.prototype.isOver = function() {
    return !(this.userField.check() || this.compField.check());
};

var game = new Game(10, 10, human, machine);
machine.addEventListener('click', game.compField.shoot);

_.times(5, function() {
    console.log(game);
    game.userField.compShoot();
});

// while (!game.isOver()) {
// }

function Field(field) {
    // Создает игровое поле, которое представляет собой сетку из клеток
    // клетка-это div элемент, с соответствующим именем класса вида <y_x i>
    // где y - у-координата клетки, х - х-координата, а i - тип клетки
    //   'f' - неповрежденная часть корабля
    //   'x' - поврежденная часть корабля
    //   'o' - свободная не простреленная клетка
    //   'p' - свободная простреленная клетка
    this.draw = function(grid) {
        for (var y=0; y < grid.length; y++) {
            for (var x=0; x < grid[y].length; x++) {
                var div = document.createElement('div');
                div.className = y.toString()+'_'+x.toString()+' '+grid[y][x];
                field.appendChild(div);
            }
        }
    };

    this.compShoot = function() {
        var htmlCollection = field.children;
        var arr = Array.prototype.slice.call(htmlCollection);
        // собираем индексы еще не простреленных клеток
        var remaining = arr.reduce(function(acc, el, index) {
            if ((el.className.indexOf(' p')==-1) || (el.className.indexOf(' x')==-1)) {
                acc.push(index);
                return acc;
            }
            else {
                return acc;
            }
        }, []);

        var targetIndex = _.sample(remaining);
        var cell = arr[targetIndex];
        switch (cell.className[4]) {
            case 'f':
                cell.className = replaceCharAt(cell.className, 4, 'x');
                break;
            case 'o':
                cell.className = replaceCharAt(cell.className, 4, 'p');
                break;
            case 'n':
                cell.className = replaceCharAt(cell.className, 4, 'p');
                break;
            default:
                return 0;
        }
    };

    // Проверяет остались ли еще корабли
    this.check = function() {
        var htmlCollection = field.children;
        var arr = Array.prototype.slice.call(htmlCollection);
        return arr.some(function(el) {
            return (el.className.indexOf(' f') !== -1);
        });
    };

    // Обработчик события по клику на определенную клетку
    // Изменяет тип клетки
    this.shoot = function(event) {
        var cell = event.target;
        switch (cell.className[4]) {
            case 'f':
                cell.className = replaceCharAt(cell.className, 4, 'x');
                break;
            case 'o':
                cell.className = replaceCharAt(cell.className, 4, 'p');
                break;
            case 'n':
                cell.className = replaceCharAt(cell.className, 4, 'p');
                break;
            default:
                return 0;
        }
    };
}

function Grid(numRows, numCols) {
    var grid = new Array(numRows);
    for (var y=0; y < numRows; y++) {
        var row = [];
        for (var x=0; x < numCols; x++) {
            row[x] = 'o';
        }
        grid[y] = row;
    }

    return grid;
}

// Все возможные корабли
function Elements() {
    // Здесь f-часть корабля, n-место вокруг корабля, о-пустое место
    this.single = [['nnn','nfn','nnn']];
    this.twos = [['nnnn','nffn','nnnn'], ['nnn','nfn','nfn','nnn']];
    this.threes = [['nnnnn','nfffn','nnnnn'], ['nnn','nfn','nfn','nfn','nnn'], ['nnnn','nffn','nfnn','nnnn'],
                 ['nnnn','nnfn','nffn','nnnn'], ['nnnn','nffn','nnfn','nnnn'], ['nnnn','nfnn','nffn','nnnn']];
    this.fours = [['nnnnnn','nffffn','nnnnnn'], ['nnn','nfn','nfn','nfn','nfn','nnn'], ['nnnnn','nfffn','nfnnn'],
                 ['nnnnn','nfffn','nnnfn'], ['nnnnn','nnnfn','nfffn'],['nnnnn','nfnnn','nfffn'], ['nnnn','nffn','nffn','nnnn'],
                 ['nnno','nfno','nfnn','nffn','nnnn'], ['onnn','onfn','nnfn','nffn','nnnn'], ['nnnn','nffn','nnfn','onfn','onnn'],
                 ['nnnn','nffn','nfnn','nfno','nnno']];


}

Elements.prototype.getSingles = function() {
    var res = [null,null,null,null];
    return res.forEach(function(el) { return this.single[0]; });
};

Elements.prototype.getTwos = function() {
    var res = [null,null,null];
    var max = this.twos.length - 1;
    return res.forEach(function(el) {
        var randIndx = randomInt(0, max);
        return res.forEach(function() { return this.twos[randIndx]; });
    });
};

Elements.prototype.getThrees = function() {
    var res = [null,null];
    var max = this.threes.length - 1;
    return res.forEach(function(el) {
        var randIndx = randomInt(0, max);
        return res.forEach(function() { return this.twos[randIndx]; });
    });
};
Elements.prototype.getFours = function() {
    var max = this.fours.length - 1;
    var randIndx = randomInt(0, max);
    return [this.fours[randIndx]];
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max-min+1) + min);
}

function replaceCharAt(str, index, character) {
    return str.substr(0, index) + character + str.substr(index+character.length);
}

// Находит место для расположения корабля и возвращает x,y координаты начальной точки
// для "вставки" данного корабля
function findPlaceForShip(grid, elem) {
    var start_indx = null;

    rep:
    for (var i=0; i < grid.length-elem.length+1; i++) {
        for (var j=0; j < elem.length; j++) {
            start_indx = findPlaceInRow(grid[i+j],elem[j], start_indx);
            if (start_indx===false) {
                continue rep;
            }
        }
        return [i, start_indx];
    }
    return false;
}

// Определяет есть ли в строке сетки место для расположения "строчки" данного корабля,
// если есть, то функция возвращяет индекс с которого начинается свободное место, иначе false.
// Можно указать индекс с которого начинать проверку - start_indx.
function findPlaceInRow(rowGrid, rowElem, start_indx) {
    var start = 0;
    if (start_indx) { start = start_indx; }

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
};
