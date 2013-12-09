window.onload = function() {

var userField = document.getElementById('usr');
var computerField = document.getElementById('comp');

function randomInt(min, max) {
  return Math.floor(Math.random() * (max-min+1) + min);
}

function replaceCharAt(str, index, character) {
    return str.substr(0, index) + character + str.substr(index+character.length);
}

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
      left: 209 // Left position relative to parent in px
};
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

    // Решаем, что делать по окончании игры
    this.over = function(again) {
        if (again) {
            location.reload();
        }
        else {
            computerField.removeEventListener('click', game.computer.field.shoot);
            userField.removeEventListener('compShoot', game.player.field.shoot);
        }
    };

    // Симуляция выстрела компьютера
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
        // Стреляем по ней
        target.dispatchEvent(compEvent);

        /*После того, как ход сделан убираем спиннер
        и добавляем обработчик клика пользователя*/
        spinner.stop();
        computerField.addEventListener('click', game.computer.field.shoot);
    };

}

function Player(type) {
    this.type = type.id;

    this.field = new Field(type);
    this.field.draw();

    this.isAlive = function() {
        return this.field.check();
    };
}



function Field(field) {
    var ships = new Ships().get();
    grid = new Grid(10, 10, ships).get();
    console.log(grid);

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

        // На время хода компьютера убираем обработчик клика пользователя
        computerField.removeEventListener('click', game.computer.field.shoot);

        switch (game.winner()) {
            case 'player':
                var winConf = confirm('Вы выйграли!\n\nХотите сыграть снова?');
                game.over(winConf);
                break;
            case 'computer':
                var looseConf = confirm('Вы проиграли!\n\nХотите сыграть снова?');
                game.over(looseConf);
                break;
            default:
                if (event.type == 'click') {
                    var target = document.getElementsByClassName('main')[0];
                    spinner.spin(target);
                    // Ход компьютера
                    window.setTimeout(compShoot, 1500);
                }
                break;
        }
    };
}

function Grid(numRows, numCols, ships) {
    var grid = new Array(numRows);
    for (var y=0; y < numRows; y++) {
        var row = [];
        for (var x=0; x < numCols; x++) {
            row[x] = 'o';
        }
        grid[y] = row;
    }


    this.get = function() {
        this.placeAll();
        return grid;
    };

    function canPlaceCell(y, x) {
        // Если координаты выходят за пределы сетки
        if (y < 0 || y > grid.length-1) {
            return false;
        } else {
            if (x < 0 || x > grid[y].length-1) {
                return false;
            }
        }
        // Если координаты не на краях сетки
        if (y > 0 && y < grid.length-1 && x > 0 && x < grid[y].length-1) {
            return (grid[y][x]!='f')&&(grid[y-1][x]!='f')&&(grid[y-1][x+1]!='f')&&(grid[y-1][x-1]!='f')&&(grid[y][x-1]!='f')&&
            (grid[y][x+1]!='f')&&(grid[y+1][x+1]!='f')&&(grid[y+1][x]!='f')&&(grid[y+1][x-1]!='f');
        }
        // Если на краях
        else {
            // верхняя граница
            if (y == 0) {
                return (grid[y][x]!='f')&&(grid[y+1][x]!='f')&&(grid[y+1][x+1]!='f')&&(grid[y+1][x-1]!='f')&&
                (grid[y][x-1]!='f')&&(grid[y][x+1]!='f');
            }
            // нижняя граница
            if (y == grid.length-1) {
                return (grid[y][x]!='f')&&(grid[y-1][x]!='f')&&(grid[y-1][x+1]!='f')&&(grid[y-1][x-1]!='f')&&
                (grid[y][x-1]!='f')&&(grid[y][x+1]!='f');
            }
            // левая граница
            if (x == 0) {
                return (grid[y][x]!='f')&&(grid[y][x+1]!='f')&&(grid[y+1][x+1]!='f')&&(grid[y-1][x+1]!='f')&&
                (grid[y-1][x]!='f')&&(grid[y+1][x]!='f');
            }
            // правая граница
            if (x == grid[y].length-1) {
                return (grid[y][x]!='f')&&(grid[y][x-1]!='f')&&(grid[y-1][x-1]!='f')&&(grid[y+1][x-1]!='f')&&
                (grid[y-1][x]!='f')&&(grid[y+1][x]!='f');
            }
        }
    }

    this.placeAll = function() {
        var places = [];
        _.each(ships, function(ship) {
            places = allPlaces(ship);
            var coord = _.sample(places);
            placeShip(coord[0], coord[1], ship);
        });
    };

    function canPlaceShip(y, x, ship) {
        var can = true;
        var yGrid, yShip;
        for (yGrid=y, yShip=0; yShip < ship.length; yGrid++, yShip++) {
            var xGrid, xShip;
            for (xGrid=x, xShip=0; xShip < ship[yShip].length; xGrid++, xShip++) {
                // Только если каждую клетку корабля можно расположить
                can = can && canPlaceCell(yGrid, xGrid, ship[yShip][xShip]);
            }
        }
        return can;
    }

    // Возвращает массив координат возможных положений корабля
    function allPlaces(ship) {
        return grid.reduce(function(acc, row, y) {
            var innerAcc = [];
            var coord = [];
            for (var x = 0; x < row.length; x++) {
                if (canPlaceShip(y, x, ship)) {
                    coord = [y,x];
                    innerAcc.push(coord);
                }
            }
            var res = acc.concat(innerAcc);
            return res;
        }, []);
    }

    function placeShip(yStart, xStart, ship) {
        var yGrid, yShip;
        for (yGrid=yStart, yShip=0; yShip < ship.length; yGrid++, yShip++) {
            var xGrid, xShip;
            for (xGrid=xStart, xShip=0; xShip < ship[yShip].length; xGrid++, xShip++) {
                grid[yGrid][xGrid] = ship[yShip][xShip];
            }
        }
    }
}

function Ships() {
    var SINGLE = [['f']];
    var TWOS = [['ff'], ['f','f']];
    var THREES = [['fff'], ['f','f','f'], ['ff','of'], ['of','ff'], ['ff','of'], ['fo','ff']];
    var FOURS = [['ffff'], ['f','f','f','f'], ['fff','foo'], ['fff','oof'], ['oof','fff'], ['foo','fff'], ['ff','ff'],
                 ['fo','fo','ff'], ['of','of','ff'], ['ff','of','of'], ['ffn','fo','fo']];

    function getSingles() {
        var res = [null,null,null,null];
        return res.map(function(el) { return SINGLE[0]; });
    }

    function getTwos() {
        var res = [null,null,null];
        var max = TWOS.length - 1;
        return res.map(function(el) {
            var randIndx = randomInt(0, max);
            return TWOS[randIndx];
        });
    }

    function getThrees() {
        var res = [null,null];
        var max = THREES.length - 1;
        return res.map(function(el) {
            var randIndx = randomInt(0, max);
            return THREES[randIndx];
        });
    }

    function getFours() {
        var max = FOURS.length - 1;
        var randIndx = randomInt(0, max);
        return [FOURS[randIndx]];
    }

    this.get = function() {
        var ships = getFours().concat(getThrees()).concat(getTwos()).concat(getSingles());
        return ships;
    };
}
};