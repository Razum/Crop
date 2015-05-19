"use strict"

// variables
var canvas, ctx;
var image;
var iMouseX, iMouseY = 1;
var theSelection;

// define Selection constructor
function Selection(x, y, w, h){
    this.x = x; // initial positions
    this.y = y;
    this.w = w; // and size
    this.h = h;

    this.px = x; // extra variables to dragging calculations
    this.py = y;

    this.csize = 10; // resize cubes size
    this.cshift = 5;

    this.bHow = [false, false, false, false]; // hover statuses
    this.bDrag = [false, false, false, false]; // drag statuses
    this.bDragAll = false; // drag whole selection
}

// define Selection draw method
Selection.prototype.draw = function(){

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.w, this.h);

    // draw part of original image
    if (this.w > 0 && this.h > 0) {
        ctx.drawImage(image, this.x, this.y, this.w, this.h, this.x, this.y, this.w, this.h);
    }

    // draw resize cubes
    ctx.fillStyle = '#e1e5e5';
    ctx.fillRect(this.x + this.cshift, this.y + this.cshift, 2*this.csize, 2*this.csize);
    ctx.fillRect(this.x + this.w - 2 * this.csize - this.cshift, this.y + this.cshift, this.csize * 2, this.csize * 2);
    ctx.fillRect(this.x + this.w - 2 * this.csize - this.cshift, this.y + this.h - 2 * this.csize - this.cshift, this.csize * 2, this.csize * 2);
    ctx.fillRect(this.x + this.cshift, this.y + this.h - 2 * this.csize - this.cshift, this.csize * 2, this.csize * 2);

    ctx.fillStyle = '#000';
    ctx.fillRect(this.x + this.cshift + this.csize/2 , this.y + this.cshift + this.csize/2, this.csize, this.csize);
    ctx.fillRect(this.x + this.w - this.cshift - 1.5 * this.csize, this.y + this.cshift + this.csize/2, this.csize, this.csize);
    ctx.fillRect(this.x + this.w - this.cshift - 1.5 * this.csize, this.y + this.h - this.cshift - 1.5 * this.csize, this.csize, this.csize);
    ctx.fillRect(this.x + this.cshift + this.csize/2, this.y + this.h - this.cshift - 1.5 * this.csize, this.csize, this.csize);
};



function drawScene() { // main drawScene function
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clear canvas

    // draw source image
    ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);

    // and make it darker
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // draw selection
    theSelection.draw();
}

