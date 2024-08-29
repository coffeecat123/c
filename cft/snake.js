const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
var chclr = $("#chclr");
var cvs = $("#cvs");
var ctx = cvs.getContext("2d");
var ti = cvs.width / cvs.offsetWidt;
var default_clr = "#ff0000", snakes, cnt, foods;
var rr, is_active;
let lastTime, frameCount, fps, showFps;
var map = {
    width: 0,
    height: 0
};
var keys = {
    w: 0,
    a: 0,
    s: 0,
    d: 0,
    shift: 0
};
const margin = 50;

chclr.oninput = () => {
    if (snakes[0].clr) {
        snakes[0].clr = chclr.value;
        for (let i in keys) {
            keys[i] = 0;
        }
    }
};

let camera = {
    x: 0,
    y: 0,
    width: cvs.width,
    height: cvs.height
};

window.onfocus = () => {
    is_active = 1;
};
window.onblur = () => {
    is_active = 0;
};
document.onfocusin = () => {
    is_active = 1;
};
document.onfocusout = () => {
    is_active = 0;
};
class Snake {
    constructor(x, y, dx, dy, clr, type) {
        //body[0] is head
        this.body = [{ x, y }];
        this.dx = dx;
        this.dy = dy;
        this.clr = clr;
        this.waitTime = random(5000, 10000);
        this.lastTime = Date.now();
        this.score = 0;
        this.type = type;
        this.err = [];//food error status
        this.err[1]={
            lastTime:0,
            waitTime:0
        }
        //type:0 player
        //type:1-9 computer smart to stupid
    }
    move() {
        let [x, y] = [this.body[0].x, this.body[0].y];
        let b = this.body;
        if (this.type > 0 && (Date.now() - this.lastTime > this.waitTime)) {
            this.set_v(x, y);
        }
        let dx = this.dx / fps, dy = this.dy / fps;
        if (Date.now() - this.err[1].lastTime < this.err[1].waitTime) {
            dx *= -1;
            dy *= -1;
        }
        x += dx;
        y += dy;
        if ((cmp(1, this.type, 5)) && (x > map.width - rr || x < rr || y > map.height - rr || y < rr)) {
            this.set_v(x, y);
        }
        x = Math.max(rr, Math.min(x, map.width - rr));
        y = Math.max(rr, Math.min(y, map.height - rr));

        for (let i = 0; i < foods.length; i++) {
            let f = foods[i];
            if (f.type == 0) {
                if (Math.hypot(x - f.x, y - f.y) < rr / 1.8) {
                    [x, y] = [f.dt.to.x, f.dt.to.y];
                    f.x = random(rr, map.width - rr);
                    f.y = random(rr, map.height - rr);
                    this.score++;
                    break;
                }
            }
            if (f.type == 1) {
                if (Math.hypot(x - f.x, y - f.y) < rr + f.dt.r) {
                    this.err[1].lastTime = Date.now();
                    this.err[1].waitTime = random(1000, 3000);
                    break;
                }
            }
        }
        if (x != b[0].x || y != b[0].y) {
            b.unshift({ x, y });
        }
        else if (b.length > 1) {
            b.pop();
        }
        if (b.length > fps * 2 && b.length > 1) {
            b.pop();
        }
    }
    set_v(x, y) {
        this.lastTime = Date.now();
        this.waitTime = random(this.type * 500, this.type * 1000);
        let closestFood = null;
        let minDistance = Infinity;
        for (let i = 0; i < foods.length; i++) {
            let f = foods[i];
            if(f.type!=0)continue;
            let dx = f.x - x;
            let dy = f.y - y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < minDistance) {
                minDistance = distance;
                closestFood = f;
            }
        }
        const p = Math.random();
        if (closestFood && p < 0.7) {
            let dx = closestFood.x - x;
            let dy = closestFood.y - y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 0) {
                dx /= distance;
                dy /= distance;
            }
            const speed = random(200, 500);
            this.dx = dx * speed;
            this.dy = dy * speed;
        }
        else {
            this.dx = random(-200, 200);
            this.dy = random(-200, 200);
        }
    }
}
class Food {
    constructor(x, y, type, dt) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.dt = dt;//detail
        /*type:
        0:tp
        1:reverse
        */
    }
    do() {
        let [x, y] = [this.x, this.y];
        if (this.type == 0) {
            return;
        }
        if (this.type == 1) {
            if (fps > 0) {
                x += this.dt.v.dx / fps;
                y += this.dt.v.dy / fps;
            }
            if (x > map.width - this.dt.r || x < this.dt.r) {
                this.dt.v.dx *= -1;
            }
            if (y > map.height - this.dt.r || y < this.dt.r) {
                this.dt.v.dy *= -1;
            }
            x = Math.max(this.dt.r, Math.min(x, map.width - this.dt.r));
            y = Math.max(this.dt.r, Math.min(y, map.height - this.dt.r));
            this.x = x;
            this.y = y;
            return;
        }
    }
}
function cmp(a, b, c) {
    return a <= b && b <= c;
}
function getRandomColor() {
    const r = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    const g = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    const b = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}
