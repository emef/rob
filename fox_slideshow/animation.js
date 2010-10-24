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
        var _id = next_id(),
            animation = {
                obj: obj,
                ok: true,
                id: _id,
                finish: function() {
                    ok = false;
                }
            };

        this.animations[_id] = animation;
    }


}
