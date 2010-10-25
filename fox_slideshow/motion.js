var motion_api = {
    animations: {},
    
    next_id: (function() {
        var _id = 0;
        return function() {
            return _id++;
        }
    })(),
    
    finish: function(c) {
        if (typeof(c) == "object") {
            for(var i=0, j = this.animations.length; i<j; i++) {
                if (this.animations[i].obj == c) {
                    this.animations[i].finish();
                }
            }
        } else {
            if(this.animations[c]) {
                this.animations[c].finish();
            }
        }
    },

    animate: function(obj, ms, dest_obj, callback) {
        var _id = this.next_id(),
            diffs = {},
	        frameRate = window.easeFrameRate || 10,
	        numFrames = parseInt(ms / frameRate) + 1,
	        degree_unit = 1 / numFrames,
            frame_degree = degree_unit,
            animations = this.animations,
	        animation = {
                obj: obj,
                ok: true,
                id: _id,
                update: function(progress) {
                    (function(obj, diffs) {
                        for(var i in diffs) {
                            if(typeof(diffs[i]) == 'object' && !diffs[i]._dest) {
                                arguments.callee(obj[i], diffs[i]);
                            } else {
                                obj[i] = diffs[i]._origin + progress* diffs[i]._dest + "px";
                            }
                        }
                    })(obj, diffs);
                },
                finish: function() {
                    ok = false;
                    if (typeof (callback) == "function") callback();
                    this.update(1);
                    delete animations[_id];
                    animations[_id] = null;
                },
        };

        //kill existing animations first
        for(var i=0, j=this.animations.length; i<j; i++) {
            if(this.animations[i].obj == obj) {
                this.animations[i].finish();
            }
        }

        //calculate diffs
        (function get_diffs(obj, dest_obj, diffs) {
            for(var i in dest_obj) {
                if(typeof(dest_obj[i]) == "object") {
                    diffs[i] = {};
                    get_diffs(obj[i], dest_obj[i], diffs[i]);
                } else {
                    var origin = get_pixels(obj[i]),
                        destination = get_pixels(dest_obj[i]);
                    diffs[i] = { _origin: origin, _dest: destination - origin };
                }
            }
        })(obj, dest_obj, diffs);
        
        (function () {
            if(!animation.ok) {
                animation.finish();
                return;
            }
            animation.update(2 * frame_degree / (frame_degree + 1));
            frame_degree += degree_unit;
            if (numFrames--) {
                setTimeout(arguments.callee, frameRate);
            } else {
                animation.finish();
            }
        })();

        this.animations[_id] = animation;
        return _id;
    }
}

function get_pixels(obj) {
    if (typeof(obj) == 'string') {
        return parseInt(obj.replace(/px/, ''));
    }
    return obj;
}
