import { useCookies } from "react-cookie";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { userExists } from "../redux/reducers/authSlice";
import Navigation from "../components/Navigation/Navigation";
import Container from "../components/Container/Container";
import Header from "../components/Header/Header";

const Layout: React.FC = () => {
  const [cookies, setCookie] = useCookies();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loginWithTokenHandler = async (token: string) => {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "auth/login",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      setCookie("access_token", data.token, { maxAge: 86400 });
      dispatch(userExists(data.user));
    } catch (err: any) {
      navigate("/login");
      toast.error(err?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if (!cookies?.access_token) {
      navigate("/login");
    } else {
      loginWithTokenHandler(cookies?.access_token);
    }
  }, []);
     
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar for Desktop */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <Navigation />
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <Navigation />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header />
          
          {/* Page Content */}
          <div className="flex-1 overflow-auto">
            <Container>
              <Outlet />
            </Container>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
