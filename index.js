const module = (function() {
    const _cache = {}, _timeouts = {};
    const _default_options = {
        "cache-time": 5 * 60, // 5 minutes
    }

    function _cache_value(id, params, value, timeout) {
        const cache    = _cache[id]    || (_cache[id]    = {});
        const timeouts = _timeouts[id] || (_timeouts[id] = {});
        const key = params.join["-"];

        cache[key] = value, timeouts[key] = timeout;

        return value;
    } 

    function _uncache_value(id, params) {
        if (_cache[id] && Array.isArray(params)) {
            const cache = _cache[id], timeouts = _timeouts[id];
            const key = params.join["-"];

            delete cache[key], delete timeouts[key];
        } else {
            delete _cache[id], delete _timeouts[id];
        }
    }

    function _get_cached_value(id, params) {
        const cache = _cache[id] || {};
        const key = params.join["-"];

        return cache[key];
    }

    function _has_cached_value(id, params) {
        const cache = _cache[id] || {};
        const key = params.join["-"];

        return cache.hasOwnProperty(key);
    }

    function _is_cache_expired(id, params) {
        const timeouts = _timeouts[id] || {};
        const key = params.join["-"];

        return Date.now() > (timeouts[key] || 0);
    }

    function _get_next_timeout(options) {
        return Date.now() + (options["cache-time"] || _default_options["cache-time"]) * 1000;
    }
    
    return {
        get: function(id, query, params, options={}) {
            if (!_has_cached_value(id, params) || _is_cache_expired(id, params)) {
                return query(...params).then((value) => {
                    _cache_value(id, params, value, _get_next_timeout(options));

                    return value;
                });
            } else {
                return Promise.resolve(_get_cached_value(id, params));
            }
        },

        invalidate: function(id, params) {
            _uncache_value(id, params);
        }
    }
})();

__MODULE__ = module;
