interface checkAccessProps{
    auth ?: { [key: string]: any },
    route: string
}

const checkAccess = ({auth, route}: checkAccessProps)=>{
    if(!auth){
        return false;
    }

    const isSuperAdmin = auth.isSuper;
    const permittedRoutes = auth.allowedroutes || [];

    if(isSuperAdmin || permittedRoutes.includes(route)){
        return true;
    }

    return false;
}

export default checkAccess;