function DegToRad(a) {
    return a * Math.PI / 180;
}
function random(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}
function HSLToRGB(h, s, l) {
    s /= 100;
    l /= 100;
    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c / 2,
        r = 0,
        g = 0,
        b = 0;
    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
    }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return "rgb(" + r + "," + g + "," + b + ")";
}
document.onkeydown = (e) => {
    if (e.key == 'ArrowUp' || e.key == 'w' || e.key == 'W') {
        keys.w = Date.now();
    }
    if (e.key == 'ArrowLeft' || e.key == 'a' || e.key == 'A') {
        keys.a = Date.now();
    }
    if (e.key == 'ArrowDown' || e.key == 's' || e.key == 'S') {
        keys.s = Date.now();
    }
    if (e.key == 'ArrowRight' || e.key == 'd' || e.key == 'D') {
        keys.d = Date.now();
    }
    if (e.key == 'Shift') {
        keys.shift = 1;
    }
}
document.onkeyup = (e) => {
    if (e.key == 'ArrowUp' || e.key == 'w' || e.key == 'W') {
        keys.w = 0;
    }
    if (e.key == 'ArrowLeft' || e.key == 'a' || e.key == 'A') {
        keys.a = 0;
    }
    if (e.key == 'ArrowDown' || e.key == 's' || e.key == 'S') {
        keys.s = 0;
    }
    if (e.key == 'ArrowRight' || e.key == 'd' || e.key == 'D') {
        keys.d = 0;
    }
    if (e.key == 'Shift') {
        keys.shift = 0;
    }
}
function draw() {
    //draw grid
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= map.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, map.height);
        ctx.stroke();
    }
    for (let y = 0; y <= map.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(map.width, y);
        ctx.stroke();
    }

    //draw edge
    let lw = 10;
    let gdt = ctx.createLinearGradient(0, 0, cvs.width, cvs.height);
    gdt.addColorStop(1, "#f00");
    gdt.addColorStop(0, "#f0f");
    ctx.strokeStyle = gdt;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(-lw / 2, -lw / 2);
    ctx.lineTo(-lw / 2, map.height + lw / 2);
    ctx.lineTo(map.width + lw / 2, map.height + lw / 2);
    ctx.lineTo(map.width + lw / 2, -lw / 2);
    ctx.lineTo(-lw / 2, -lw / 2);
    ctx.closePath();
    ctx.stroke();

    //draw foods
    for (let i = 0; i < foods.length; i++) {
        let f = foods[i];
        if (f.type == 0) {
            ctx.fillStyle = f.dt.clr;
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.dt.r, 0, 2 * Math.PI);
            ctx.arc(f.dt.to.x, f.dt.to.y, f.dt.r, 0, 2 * Math.PI);
            ctx.fill();
            fillText(f.dt.text[0], f.x, f.y, "#ff0000");
            fillText(f.dt.text[1], f.dt.to.x, f.dt.to.y, "#ff0000");
        }
        if (f.type == 1) {
            ctx.fillStyle = f.dt.clr;
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.dt.r, 0, 2 * Math.PI);
            ctx.fill();
            fillText(f.dt.text[0], f.x, f.y, "#ff0000");
        }
        if (f.type == 2) {
            ctx.fillStyle = f.dt.clr;
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.dt.r, 0, 2 * Math.PI);
            ctx.fill();
            fillText(f.dt.text[0], f.x, f.y, "#ff0000");
        }
    }

    //draw snakes
    for (let i = snakes.length - 1; i >= 0; i--) {
        let s = snakes[i];
        for (let i = s.body.length - 1; i >= 0; i--) {
            let b = s.body[i];
            let alpha = Math.floor((1 - i / s.body.length) * 255);
            let r = rr * (1 - i / s.body.length);
            alpha = alpha.toString(16).padStart(2, '0').toLowerCase();
            ctx.fillStyle = `${s.clr}${alpha}`;
            ctx.beginPath();
            ctx.arc(b.x, b.y, r, 0, 2 * Math.PI);
            ctx.fill();
        }
        if(Date.now()-s.err[1].lastTime<s.err[1].waitTime){
            fillText('?', s.body[0].x, s.body[0].y, "#fff", `${rr}px Arial`);
        }
        else{
            fillText(s.score, s.body[0].x, s.body[0].y, "#fff", `${rr / 1.5}px Arial`);
        }
    }

    //draw fps
    if (showFps) {
        let text = `fps:${fps}`;
        ctx.font = '40px Arial';
        ctx.fillStyle = '#0f0';
        let textWidth = ctx.measureText(text).width;
        let x = cvs.width - textWidth - 5;
        let y = 40;

        ctx.fillText(text, x, y);
    }
}
function fillText(text, x, y, clr, font = `${rr * 1.3}px Arial`) {
    ctx.save();
    ctx.font = font;
    ctx.fillStyle = clr;
    let textMetrics = ctx.measureText(text);
    let textWidth = textMetrics.width;
    x -= textWidth / 2;
    y += textMetrics.actualBoundingBoxAscent / 2 - textMetrics.actualBoundingBoxDescent / 2;

    x -= camera.x;
    y -= camera.y;
    ctx.fillText(text, x, y);
    ctx.restore();
}
function bk() {
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    ctx.save();
    ctx.fillStyle = "#181818";
    ctx.fillRect(-margin, -margin, map.width + margin * 2, map.height + margin * 2);
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, map.width, map.height);
    ctx.restore();
}
function bindCamera(ctx, camera) {
    ctx._moveTo = ctx.moveTo;
    ctx._lineTo = ctx.lineTo;
    ctx._arc = ctx.arc;
    ctx._fillRect = ctx.fillRect;

    ctx.moveTo = function (x, y) {
        this._moveTo(x - camera.x, y - camera.y);
    };

    ctx.lineTo = function (x, y) {
        this._lineTo(x - camera.x, y - camera.y);
    };

    ctx.arc = function (x, y, radius, startAngle, endAngle, anticlockwise) {
        this._arc(x - camera.x, y - camera.y, radius, startAngle, endAngle, anticlockwise);
    };
    ctx.fillRect = function (x, y, w, h) {
        this._fillRect(x - camera.x, y - camera.y, w, h);
    };
}
function move() {
    for (let i = 0; i < snakes.length; i++) {
        snakes[i].move();
    }
    for (let i = 0; i < foods.length; i++) {
        foods[i].do();
    }
}
function player_move() {
    let v = 250 * (1 + keys.shift);
    let dx = 0, dy = 0;
    if ((keys.w || keys.s) && (keys.a || keys.d)) {
        v /= Math.sqrt(2);
    }
    if (keys.w || keys.s) {
        if (keys.w > keys.s) {
            dy = -v;
        } else {
            dy = v;
        }
    }
    if (keys.a || keys.d) {
        if (keys.a > keys.d) {
            dx = - v;
        } else {
            dx = v;
        }
    }
    snakes[0].dx = dx;
    snakes[0].dy = dy;
}
function updateCamera() {

    let head = snakes[0].body[0];

    let targetX = head.x + rr - camera.width / 2;
    let targetY = head.y + rr - camera.height / 2;

    camera.x = Math.max(-margin, Math.min(targetX, map.width - camera.width + margin));
    camera.y = Math.max(-margin, Math.min(targetY, map.height - camera.height + margin));

    if (map.width < camera.width) {
        camera.x = -(camera.width - map.width) / 2;
    }
    if (map.height < camera.height) {
        camera.y = -(camera.height - map.height) / 2;
    }
}
function updateFps() {
    let time = Date.now();
    if (lastTime) {
        const deltaTime = time - lastTime;
        frameCount++;
        if (deltaTime > 100) {
            fps = Math.round(frameCount * 1000 / deltaTime);
            frameCount = 0;
            lastTime = time;
        }
    }
}
function update() {
    updateFps();
    if (is_active && fps > 10) {
        player_move();
        move();
    }
    updateCamera();
    bk();
    draw();
    requestAnimationFrame(update);
}
function start(w=3000, h=3000) {
    map.width = w;
    map.height = h;
    lastTime = Date.now();
    fps = 60;
    frameCount = 0;
    cnt = 0;
    showFps = 1;
    is_active = 1;
    rr = 30;
    default_clr = "#ff0000";
    chclr.value = default_clr;
    foods = [];
    snakes = [new Snake(random(0, map.width), random(0, map.height), 0, 0, default_clr, 0)];
    for (let i = 0; i < 10; i++) {
        snakes.push(new Snake(random(0, map.width), random(0, map.height), random(-200, 200), random(-200, 200), getRandomColor(), random(1, 9)));
    }
    for (let i = 0; i < w*h/1000000*3; i++) {
        foods.push(new Food(random(rr, map.width - rr), random(rr, map.height - rr), 0,
            {
                clr: '#555555', r: rr * 1.3, text: ['🍎', 'X'],
                to: {
                    x: random(rr, map.width - rr),
                    y: random(rr, map.height - rr)
                }
            }));
    }
    for (let i = 0; i < w*h/1000000/1.5; i++) {
        foods.push(new Food(random(rr, map.width - rr), random(rr, map.height - rr), 1,
            {
                clr: '#555555', r: rr * 1.3, text: ['🍄', 'X'],
                v: {
                    dx: random(-200, 200), dy: random(-200, 200)
                }
            }));
    }
    for (let i = 0; i < w*h/1000000; i++) {
        foods.push(new Food(random(rr, map.width - rr), random(rr, map.height - rr), 2,
            {
                clr: '#555555', r: rr * 1.3, text: ['🍇', 'X'],
                v: {
                    dx: 0, dy: 0
                },
                is_shoot: 0
            }));
    }
    update();
}
bindCamera(ctx, camera);
start(1000,1000);