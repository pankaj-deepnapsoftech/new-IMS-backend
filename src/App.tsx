import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Login from "./pages/Login";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Register from "./pages/Register";
import Layout from "./pages/Layout";
import routes from "./routes/routes";
import { useSelector } from "react-redux";
import NotFound from "./pages/NotFound";

const App: React.FC = () => {
  const { allowedroutes, isSuper } = useSelector((state: any) => state.auth);

  return (
    <div className="relative min-h-[99vh] bg-gray-50">
      <div className="min-h-screen">
        <ToastContainer />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            {/* <Route path="/register" element={<Register />} /> */}
            <Route path="/" element={<Layout />}>
              {routes.map((route, ind) => {
                const isAllowed =
                  isSuper ||
                  allowedroutes.includes(route.path.replaceAll("/", ""));
                if (route.isSublink) {
                  return (
                    <Route key={ind} path={route.path} element={route.element}>
                      {route.sublink &&
                        route.sublink.map((sublink, index) => {
                          return (
                            <Route
                              key={index}
                              path={sublink.path}
                              element={sublink.element}
                            ></Route>
                          );
                        })}
                    </Route>
                  );
                } else {
                  return (
                    <Route
                      index={route.name === "Dashboard" ? true : false}
                      key={ind}
                      path={route.path}
                      element={route.element}
                    ></Route>
                  );
                }
              })}
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
};

export default App;
