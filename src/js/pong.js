/*!
 * Copyright (c) 2014 Jens Trio - jnstr.be
 */
var pong = (function () {
    myWindow = {
        height: Math.min(document.documentElement.clientHeight, window.innerHeight || 350),
        width: Math.min(document.documentElement.clientWidth, window.innerWidth || 160)
    }
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
            height: myWindow.height,
            width: myWindow.width,
            color: '#000'
        },
        player: {
            height: myWindow.height/7,
            width: myWindow.height/4*0.1,
            'color': '#fff'
        },
        ball: {
            size: myWindow.height/4*0.1,
            color: '#fff'
        },
        web: {
            width: myWindow.width/200,
            height: myWindow.height/50,
            spacing: myWindow.height/35,
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
        /**
         * Update the game
         * note: player is not called here because it uses the mouse event
         */
        update: function() {
            // update the ball
            game.ball.calculate();
            stage.elements.ball.moveTo(game.ball.x,game.ball.y);
            // update the cpu
            game.cpu.calculate();
            stage.elements.cpu.moveTo(game.cpu.x , game.cpu.y);

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
            /**
             * Add an event on mousemove
             */
            checkMouse: function() {
                document.onmousemove = game.player.move;
            },
            /**
             * Handle the mouse movement
             * @param e
             */
            move: function (e) {
                if (game.isPlaying){
                    // get y-pos of the cursor
                    var y;
                    if(!e) y = window.event.event.offsetY;
                    else y = e.pageY;

                    // make sure y starts on the canvas
                    y -= $("#game").offset().top;

                    // mouse position in the center
                    y-= (config.player.height/2);

                    // calculate y-position of the player bat
                    if (y < 0) y = 0;
                    else if (y > config.canvas.height - config.player.height) y = config.canvas.height - config.player.height;

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
            },
            ballTriggersMovement: function() {
                return (
                    (game.ball.y + config.ball.size < game.cpu.y + (config.player.height/3)) // ball is too high to touch
                    ||
                    (game.ball.y  > game.cpu.y - (config.player.height/3)) // ball is too low to touch
                );

            },
            calculateMovement: function() {
                var max = 1;
                var min = .8;
                var rand = Math.random() * (max - min) + min;
                tmpNmbr =  Math.abs(rand*game.ball.yMove);
                if (game.ball.yMove < 2 && game.ball.yMove > -2) {
                    tmpNmbr*=4;
                }

                movementDir = (game.cpu.y + (config.player.height/2) > game.ball.y + (config.ball.size/2)) ? -1 : 1;

                return tmpNmbr*movementDir;

            },
            calculate: function() {
                /**
                 * how much should we move?
                 */
                if (this.ballTriggersMovement()) {
                    game.cpu.y += this.calculateMovement();
                }
                if (game.cpu.y < 0) game.cpu.y = 0;
                else if (game.cpu.y > config.canvas.height - config.player.height) game.cpu.y = config.canvas.height - config.player.height;
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
            maxSpeed: 0,
            /**
             * (re-)nit the ball
             */
            init: function () {


                this.x = config.canvas.width / 2 - config.ball.size / 2;
                this.y = config.canvas.height / 2 - config.ball.size / 2;
                this.speed = config.ball.size/2;
                this.xDir = 1;
                this.maxSpeed = config.ball.size*3;
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
                        // now calculate y-movement
                        var center = game.cpu.y + (config.player.height / 2);
                        var ballPosition = game.ball.y + (config.ball.size / 2);
                        game.ball.yMove = (ballPosition-center)/(config.ball.size/4);
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
                        // now calculate y movement
                        var center = game.player.y + (config.player.height / 2);
                        var ballPosition = game.ball.y + (config.ball.size / 2);
                        game.ball.yMove = (ballPosition-center)/(config.ball.size/4);
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
        /**
         * the non-static elements on the canvas
         */
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
            stage.draw.web();
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
                }
                stage.canvas.addChild(stage.elements.cpu);
            },
            web: function() {
                var pos	= 1;var r;

                while (pos < config.canvas.height){
                    r = stage.canvas.display.rectangle({
                        x: (config.canvas.width / 2) - (config.web.width / 2),
                        y: pos,
                        width: config.web.width,
                        height: config.web.height,
                        fill: config.web.color
                    });
                    stage.canvas.addChild(r);
                    pos+= config.web.spacing + config.web.height
                }
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
         * set the game (players, ball...)
         * set the canvas
         */
        init: function () {
            game.init();
            stage.init();
            this.play();
        }
    };
})();