$(function(){
    // loading source image
    image = new Image();
    image.onload = function () {
    }
    image.src = 'images/image.jpg';


    // creating canvas and context objects
    canvas = document.getElementById('panel');
    ctx = canvas.getContext('2d');

    // create initial selection
    theSelection = new Selection(200, 200, 200, 200);

    $('#panel').mousemove(function(e) { // binding mouse move event
        var canvasOffset = $(canvas).offset();
        iMouseX = Math.floor(e.pageX - canvasOffset.left);
        iMouseY = Math.floor(e.pageY - canvasOffset.top);

        // in case of drag of whole selector
        if (theSelection.bDragAll) {
            theSelection.x = iMouseX - theSelection.px;
            theSelection.y = iMouseY - theSelection.py;
        }

        for (var i = 0; i < 4; i++) {
            theSelection.bHow[i] = false;
        }
        // hovering over resize cubes
        if (iMouseX > theSelection.x + theSelection.cshift && iMouseX < theSelection.x + theSelection.cshift + 2 * theSelection.csize &&
            iMouseY > theSelection.y + theSelection.cshift && iMouseY < theSelection.y + theSelection.cshift + 2 * theSelection.csize) {

            theSelection.bHow[0] = true;

        }
        if (iMouseX > theSelection.x + theSelection.w - theSelection.cshift - 2 * theSelection.csize && iMouseX < theSelection.x + theSelection.w - theSelection.cshift &&
            iMouseY > theSelection.y + theSelection.cshift && iMouseY < theSelection.y + theSelection.cshift + 2 * theSelection.csize) {

            theSelection.bHow[1] = true;
        }
        if (iMouseX > theSelection.x + theSelection.w - theSelection.cshift - 2 * theSelection.csize && iMouseX < theSelection.x + theSelection.w - theSelection.cshift &&
            iMouseY > theSelection.y + theSelection.h - theSelection.cshift - 2 * theSelection.csize && iMouseY < theSelection.y + theSelection.h - theSelection.cshift) {

            theSelection.bHow[2] = true;
        }
        if (iMouseX > theSelection.x + theSelection.cshift && iMouseX < theSelection.x + theSelection.cshift + 2 * theSelection.csize &&
            iMouseY > theSelection.y + theSelection.h - theSelection.cshift - 2 * theSelection.csize && iMouseY < theSelection.y + theSelection.h - theSelection.cshift) {

            theSelection.bHow[3] = true;
        }

        // in case of dragging of resize cubes
        var iFW, iFH;
        if (theSelection.bDrag[0]) {
            var iFX = iMouseX - theSelection.px;
            var iFY = iMouseY - theSelection.py;
            iFW = theSelection.w + theSelection.x - iFX;
            iFH = theSelection.h + theSelection.y - iFY;
        }
        if (theSelection.bDrag[1]) {
            var iFX = theSelection.x;
            var iFY = iMouseY - theSelection.py;
            iFW = iMouseX - theSelection.px - iFX;
            iFH = theSelection.h + theSelection.y - iFY;
        }
        if (theSelection.bDrag[2]) {
            var iFX = theSelection.x;
            var iFY = theSelection.y;
            iFW = iMouseX - theSelection.px - iFX;
            iFH = iMouseY - theSelection.py - iFY;
        }
        if (theSelection.bDrag[3]) {
            var iFX = iMouseX - theSelection.px;
            var iFY = theSelection.y;
            iFW = theSelection.w + theSelection.x - iFX;
            iFH = iMouseY - theSelection.py - iFY;
        }

        if (iFW > theSelection.csize * 6 && iFH > theSelection.csize * 6) {
            theSelection.w = iFW;
            theSelection.h = iFH;

            theSelection.x = iFX;
            theSelection.y = iFY;
        }

        drawScene();
    });

    $('#panel').mousedown(function(e) { // binding mousedown event
        var canvasOffset = $(canvas).offset();
        iMouseX = Math.floor(e.pageX - canvasOffset.left);
        iMouseY = Math.floor(e.pageY - canvasOffset.top);

        theSelection.px = iMouseX - theSelection.x;
        theSelection.py = iMouseY - theSelection.y;

        if (theSelection.bHow[0]) {
            theSelection.px = iMouseX - theSelection.x;
            theSelection.py = iMouseY - theSelection.y;
        }
        if (theSelection.bHow[1]) {
            theSelection.px = iMouseX - theSelection.x - theSelection.w;
            theSelection.py = iMouseY - theSelection.y;
        }
        if (theSelection.bHow[2]) {
            theSelection.px = iMouseX - theSelection.x - theSelection.w;
            theSelection.py = iMouseY - theSelection.y - theSelection.h;
        }
        if (theSelection.bHow[3]) {
            theSelection.px = iMouseX - theSelection.x;
            theSelection.py = iMouseY - theSelection.y - theSelection.h;
        }


        if (iMouseX > theSelection.x + theSelection.cshift +  2 * theSelection.csize && iMouseX < theSelection.x + theSelection.w - 2 * theSelection.csize - theSelection.cshift &&
            iMouseY > theSelection.y + theSelection.cshift + 2 * theSelection.csize && iMouseY < theSelection.y + theSelection.h - 2 * theSelection.csize - theSelection.cshift) {

            theSelection.bDragAll = true;
        }

        for (var i = 0; i < 4; i++) {
            if (theSelection.bHow[i]) {
                theSelection.bDrag[i] = true;
            }
        }
    });

    $('#panel').mouseup(function(e) { // binding mouseup event
        theSelection.bDragAll = false;

        for (var i = 0; i < 4; i++) {
            theSelection.bDrag[i] = false;
        }
        theSelection.px = 0;
        theSelection.py = 0;
    });

    drawScene();
});

function getResults() {
    var temp_ctx, temp_canvas;
    temp_canvas = document.createElement('canvas');
    temp_ctx = temp_canvas.getContext('2d');
    temp_canvas.width = theSelection.w;
    temp_canvas.height = theSelection.h;
    temp_ctx.drawImage(image, theSelection.x, theSelection.y, theSelection.w, theSelection.h, 0, 0, theSelection.w, theSelection.h);
    var vData = temp_canvas.toDataURL();
    $('#crop_result').attr('src', vData);
    $('#results h2').text('Well done, we have prepared our cropped image, now you can save it if you wish');
}

