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
    flyout_zindex: 200,
    bg_zindex: 100,
    select: function(ix) {
        var sx = this.selected_index;
        if (sx == ix) return; //this tab is already selected
        if(sx > -1) {
            this.tabs[sx].className = "";
        }
        this.to_top(this.bgs, ix, this.bg_zindex, sx);
        this.tabs[ix].className = "selected";
        this.to_top(this.bgs, ix, this.bg_zindex, sx);
        this.selected_index = ix;
        this.hover_index = -1;
        this.transition();
    },

    transition: function() {
        var bg = this.bgs[this.selected_index];
        bg.style.top = -200;
        motion_api.animate(bg, 100, {style: {top:0}});

    },

// THIS IS BROKEN!!!
    tab_hover: function(ix) {
        var hx = this.hover_index,
            sx = this.selected_index;

        if (ix == sx) return;
        else if (ix == null) { //no args, remove hover
            if (hx > -1 ) {
                this.tabs[hx].className = "";
                this.hover_index = -1;
                //this.flyout();
            }
             return;
        }

        this.tabs[ix].className = "hover";
        //this.flyout(ix);
        this.hover_index = ix;
    },

    fly_out: function(ix) {
        var wrapper = this.flyout_wrapper;

        if (ix > 0) {
            this.to_top(this.flyouts, this.hover_index, this.flyout_zindex);
            motion_api.animate(wrapper, 150, {style: {right: 0}});
        }
    },
        
    fly_in: function() {
        console.log("flyin");
        var wrapper = this.flyout_wrapper;
        motion_api.animate(wrapper, 150, {style: {right: -240}});
    },

    to_top: function(arr, ix, base, lx) {
        for(var i=0, j=arr.length; i<j; i++) {
            if(i==ix) {
                arr[i].style.zIndex = base + 2;
            } else if(i==lx) {
                arr[i].style.zIndex = base + 1;
            } else {
                arr[i].style.zIndex = base;
            }
        }
    },
}

function show_init() {
    var root = document.getElementById("slideshow"),
        tabs,
        child;

    //
    //initialize DOM object arrays in show
    //

    child = root.children[0]; //div.bgs
    show.bgs = child.children; //all child divs

    tabs = root.children[1]; //div.tabs
    //add all but first and last child
    for(var i=1, j=tabs.children.length-1; i<j; i++) {
        show.tabs.push(tabs.children[i]);
    }

    child = root.children[2]; //div.flyout
    show.flyout_wrapper = child;
    show.flyouts = child.children; 
    show.flyout_wrapper.style.right = -240;
    
    //
    //add event listeners
    //
    var over_tab = false, over_flyout = false, flown = false;

    show.flyout_wrapper.onclick = function() {
        show.select(show.hover_index);
    }

    for(var i=0, j=show.tabs.length; i<j; i++) {
        show.tabs[i].onclick = (function(ix) {
            return function() {
                show.select(ix);
            }
        })(i);

        show.tabs[i].onmouseover = (function(ix) {
            return function() {
                show.tab_hover(ix);
            }
        })(i);

        show.tabs[i].onmouseout = function() { 
            show.tab_hover();
        }
    }
    
    show.select(0);

}

