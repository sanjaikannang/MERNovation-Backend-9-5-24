import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
  try {
    const token = req.headers["x-auth-token"];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decodeData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodeData; // Set user information in the request

    // console.log("User Role:", req.user.role); // Log the user role

    // Check if the role is "farmer"
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ message: "Forbidden: Only farmers can perform this action" });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error!!!" });
  }
};

export default auth;
