window.addEventListener("load", create);

function create() {
    var canvas = document.querySelector("canvas");
    var ctx = canvas.getContext("2d");

    //базовый класс фигура
    function Shape(x, y, img) {
        this.x = x;
        this.y = y;
        this.img = img;
    }

    //базовый класс мяч
    function Ball(x, y, img, radius, rigth, bottom, ) {
        Shape.apply(this, arguments);
        this.toTop = true;
        this.radius = radius;
        this.velocity = {
            x: 2.1,
            y: -3.5

        }; // вектор скорости 
        this.right = rigth;
        this.bottom = bottom;
    }

    //наследуемся и определяем конструктор
    Ball.prototype = Object.create(Shape.prototype);
    Ball.prototype.construct = Ball;
    //подсоединяем метод для класса отрисовать
    Ball.prototype.draw = function (ctx) {

        //определяем новые координаты мяча
        // перемещаем мяч в новое место
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // столкновение с верхней границей 
        if (this.y - this.radius <= 0) {
            this.velocity.y *= -1;
        }
        // столкновение с правой границе
        if (this.x + this.radius >= this.right) {
            this.velocity.x *= -1;
        }
        // столкновение в левой границей
        if (this.x - this.radius <= 0) {
            this.velocity.x *= -1;
        }
        //сохраняем контекст canvas
        ctx.save();
        //отрисовка окружности
        ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        //возвращаемся к прежднему контексту
        ctx.restore();
    }

    //класс прямоугольник
    function Recangle(x, y, img, width, height, step, ) {
        Shape.apply(this, arguments);
        this.width = width;
        this.height = height;
        this.visible = true;
        this.step = step;
    }

    Recangle.prototype = Object.create(Shape.prototype);
    Recangle.prototype.construct = Recangle;
    //подсоединяем метод для класса отрисовать
    Recangle.prototype.draw = function (ctx, ball) {
        if (this.visible) {
            //отрисовка окружности
            ctx.save();
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
            //возвращаемся к прежднему контексту
            ctx.restore();
        }
    }

    //пользовательское событие колизии мяча с блоком
    var eventCollisionBlock;

    //функция обработки события колизии мяча с блоком
    let functionCollisionBlock = function (e) {
        if (e.detail.block.visible) {
            e.detail.block.visible = false;
            e.detail.ball.velocity.y *= -1.02;
            e.detail.ball.velocity.x *= 1.02;
            // e.detail.ball.toTop = false;
            e.detail.ball.toTop = !e.detail.ball.toTop;
        }
    };

    //пользовательское событие колизии мяча с ракеткой
    var eventCollisionRacket;

    //обработка события колизии мяча с ракеткой
    let functionCollisionRacket = function (e) {
        e.detail.ball.toTop = true;
        e.detail.ball.velocity.y *= -1;
    };


    //функция находит пересечения блока с мячом и генерирует событие, если пересечение есть
    function belongsBlock(lengthSide, ballSide1, blockSide1, ballSide2, blockSide2, ball, block) {
        for (let i = 0; i < lengthSide; i++) {
            let distanceX2 = ballSide1 - (blockSide1 + i);
            let distanceY2 = ballSide2 - blockSide2;
            let distance2 = Math.sqrt(distanceX2 * distanceX2 + distanceY2 * distanceY2);
            if (distance2 <= ball.radius && ball.toTop) {
                //создаём событие
                eventCollisionBlock = new CustomEvent("collisionBlock", {
                    detail: {
                        ball: ball,
                        block: block
                    }
                });
                document.body.dispatchEvent(eventCollisionBlock);
            }
        }
        return true;
    }

    //функция находит пересечения ракетки с мячом и генерирует событие, если пересечение есть
    function belongsRacket(racket, ball) {
        for (let i = 0; i < racket.width; i++) {
            let distanceX2 = ball.x - racket.x - i;
            let distanceY2 = ball.y - racket.y;
            let distance2 = Math.sqrt(distanceX2 * distanceX2 + distanceY2 * distanceY2);
            if (distance2 <= ball.radius && !ball.toTop) {
                //создаем событие
                eventCollisionRacket = new CustomEvent("collisionRacket", {
                    detail: {
                        ball: ball
                    }
                });
                document.body.dispatchEvent(eventCollisionRacket);
            }
        }
    }

    //функция определяем видим блоки или нет, объемная проверка по 4 сторонам блока
    //проверка осуществляется, если блок ещё видем
    Recangle.prototype.isVisible = function (ball) {
        if (this.visible && ball !== undefined) {
            belongsBlock(this.width, ball.x, this.x, ball.y, this.y + this.height, ball, this);
            if (this.visible) {
                belongsBlock(this.height, ball.y, this.y, ball.x, this.x, ball, this);
                if (this.visible) {
                    belongsBlock(this.height, ball.y, this.y, ball.x, this.x + this.width, ball, this);
                    if (this.visible) {
                        belongsBlock(this.width, ball.x, this.x, ball.y, this.y, ball, this);
                    }
                }
            }
        }
    }

    //пользовательское событие победы
    var eventWin;

    //обработка события колизии мяча с ракеткой
    var functionWin = function (e) {
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        let win = document.getElementById("win");
        ctx.drawImage(win, canvas.width - 1.75 * win.width, canvas.height / 2 - win.height / 2, 200, 200);
        ctx.font = "36px 'Indie Flower'";
        ctx.fillStyle = "red";
        var text = "Om Nom is full!";
        var marginLeft = canvas.width / 2.2;
        var marginTop = canvas.height / 1.75;
        ctx.fillText(text, marginLeft, marginTop);
        ctx.restore();
    };

    //пользовательское событие победы
    var eventFail;

    //обработка события колизии мяча с ракеткой
    var functionFail = function (e) {
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        var fail = document.getElementById('fail');
        ctx.drawImage(fail, canvas.width - 3.5 * fail.width, canvas.height / 2 - fail.height / 2);
        ctx.font = "36px 'Indie Flower'";
        ctx.fillStyle = "red";
        var text = "game over...";
        var marginLeft = canvas.width / 2.2;
        var marginTop = canvas.height / 1.75;
        ctx.fillText(text, marginLeft, marginTop);
        ctx.restore();
        document.body.onkeypress = null;
    };


    //создаём объект игра
    const game = {
        count: 0, //колличество отбитых блокоы
        width: 600,
        height: 700,

        startDraw: function (canvas) {
            ctx = canvas.getContext("2d");
            ctx.save();
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            //сохраняем контекст canvas
            //отрисовка окружности                             
            let omnom = document.getElementById("start");
            ctx.drawImage(omnom, canvas.width - 3.5 * fail.width, canvas.height / 2 - omnom.height / 4, 200, 200);
            ctx.font = "24px 'Indie Flower'";
            ctx.fillStyle = "red";
            var text = "feed me (click enter)";
            var marginLeft = canvas.width / 2;
            var marginTop = canvas.height / 1.75;
            ctx.fillText(text, marginLeft, marginTop);
            //возвращаемся к прежднему контексту
            ctx.restore();
        },

        init: function (canvas) {
            //ctx = canvas.getContext("2d");
            let imgBall = document.getElementById("ball");
            this.ball = new Ball(this.width / 2, this.height / 2, imgBall, 40, this.width, this.height);
            let imgRacket = document.getElementById("racket");
            this.racket = new Recangle(0, this.height * 0.9, imgRacket, 150, 30, 25);
            this.racket.fillColor = 'rgb(255,0,255)';
            // let imgBackground = null;
            let imgBackground = document.getElementById("wall");
            this.background = new Recangle(0, 0, imgBackground, this.width, this.height);
            this.blocks = [];
            let coloms = 5;
            let rows = 4;
            let heigthRec = 50;
            let widthRec = 120;

            //создаём вкусняшки
            let imgBlock = document.getElementById("block");
            for (var i = 0; i < rows; i++) {
                for (var j = 0; j < coloms; j++) {
                    let block = new Recangle(j * widthRec + 2, i * heigthRec + 2, imgBlock, widthRec - 4, heigthRec - 3);
                    this.blocks.push(block);
                }
            }
        },

        draw: function () {
            let ball = this.ball;
            let racket = this.racket;
            let width = this.width;
            let height = this.height;
            let fillColor = "black";
            let backgound = this.background;
            let blocks = this.blocks;

            function _draw() {
                document.body.addEventListener('fail', functionFail);
                document.body.addEventListener('win', functionWin);

                // сохраняем состояние контекста
                ctx.save();
                // очищаем экран
                ctx.clearRect(0, 0, width, height);

                // 0. отрисовать фон
                backgound.draw(ctx);

                // 1. отрисовать ракетку
                racket.draw(ctx);

                // 2. отрисовать мячик
                ball.draw(ctx);

                //подписываемся на событие коллизии мяча с ракеткой
                document.body.addEventListener("collisionRacket", functionCollisionRacket);

                //проверка на проигрыш
                if (ball.y + ball.radius > canvas.height + ball.radius * 2) {
                    eventFail = new Event('fail');
                    document.body.dispatchEvent(eventFail);
                    return;
                }

                //проверка на пересечение ракетки с мячом
                belongsRacket(racket, ball);

                // 3. отрисовываем блоки
                //считаем колличество видимых блоков
                let coutVisible = 0;

                //перебираем блоки
                for (let block of blocks) {
                    //подписываемся на событие колизии блока с мячом
                    document.body.addEventListener("collisionBlock", functionCollisionBlock);

                    //определяем видимость
                    block.isVisible(ball, ctx);
                    if (block.visible) {
                        block.draw(ctx, ball);
                        coutVisible++;
                    }
                }

                if (coutVisible == 0) {
                    eventWin = new Event('win');
                    document.body.dispatchEvent(eventWin);
                    return;
                }

                // восстановление состояния
                ctx.restore();
                // анимация
                requestAnimationFrame(_draw);
            }
            requestAnimationFrame(_draw);
        }
    }

    let KeyBoardClick = function (e) {
        if (e.keyCode == 37) {
            if (game.racket.x > game.racket.step) {
                game.racket.x -= game.racket.step;
            } else {
                game.racket.x = 0;
            }
        }
        if (e.keyCode == 39) {
            if (game.racket.x + game.racket.width < canvas.width) {
                game.racket.x += game.racket.step;
            } else {
                game.racket.x = canvas.width - game.racket.width;
            }
        }
        if (e.keyCode == 13) {
            game.draw();
        }
    };
    document.body.addEventListener("keydown", KeyBoardClick);

    game.init(canvas);
    game.startDraw(canvas);
};
