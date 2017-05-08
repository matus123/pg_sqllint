const pathDistance = function(path1, path2) {
    const shorter = path1.length < path2.length ? path2 : path1;
    const longer = path1.length > path2.length ? path1 : path2;
    
    for (let i = 0; i < shorter.length; i++) {
        if (path1[i] !== path2[i]) {
            return i / longer.length;
        }
    }
    
    return 1;
}

module.exports = {
    pathDistance,
};
