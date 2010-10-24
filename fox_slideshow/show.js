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
        var bg = this.bgs[this.selected_index];
        bg.style.top = -200;
        motion_api.animate(bg, 100, {style: {top:0}});

    },

    hover: function(ix) {
        var hx = this.hover_index,
            sx = this.selected_index;

        if (ix == null && ix != sx) { //no args, remove hover
            if (hx > -1 ) {
                this.tabs[hx].className = "";
                this.hover_index = -1;
                //this.flyout();
            }
             return;
        }

        if (ix == sx) return; // ignore hover on selected tabs!

        this.tabs[ix].className = "hover";
        //this.flyout(ix);
        this.hover_index = ix;
    },

    flyout: function(ix) {
        var wrapper = this.flyout_wrapper;

        if (ix == null) { //no args, fly in
            motion_api.animate(wrapper, 100, {style: {right: 0}}); 
            return;
        }
        
        if (ix != this.selected_index) {
            this.flyout_zindex = (this.flyout_zindex + 1) % 200;
            this.flyouts[ix].style.zIndex = this.flyout_zindex;

            motion_api.animate(wrapper, 150, {style: {right: -240}});
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

