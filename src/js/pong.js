/*!
 * Copyright (c) 2014 Jens Trio - jnstr.be
 */
var pong = (function () {
    /**
     * The interval for the game
     */
    interval = false;
    /**
     * General configuration settings
     * @type Object
     */
    config = {
        canvas: {
            height: 350,
            width: 500,
            color: '#000'
        },
        player: {
            height: 60,
            width: 17,
            'color': '#fff'
        },
        ball: {
            size: 12,
            color: '#fff'
        }
    };
    /**
     * The game object
     * @type Object
     */
    game = {
        isPlaying: false,
        /**
         * Init the game
         */
        init: function () {
            this.player.init();
            this.cpu.init();
            this.ball.init();
        },
        update: function() {
            // update the ball
            game.ball.calculate();
            stage.elements.ball.moveTo(game.ball.x,game.ball.y);
            // update the player
            game.player.checkMouse();
//            stage.elements.player.moveTo(game.player.x,game.player.y);

            stage.canvas.redraw();
        },
        /**
         * The player (player)
         */
        player: {
            x: 0,
            y: 0,
            score: 0,
            missed: false,
            /**
             * (re-)init the player
             */
            init: function () {
                this.score = 0;
                this.x = 4;
                this.y = (config.canvas.height / 2) - (config.player.height / 2);
                this.missed = false;
            },
            checkMouse: function() {
                document.onmousemove = game.player.move;
            },
            move: function (e) {
                if (game.isPlaying){
                    var y;
                    if(!e) {
                        e = window.event;
                        y = e.event.offsetY;
                    }
                    else {
                        y = e.pageY;
                    }

                    // set y-value so that it fit's the position of the canvas
                    var offset = $("#game").offset();
                    var top = offset.top;
                    y -= top;

                    // check if mouse position is inside canvas
                    if (y < 0){y = 0;}
                    else if (y > config.canvas.height - config.player.height){y = config.canvas.height - config.player.height;}

                    // set y-values for both players
                    game.player.y = y;

                    // move the players
                    stage.elements.player.moveTo(game.player.x,game.player.y);
                    stage.canvas.redraw();
                }
            }
        },
        /**
         * the cpu (computer)
         */
        cpu: {
            x: 0,
            y: 0,
            score: 0,
            missed: false,
            /**
             * (re-)init the cpu
             */
            init: function () {
                this.x = config.canvas.width - 4 - config.player.width,
                this.y = (config.canvas.height / 2) - (config.player.height / 2),
                this.score = 0,
                this.missed = false
            }
        },
        /**
         * The ball
         */
        ball: {
            x: 0,
            y: 0,
            speed: 0,
            xDir: 1,
            yMove: 0,
            radius: config.ball.size,
            maxSpeed: 20,
            /**
             * (re-)nit the ball
             */
            init: function () {
                this.x = config.canvas.width / 2 - config.ball.size / 2;
                this.y = config.canvas.height / 2 - config.ball.size / 2;
                this.speed = 5;
                this.xDir = 1;
                /**
                 * number between 3 & -3
                 * the angle the ball moves in for the start
                 * @type {number}
                 */
                this.yMove = ((Math.random() * 2) - 1) * 3;
            },
            /**
             * Increment the speed of the ball
             */
            incrementSpeed: function () {
                if (this.speed < this.maxSpeed) this.speed++;
            },
            /**
             * Calculate the new position of the ball
             */
            calculate: function() {
                switch (true) {
                    case (game.ball.touchesPlayer()):
                        game.ball.xDir = 1;
                        game.ball.incrementSpeed();
                        break;
                    case (game.ball.touchesCpu()):
                        game.ball.xDir = -1;
                        game.ball.incrementSpeed();
                        break;
                    case (game.ball.x <= 0):
                        alert('cpu won the game');
                        window.clearInterval(pong.interval);
                        break;
                    case (game.ball.x >= (config.canvas.width - config.ball.size)):
                        alert('user won the game');
                        window.clearInterval(pong.interval);
                        break;
                }

                if (game.ball.touchesSides()) game.ball.yMove*= -1;

                game.ball.y+= game.ball.yMove;
                game.ball.x = game.ball.x + (game.ball.xDir * game.ball.speed);
            },
            /**
             * Check if the ball touches the top or the bottom of the field
             */
            touchesSides: function() {
                return (game.ball.y <= 0 || game.ball.y + config.ball.size >= config.canvas.height);
            },
            /**
             * Check if the ball touches the cpu
             */
            touchesCpu: function() {
                touches = false;
                // x-values touch
                if (game.ball.x + config.player.width >= game.cpu.x) {
                    // y-values match up
                    if (game.ball.y + config.ball.size > game.cpu.y && game.ball.y < game.cpu.y + config.player.height) {
                        touches = true;
                    }
                }
                return touches;
            },
            /**
             * check if the ball touches the player
             */
            touchesPlayer: function() {
                touches = false;
                // x-values touch
                if (game.ball.x <= game.player.x + config.player.width) {
                    // y-values match up
                    if (game.ball.y + config.ball.size > game.player.y && game.ball.y < game.player.y + config.player.height) {
                        touches = true;
                    }
                }
                return touches;
            }
        }
    };
    /**
     * The canvas for the game
     * @type Object
     */
    stage = {
        canvas : false,
        elements: {
            ball: false,
            player: false,
            cpu: false
        },
        init: function () {
            if (stage.canvas) {
                stage.canvas.reset();
            }
            stage.canvas = oCanvas.create({
                canvas: '#game',
                background: config.canvas.color
            });
            stage.canvas.width= config.canvas.width;
            stage.canvas.height= config.canvas.height;
            stage.draw.ball();
            stage.draw.player();
            stage.draw.cpu();
        },
        draw: {
            ball: function() {
                if (!stage.elements.ball) {
                    stage.elements.ball = stage.canvas.display.rectangle({
                        x: config.ball.x,
                        y: config.ball.y,
                        width: game.ball.radius,
                        height: game.ball.radius,
                        fill: config.ball.color
                    });
                }
                stage.canvas.addChild(stage.elements.ball);
            },
            player: function() {
                if (!stage.elements.player) {
                    stage.elements.player = stage.canvas.display.rectangle({
                        x: game.player.x,
                        y: game.player.y,
                        width: config.player.width,
                        height: config.player.height,
                        fill: config.player.color
                    });
                    console.log(stage.elements.player);
                }
                stage.canvas.addChild(stage.elements.player);
            },
            cpu: function() {
                if (!stage.elements.cpu) {
                    stage.elements.cpu = stage.canvas.display.rectangle({
                        x: game.cpu.x,
                        y: game.cpu.y,
                        width: config.player.width,
                        height: config.player.height,
                        fill: config.player.color
                    });
                    console.log(stage.elements.cpu);
                }
                stage.canvas.addChild(stage.elements.cpu);
            }

        }
    };
    /**
     * Public functions
     */
    return {
        /**
         * Play the pong game
         */
        play: function () {
            game.isPlaying = true;
            game.player.checkMouse();
            // repeat every 25 milliseconds = 25 frames/sec
            pong.interval = setInterval(function() {
                game.update();
            }, 25);

        },
        /**
         * Init the pong game
         * set the canvas
         * set the game (players, ball...)
         */
        init: function () {
            game.init();
            stage.init();
        }
    };
})();