"use strict"

// variables
var canvas, ctx, canvasWidth, canvasHeight;
var image;
var iMouseX, iMouseY = 1;
var theSelection;
var scaledImgW, scaledImgH, imgXpos;


// define Selection constructor
function Selection(x, y, w, h, focal){
    this.x = x; // initial positions
    this.y = y;
    this.w = w; // and size
    this.h = h;

    this.px = x; // extra variables to dragging calculations
    this.py = y;

    this.csize = 12; // resize cubes size
    this.cshift = 6;

    this.focal = focal;


    this.bDrag = [false, false, false, false]; // drag statuses
    this.bDragAll = false; // drag whole selection
    this.bFocalDrag = false;
}


function getOffsetRect(elem) {
    // (1)
    var box = elem.getBoundingClientRect()

    // (2)
    var body = document.body
    var docElem = document.documentElement

    // (3)
    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop
    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft

    // (4)
    var clientTop = docElem.clientTop || body.clientTop || 0
    var clientLeft = docElem.clientLeft || body.clientLeft || 0

    // (5)
    var top  = box.top +  scrollTop - clientTop
    var left = box.left + scrollLeft - clientLeft

    return { top: Math.round(top), left: Math.round(left) }
}


// define Selection draw method
Selection.prototype.draw = function(){

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.w, this.h);

    // draw part of original image
    if (this.w > 0 && this.h > 0) {
        image.width = 200;
        //ctx.drawImage(image, this.x, this.y, this.w, this.h, this.x, this.y, this.w, this.h);
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

Selection.prototype.drawFade = function () {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    //top
    ctx.fillRect(imgXpos, 0, scaledImgW, this.y);
    //left
    ctx.fillRect(imgXpos, this.y, this.x - imgXpos, this.h);
    //bottom
    ctx.fillRect(imgXpos, this.y + this.h, scaledImgW, scaledImgH - this.y - this.h);
    //right
    ctx.fillRect(imgXpos + scaledImgW, this.y, -(imgXpos + scaledImgW - this.x - this.w), this.h);
};

Selection.prototype.drawFocal = function () {
    var focal = new Image();
    focal.onload = function () {
    };
    focal.src = 'images/focal.png';
    ctx.drawImage(focal, this.focal.x, this.focal.y, this.focal.w, this.focal.w);
}

function drawScene() { // main drawScene function
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clear canvas

    ctx.fillStyle = '#323742';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // draw source image
    ctx.drawImage(image, imgXpos, 0, scaledImgW, scaledImgH);

    // draw selection
    theSelection.drawFade();
    theSelection.draw();
    theSelection.drawFocal();
}

Selection.prototype.removeResizeBoxesDrag = function () {
    for (var i = 0; i < 4; i++) {
        this.bDrag[i] = false;
    }
};

function prepareCanvas (img) {
    image = new Image();
    image.onload = function () {
        var imgW = +image.width, imgH = +image.height;
        if (imgW / canvasWidth > imgH / canvasHeight) {
            scaledImgW = canvasWidth;
            scaledImgH = canvasWidth * imgH / imgW;
        } else {
            scaledImgW = canvasHeight * imgW / imgH;
            scaledImgH = canvasHeight;
        }
        imgXpos = (canvasWidth - scaledImgW) / 2;
        theSelection = new Selection(200, 200, 200, 200, {x: 100, y: 100, w: 34});
        drawScene();
    };
    image.src = img;
}


document.addEventListener("DOMContentLoaded", function(){

    canvas = document.getElementById('panel');
    ctx = canvas.getContext('2d');



    // creating canvas and context objects
    canvasWidth = canvas.getAttribute("width");
    canvasHeight = canvas.getAttribute("height");

    //scale image
    prepareCanvas('images/image.jpg');
    //prepareCanvas('images/tulips.jpg');
    //prepareCanvas('images/wide.jpg');

    // create initial selection
    canvas.addEventListener("mousemove", dragHandler, false);
    canvas.addEventListener("mousedown", dragStartHandler, false);
    canvas.addEventListener("mouseup", dragEndHandler, false);


    canvas.addEventListener("touchmove", dragHandler, false);
    canvas.addEventListener("touchstart", dragStartHandler, false);
    canvas.addEventListener("touchend", dragEndHandler, false);


});

function dragHandler (e) { // binding mouse move event
    var canvasOffset = getOffsetRect(canvas);
    if (e.targetTouches && e.targetTouches.length == 1) { //one finger touche
        e.stopPropagation()
        var touch = e.targetTouches[0];
        iMouseX = Math.floor(touch.pageX - canvasOffset.left);
        iMouseY = Math.floor(touch.pageY - canvasOffset.top);
    } else {
        iMouseX = Math.floor(e.pageX - canvasOffset.left);
        iMouseY = Math.floor(e.pageY - canvasOffset.top);
    }

    // in case of drag of whole selector
    if (theSelection.bDragAll) {

        if (iMouseX - theSelection.px < 0) {
            theSelection.x = 0;
        } else if (iMouseX - theSelection.px > canvasWidth - theSelection.w) {
            theSelection.x = canvasWidth - theSelection.w
        } else {
            theSelection.x = iMouseX - theSelection.px
        }

        if (iMouseY - theSelection.py < 0) {
            theSelection.y = 0;
        } else if (iMouseY - theSelection.py > canvasHeight - theSelection.h) {
            theSelection.y = canvasHeight - theSelection.h
        } else {
            theSelection.y = iMouseY - theSelection.py
        }
    }



    if (theSelection.bFocalDrag) {
        theSelection.removeResizeBoxesDrag();
        theSelection.focal.x = iMouseX - theSelection.focal.w/2;
        theSelection.focal.y = iMouseY - theSelection.focal.w/2;
    }


    // in case of dragging of resize cubes
    var iFW, iFH;
    if (theSelection.bDrag[0]) {
        var iFX, iFY;


        if (iMouseX - theSelection.px < 0) {
            iFX  = 0;
        } else if (iMouseX - theSelection.px > canvasWidth - theSelection.w) {
            iFX  = canvasWidth - theSelection.w
        } else {
            iFX  = iMouseX - theSelection.px
        }

        if (iMouseY - theSelection.py < 0) {
            iFY = 0;
        } else if (iMouseY - theSelection.py > canvasHeight - theSelection.h) {
            iFY = canvasHeight - theSelection.h
        } else {
            iFY = iMouseY - theSelection.py
        }

        iFW = theSelection.w + theSelection.x - iFX;
        iFH = theSelection.h + theSelection.y - iFY;
    }


    if (theSelection.bDrag[1]) {
        var iFX, iFY;


        var iFX = theSelection.x;


        if (iMouseY - theSelection.py < 0) {
            iFY = 0;
        } else if (iMouseY - theSelection.py > canvasHeight - theSelection.h) {
            iFY = canvasHeight - theSelection.h
        } else {
            iFY = iMouseY - theSelection.py
        }


        if (theSelection.x + iMouseX - theSelection.px - iFX > canvasWidth) {
            iFW = canvasWidth - theSelection.x
        } else {
            iFW = iMouseX - theSelection.px - iFX;
        }

        iFH = theSelection.h + theSelection.y - iFY;
    }

    if (theSelection.bDrag[2]) {
        var iFX = theSelection.x;
        var iFY = theSelection.y;

        if (theSelection.x + iMouseX - theSelection.px - iFX > canvasWidth) {
            iFW = canvasWidth - theSelection.x
        } else {
            iFW = iMouseX - theSelection.px - iFX;
        }

        if (theSelection.y + iMouseY - theSelection.py - iFY > canvasHeight) {
            iFH = canvasHeight - theSelection.y
        } else {
            iFH = iMouseY - theSelection.py - iFY;
        }


    }

    if (theSelection.bDrag[3]) {
        var iFX, iFY;

        if (iMouseX - theSelection.px < 0) {
            iFX  = 0;
        } else if (iMouseX - theSelection.px > canvasWidth - theSelection.w) {
            iFX  = canvasWidth - theSelection.w
        } else {
            iFX  = iMouseX - theSelection.px
        }

        iFY = theSelection.y;

        iFW = theSelection.w + theSelection.x - iFX;

        if (theSelection.y + iMouseY - theSelection.py - iFY > canvasHeight) {
            iFH = canvasHeight - theSelection.y
        } else {
            iFH = iMouseY - theSelection.py - iFY;
        }


    }


    if (iFW > theSelection.csize * 6 && iFH > theSelection.csize * 6) {
        theSelection.w = iFW;
        theSelection.h = iFH;

        theSelection.x = iFX;
        theSelection.y = iFY;
    }


    if (theSelection.x > theSelection.focal.x) {
        theSelection.focal.x = theSelection.x;
    }

    if (theSelection.x + theSelection.w - theSelection.focal.x - theSelection.focal.w < 0) {
        theSelection.focal.x = theSelection.x + theSelection.w - theSelection.focal.w;
    }

    if (theSelection.y > theSelection.focal.y) {
        theSelection.focal.y = theSelection.y;
    }

    if (theSelection.y + theSelection.h < theSelection.focal.y + theSelection.focal.w) {
        theSelection.focal.y = theSelection.y + theSelection.h - theSelection.focal.w;
    }


    drawScene();
}
function dragStartHandler (e) { // binding mousedown event
    var canvasOffset = getOffsetRect(canvas);

    if (e.targetTouches && e.targetTouches.length == 1) { //one finger touche
        e.stopPropagation()
        var touch = e.targetTouches[0];
        iMouseX = Math.floor(touch.pageX - canvasOffset.left);
        iMouseY = Math.floor(touch.pageY - canvasOffset.top);
    } else {
        iMouseX = Math.floor(e.pageX - canvasOffset.left);
        iMouseY = Math.floor(e.pageY - canvasOffset.top);
    }




    theSelection.px = iMouseX - theSelection.x;
    theSelection.py = iMouseY - theSelection.y;




    // hovering over resize cubes
    if (iMouseX > theSelection.x + theSelection.cshift && iMouseX < theSelection.x + theSelection.cshift + 2 * theSelection.csize &&
        iMouseY > theSelection.y + theSelection.cshift && iMouseY < theSelection.y + theSelection.cshift + 2 * theSelection.csize) {

        theSelection.bDrag[0] = true;
        theSelection.px = iMouseX - theSelection.x;
        theSelection.py = iMouseY - theSelection.y;

    }

    if (iMouseX > theSelection.x + theSelection.w - theSelection.cshift - 2 * theSelection.csize && iMouseX < theSelection.x + theSelection.w - theSelection.cshift &&
        iMouseY > theSelection.y + theSelection.cshift && iMouseY < theSelection.y + theSelection.cshift + 2 * theSelection.csize) {

        theSelection.px = iMouseX - theSelection.x - theSelection.w;
        theSelection.py = iMouseY - theSelection.y;
        theSelection.bDrag[1] = true;
    }
    if (iMouseX > theSelection.x + theSelection.w - theSelection.cshift - 2 * theSelection.csize && iMouseX < theSelection.x + theSelection.w - theSelection.cshift &&
        iMouseY > theSelection.y + theSelection.h - theSelection.cshift - 2 * theSelection.csize && iMouseY < theSelection.y + theSelection.h - theSelection.cshift) {

        theSelection.px = iMouseX - theSelection.x - theSelection.w;
        theSelection.py = iMouseY - theSelection.y - theSelection.h;
        theSelection.bDrag[2] = true;
    }
    if (iMouseX > theSelection.x + theSelection.cshift && iMouseX < theSelection.x + theSelection.cshift + 2 * theSelection.csize &&
        iMouseY > theSelection.y + theSelection.h - theSelection.cshift - 2 * theSelection.csize && iMouseY < theSelection.y + theSelection.h - theSelection.cshift) {

        theSelection.px = iMouseX - theSelection.x;
        theSelection.py = iMouseY - theSelection.y - theSelection.h;
        theSelection.bDrag[3] = true;
    }








    if (iMouseX > theSelection.x + theSelection.cshift +  2 * theSelection.csize && iMouseX < theSelection.x + theSelection.w - 2 * theSelection.csize - theSelection.cshift &&
        iMouseY > theSelection.y + theSelection.cshift + 2 * theSelection.csize && iMouseY < theSelection.y + theSelection.h - 2 * theSelection.csize - theSelection.cshift) {
        theSelection.bDragAll = true;
    }



    if (iMouseX > theSelection.focal.x && iMouseX < theSelection.focal.x + theSelection.focal.w && iMouseY > theSelection.focal.y && iMouseY < theSelection.focal.y + theSelection.focal.w) {
        theSelection.removeResizeBoxesDrag();
        theSelection.bDragAll = false;

        theSelection.bFocalDrag = true;
    }
}
function dragEndHandler (e) { // binding mouseup event
    theSelection.bDragAll = false;
    theSelection.bFocalDrag = false;

    for (var i = 0; i < 4; i++) {
        theSelection.bDrag[i] = false;
    }
    theSelection.px = 0;
    theSelection.py = 0;
}

function getResults() {
    var temp_ctx, temp_canvas;
    temp_canvas = document.createElement('canvas');
    temp_ctx = temp_canvas.getContext('2d');
    temp_canvas.width = theSelection.w;
    temp_canvas.height = theSelection.h;
    temp_ctx.drawImage(image, theSelection.x, theSelection.y, theSelection.w, theSelection.h, 0, 0, theSelection.w, theSelection.h);
    var vData = temp_canvas.toDataURL();
    document.getElementById('crop_result').setAttribute('src', vData);
    document.querySelector('#results h2').textContent = 'Well done, we have prepared our cropped image, now you can save it if you wish';
}

