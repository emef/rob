var load = window.onload;
window.onload = function() {
    if(load) load(); //don't overwrite the previous onload event if it exists! just call in order
    show_init();
}

var show = {
    selected_index: -1,
    hover_index: -1,
    bgs: [], //references to bg divs
    tabs: [], //reference to tab divs
    flyouts: [], //references to flyout divs
    flyout_wrapper: document.getElementById("show_flyout"),
    bg_zindex: 100,
    flyout_zindex: 200,
    select: function(ix) {
        var sx = this.selected_index;
        if (sx == ix) return; //this tab is already selected
        if(sx > -1) {
            this.tabs[sx].className = "";
        }
        this.tabs[ix].className = "selected";
        this.bg_zindex = (this.bg_zindex + 1) % 100;
        this.bgs[ix].style.zIndex = this.bg_zindex;
        this.selected_index = ix;
        this.transition();
    },

    transition: function() {
        var bg = this.bgs[this.selected_index],
            update = function(y) {
                bg.style.top = y;
            };
        kill_animation();
        animate(-200, 0, update);

    },

    hover: function(ix) {
        var hx = this.hover_index;

        if (hx == this.selected_index) return; // ignore hover on selected tabs!

        if (ix == null) { //no args, remove hover
            console.log("MOUSEOUT");
            if (hx > -1 ) {
                this.tabs[hx].className = "";
                this.flyout();
            }
             return;
        }

        this.tabs[ix].className = "hover";
        this.flyout(ix);
        this.hover_index = ix;
    },

    flyout: function(ix) {
        var wrapper = this.flyout_wrapper,
            update = function(x) { wrapper.style.right = x; };
        if (ix == null) { //no args, fly in
            kill_animation();
            animate(0, -240, update);
            return;
        }
        
        if (ix != this.selected_index) {
            this.flyout_zindex = (this.flyout_zindex + 1) % 200;
            this.flyouts[ix].style.zIndex = this.flyout_zindex;

            kill_animation();
            animate(-240, 0, update);
        }
    }
}

function show_init() {
    var root = document.getElementById("slideshow"),
        child;

    //
    //initialize DOM object arrays in show
    //

    child = root.children[0]; //div.bgs
    show.bgs = child.children; //all child divs

    child = root.children[1]; //div.tabs
    //add all but first and last child
    for(var i=1, j=child.children.length-1; i<j; i++) {
        show.tabs.push(child.children[i]);
    }

    child = root.children[2]; //div.flyout
    show.flyout_wrapper = child;
    show.flyouts = child.children; 
    
    //
    //add event listeners
    //
    for(var i=0, j=show.tabs.length; i<j; i++) {
        show.tabs[i].onclick = (function(ix) {
            return function() {
                show.select(ix);
            }
        })(i);

        show.tabs[i].onmouseover = (function(ix) {
            return function() {
                show.hover(ix);
            }
        })(i);

        show.tabs[i].onmouseout = function() { 
            show.hover();
        }
    }
    
    show.select(0);

}

//bare bones animation:
//we have animate() and kill_animation(), that's it.

var __can_animate = false;
function animate(from, to, update, callback) {
	var diff = to - from,
	    pos = from,
	    time = window.easeTime || 100,
	    frameRate = window.easeFrameRate || 10,
	    numFrames = parseInt(time / frameRate) + 1,
	    degree_unit = 1 / numFrames,
	    frame_degree = degree_unit;

    __can_animate = true;

	(function () {
        if(!__can_animate) {
            update(to);
            callback();
            return;
        }
		update(from + diff * (2 * frame_degree / (frame_degree + 1)));
		frame_degree += degree_unit;
		if (numFrames--) {
			setTimeout(arguments.callee, frameRate);
		} else {
            if (typeof (callback) == "function") callback();
            update(to);
		}
	})();
}

function kill_animation() {
    __can_animate = false;   
}
