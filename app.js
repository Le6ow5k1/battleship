window.onload = function() {

    var userField = document.getElementById('usr');
    var computerField = document.getElementById('comp');

    // Эмитируем событие выстрела компьютером
    var compEvent = new CustomEvent('compShoot', {
        'view': window,
        'bubbles': true,
        'cancelable': true
    });

    var opts = {
          lines: 13, // The number of lines to draw
          length: 14, // The length of each line
          width: 7, // The line thickness
          radius: 20, // The radius of the inner circle
          corners: 1, // Corner roundness (0..1)
          rotate: 0, // The rotation offset
          direction: 1, // 1: clockwise, -1: counterclockwise
          color: '#000', // #rgb or #rrggbb or array of colors
          speed: 1, // Rounds per second
          trail: 60, // Afterglow percentage
          shadow: false, // Whether to render a shadow
          hwaccel: false, // Whether to use hardware acceleration
          className: 'spinner', // The CSS class to assign to the spinner
          zIndex: 2e9, // The z-index (defaults to 2000000000)
          top: 89, // Top position relative to parent in px
          left: 241 // Left position relative to parent in px
    };
    var target = document.getElementById('foo');
    var spinner = new Spinner(opts);

    var game = new Game();
    game.init();

function Game() {

    this.player = new Player(userField);
    this.computer = new Player(computerField);

    this.init = function() {
        computerField.addEventListener('click', game.computer.field.shoot);
        userField.addEventListener('compShoot', game.player.field.shoot);
    };

    this.winner = function() {
        if (this.player.isAlive()) {
            if (!this.computer.isAlive()) {
                return 'player';
            }
            else {
                return false;
            }
        }
        else {
            if (this.computer.isAlive()) {
                return 'computer';
            }
            else {
                return false;
            }
        }
    };

}

function Player(type) {
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

    this.type = type.id;

    this.field = new Field(type, testGrid);
    this.field.draw();

    this.isAlive = function() {
        return this.field.check();
    };
}

compShoot = function() {
    var htmlCollection = game.player.field.getHtml.children;
    var arr = Array.prototype.slice.call(htmlCollection);

    // собираем индексы еще не простреленных клеток
    var remaining = arr.reduce(function(acc, el, index) {
        if ((el.className.indexOf('p')==-1) && (el.className.indexOf('x')==-1)) {
            acc.push(index);
            return acc;
        }
        else {
            return acc;
        }
    }, []);

    // Выбираем случайную клетку из оставшихся
    var targetIndex = _.sample(remaining);
    var target = arr[targetIndex];

    target.dispatchEvent(compEvent);

    spinner.stop();
    computerField.addEventListener('click', game.computer.field.shoot);
};


function Field(field, grid) {
    /*Создает игровое поле, которое представляет собой сетку из клеток
    клетка-это div элемент, с соответствующим именем класса вида <y_x i>
    где y - у-координата клетки, х - х-координата, а i - тип клетки
      'f' - неповрежденная часть корабля
      'x' - поврежденная часть корабля
      'o' - свободная не простреленная клетка
      'p' - свободная простреленная клетка*/
    this.draw = function() {
        for (var y=0; y < grid.length; y++) {
            for (var x=0; x < grid[y].length; x++) {
                var div = document.createElement('div');
                div.className = y.toString()+'_'+x.toString()+' '+grid[y][x];
                field.appendChild(div);
            }
        }
    };

    this.getHtml = field;

    // Проверяет остались ли еще корабли
    this.check = function() {
        var htmlCollection = field.children;
        var arr = Array.prototype.slice.call(htmlCollection);
        return arr.some(function(el) {
            return (el.className.indexOf(' f') !== -1);
        });
    };

    /*Обработчик события по клику на определенную клетку
      Изменяет тип клетки*/
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
                break;
        }

        computerField.removeEventListener('click', game.computer.field.shoot);

        switch (game.winner()) {
            case 'player':
                var retVal = confirm('Вы выйграли!\n\nХотите сыграть снова?');
                if (retVal) {
                    location.reload();
                }
                else {
                    computerField.removeEventListener('click', game.computer.field.shoot);
                    userField.removeEventListener('compShoot', game.player.field.shoot);
                }
                break;
            case 'computer':
                var retVal = confirm('Вы проиграли!\n\nХотите сыграть снова?');
                if (retVal) {
                    location.reload();
                }
                else {
                    computerField.removeEventListener('click', game.computer.field.shoot);
                    userField.removeEventListener('compShoot', game.player.field.shoot);
                }
                break;
            default:
                if (event.type == 'click') {
                    var target = document.getElementsByClassName('main')[0];
                    spinner.spin(target);
                    window.setTimeout(compShoot, 1500);
                }
                break;
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

    this.get = function() {
        return grid;
    };

    this.placeShip = function(yStart, xStart, ship) {
        var yGrid, yShip;
        for (yGrid=yStart, yShip=0; yShip < ship.length; yGrid++, yShip++) {
            var xGrid, xShip;
            for (xGrid=xStart, xShip=0; xShip < ship[yShip].length; xGrid++, xShip++) {
                grid[yGrid][xGrid] = ship[yShip][xShip];
            }
        }
    };
}


// Все возможные корабли
// Здесь f-часть корабля, n-место вокруг корабля, о-пустое место
var SINGLE = [['nnn','nfn','nnn']];
var TWOS = [['nnnn','nffn','nnnn'], ['nnn','nfn','nfn','nnn']];
var THREES = [['nnnnn','nfffn','nnnnn'], ['nnn','nfn','nfn','nfn','nnn'], ['nnnn','nffn','nfnn','nnnn'],
             ['nnnn','nnfn','nffn','nnnn'], ['nnnn','nffn','nnfn','nnnn'], ['nnnn','nfnn','nffn','nnnn']];
var FOURS = [['nnnnnn','nffffn','nnnnnn'], ['nnn','nfn','nfn','nfn','nfn','nnn'], ['nnnnn','nfffn','nfnnn'],
             ['nnnnn','nfffn','nnnfn'], ['nnnnn','nnnfn','nfffn'],['nnnnn','nfnnn','nfffn'], ['nnnn','nffn','nffn','nnnn'],
             ['nnno','nfno','nfnn','nffn','nnnn'], ['onnn','onfn','nnfn','nffn','nnnn'], ['nnnn','nffn','nnfn','onfn','onnn'],
             ['nnnn','nffn','nfnn','nfno','nnno']];

var singles = getSingles();
console.log(singles);
var twos = getTwos();
console.log(twos);
var threes = getThrees();
console.log(threes);
var fours = getFours();
console.log(fours);
console.log();

function getSingles() {
    var res = [null,null,null,null];
    return res.map(function(el) { return SINGLE[0]; });
}

function getTwos() {
    var res = [null,null,null];
    var max = TWOS.length - 1;
    return res.map(function(el) {
        var randIndx = randomInt(0, max);
        return res.map(function() { return TWOS[randIndx]; });
    });
}

function getThrees() {
    var res = [null,null];
    var max = THREES.length - 1;
    return res.map(function(el) {
        var randIndx = randomInt(0, max);
        return res.map(function() { return THREES[randIndx]; });
    });
}

function getFours() {
    var max = FOURS.length - 1;
    var randIndx = randomInt(0, max);
    return [FOURS[randIndx]];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max-min+1) + min);
}

