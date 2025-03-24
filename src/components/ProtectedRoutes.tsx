import { Navigate } from "react-router-dom";
import { auth, firestore } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children, allowedRole }: any) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const user = auth.currentUser;

      if (user) {
        const userRef = doc(firestore, "Users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const role = userSnap.data().status;
          setUserRole(role);
        }
      }

      setLoading(false);
    };

    fetchRole();
  }, []);

  if (loading) return <div>Loading...</div>;

  // Redirect to home if user doesn't have the right role
  return userRole === allowedRole ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
