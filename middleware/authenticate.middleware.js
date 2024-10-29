exports.isAuthenticated = (req, res, next) => {};

exports.isSuperAdmin = (req, res, next) => {
    if(req.user.admin) {
        next ();
    } else {
        err = new Error ("Not super admin");
        err.status = 403;
        next (err);
    }
};

exports.isUser = (req, res, next) => {};