var load = window.onload;
window.onload = function() {
    if(load) load(); //don't overwrite the previous onload event if it exists! just call in order
    show_init();
}

var show_settings = {
    transition_px: 200, //when image slides from top, how far above screen should it start
    transition_speed: 100, //ms for sliding down image animation
    flyout_speed: 150, //ms for flyout animation
    delay: 400, //ms to wait before opening/closing preview flyout
    toplevel_class: "slideshow" //ID of the element containing the slideshow ingredients
};

var show = {
    settings: show_settings,
    selected_index: -1,
    hover_index: -1,
    bgs: [], //references to bg divs
    tabs: [], //reference to tab divs
    flyouts: [], //references to flyout divs
    footers: [],
    flyout_wrapper: null,
    flyout_zindex: 200,
    flown: false,
    bg_zindex: 100,
    select: function(ix) {
        var sx = this.selected_index;
        if (sx == ix) return; //this tab is already selected
        if(sx > -1) {
            this.tabs[sx].className = "";
        }
        this.footer(ix);
        this.to_top(this.bgs, ix, this.bg_zindex, sx);
        this.tabs[ix].className = "selected";
        this.selected_index = ix;
        this.hover_index = -1;
        this.transition();
        this.fly_in();
    },

    transition: function() {
        var bg = this.bgs[this.selected_index];
        bg.style.top = "-" + show.settings.transition_px + "px";
        motion_api.animate(bg, show.settings.transition_speed, {style: {top:0}});

    },

    footer: function(ix) {
        var sx = this.selected_index;
        if(sx > -1) {
            this.footers[sx].className = "";
        }
        this.footers[ix].className = "visible";
    },

    tab_hover: function(ix) {
        var hx = this.hover_index,
            sx = this.selected_index;

        if (hx > -1 ) {
            this.tabs[hx].className = "";
        }
        if (ix != sx && ix > -1) {
            this.tabs[ix].className = "hover";
            this.hover_index = ix;
        }
    },

    fly_out: function(ix) {
        if (ix != this.selected_index) {
            var wrapper = this.flyout_wrapper;
            this.flown = true;
            this.tab_hover(ix);
            this.to_top(this.flyouts, this.hover_index, this.flyout_zindex);
            motion_api.animate(wrapper, show.settings.flyout_speed, {style: {right: 0}});
        }
    },
        
    fly_in: function() {
        var wrapper = this.flyout_wrapper;
        this.flown = false;
        motion_api.animate(wrapper, show.settings.flyout_speed, {style: {right: -240}});
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
    }
}

function show_init() {
    var root = document.getElementById(show.settings.toplevel_class || "slideshow"),
        tabs,
        child;

    //initialize DOM object arrays in show
    for(var i=0, j=root.children.length; i<j; i++) {
        child = root.children[i];
        if( has_class(child, 'bg') ) {
            show.bgs = child.children; //all child divs
        } else if ( has_class(child, 'tabs') ) {
            tabs = child;
            //add all but first and last child
            for(var i2=1, j2=tabs.children.length-1; i2<j2; i2++) {
                show.tabs.push(tabs.children[i2]);
            }
        } else if ( has_class(child, 'flyout') ) {
            show.flyout_wrapper = child;
            show.flyouts = child.children; 
            show.flyout_wrapper.style.right = "-240px";
        } else if ( has_class(child, 'footer') ) {
            show.footers = child.children;
        }
    }

    //add event listeners
    var over_tab = false, over_flyout = false, delay_timer = null;

    function set_next_action(f) {
        if(delay_timer) {
            clearTimeout(delay_timer);
        }
        delay_timer = setTimeout(f, show.settings.delay);
    }

    //clicked the flyout preview
    show.flyout_wrapper.onclick = function() {
        show.select(show.hover_index);
    }

    //moused over flyout preview, make sure to activate current tab hover
    show.flyout_wrapper.onmouseover = function() {
        over_flyout = true;
        show.tab_hover(show.hover_index);
    }

    //moused out of flyout preview, close preview if they leave mouse off for long enough
    show.flyout_wrapper.onmouseout = function() {
        over_flyout = false;
        set_next_action(function() {
            if (!over_tab && !over_flyout) {
                show.fly_in();
                show.tab_hover();
            }
        });
    }

    //setup tab mouse events
    for(var i=0, j=show.tabs.length; i<j; i++) {
        show.tabs[i].onclick = (function(ix) {
            return function() {
                show.select(ix);
            }
        })(i);

        //mouse over a tab - check state of the mouse after delay
        show.tabs[i].onmouseover = (function(ix) {
            return function() {
                show.tab_hover(ix);
                over_tab = true;
                if(show.flown) {
                    show.fly_out(ix);
                }
                set_next_action(function() {
                    if (ix != show.selected_index && (over_tab || over_flyout)) {
                        show.fly_out(show.hover_index);
                    } else {
                        show.fly_in();
                        show.tab_hover();
                    }
                });
            }
        })(i);

        //mouse out of a tab - again check state after the delay
        show.tabs[i].onmouseout = function() { 
            show.tab_hover();
            over_tab = false;
            set_next_action(function() {
                if(!over_flyout && !over_tab) {
                    show.fly_in();
                } else {
                    show.tab_hover(show.hover_index);
                }
            });
        }
    }
    
    show.select(0);

}

function has_class(obj, class_name) {
    var r = new RegExp('\s*' + class_name + '\s*');
    return r.test(obj.className);
}