function replaceCharAt(str, index, character) {
    return str.substr(0, index) + character + str.substr(index+character.length);
}

/*Находит место для расположения корабля и возвращает x,y координаты начальной точки
для "вставки" данного корабля. Можно указать y координату с которой начинать проверку - start_i.*/
function findPlaceForShip(grid, elem, start_i) {
    var start_j = null;
    var start = 0;
    if (start_i) { start = start_i; }

    rep:
    for (var i=start; i < grid.length-elem.length+1; i++) {
        for (var j=0; j < elem.length; j++) {
            start_j = findPlaceInRow(grid[i+j],elem[j], start_j);
            if (start_j===false) {
                continue rep;
            }
        }
        return [i, start_j];
    }
    return false;
}

/*Определяет есть ли в строке сетки место для расположения "строчки" данного корабля,
если есть, то функция возвращяет индекс с которого начинается свободное место, иначе false.
Можно указать индекс с которого начинать проверку - start_j.*/
function findPlaceInRow(rowGrid, rowElem, start_j) {
    var start = 0;
    if (start_j) { start = start_j; }

    rep:
    for (var i=start; i < rowGrid.length-rowElem.length+1; i++) {
        for (var j=0; j < rowElem.length; j++) {
            if (rowGrid[i+j] == 'f') {
                continue rep;
            }
        }
        return i;
    }
    return false;
}

};